/**
 * DoorDash Drive API Authentication Helper
 * Handles JWT token generation with HMAC SHA256 signing
 *
 * DoorDash requires a custom JWT with:
 * - Header: "dd-ver": "DD-JWT-V1"
 * - Claims: aud, iss (developer_id), kid (key_id), exp, iat
 * - Signing: HMAC SHA256 with base64-decoded signing_secret
 */

const DOORDASH_API_BASE_URL = 'https://openapi.doordash.com';

interface DoorDashConfig {
  developerId: string;
  keyId: string;
  signingSecret: string;
  environment: 'sandbox' | 'production';
}

interface DoorDashRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface DoorDashResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Get DoorDash configuration from environment variables
 */
export function getDoorDashConfig(): DoorDashConfig {
  const developerId = Deno.env.get('DOORDASH_DEVELOPER_ID');
  const keyId = Deno.env.get('DOORDASH_KEY_ID');
  const signingSecret = Deno.env.get('DOORDASH_SIGNING_SECRET');
  const environment = (Deno.env.get('DOORDASH_ENVIRONMENT') || 'sandbox') as 'sandbox' | 'production';

  if (!developerId || !keyId || !signingSecret) {
    throw new Error('Missing DoorDash credentials in environment variables');
  }

  return {
    developerId,
    keyId,
    signingSecret,
    environment
  };
}

/**
 * Base64 URL encode (without padding)
 */
function base64UrlEncode(data: string): string {
  const base64 = btoa(data);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Generate DoorDash JWT token
 * Expires in 300 seconds (5 minutes) as per DoorDash requirements
 */
export async function generateDoorDashJWT(config?: DoorDashConfig): Promise<string> {
  const ddConfig = config || getDoorDashConfig();

  // JWT Header with DoorDash-specific version
  const header = {
    alg: 'HS256',
    typ: 'JWT',
    'dd-ver': 'DD-JWT-V1'
  };

  // JWT Payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: 'doordash',
    iss: ddConfig.developerId,
    kid: ddConfig.keyId,
    exp: now + 300, // 5 minutes expiration
    iat: now
  };

  // Encode header and payload
  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(payload));
  const dataToSign = `${headerEncoded}.${payloadEncoded}`;

  // Decode signing secret from base64
  const secretBytes = Uint8Array.from(atob(ddConfig.signingSecret), c => c.charCodeAt(0));

  // Import key for HMAC SHA256
  const key = await crypto.subtle.importKey(
    'raw',
    secretBytes,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  // Sign the data
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(dataToSign)
  );

  // Convert signature to base64url
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureBase64 = btoa(String.fromCharCode(...signatureArray));
  const signatureEncoded = signatureBase64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  // Return complete JWT
  return `${dataToSign}.${signatureEncoded}`;
}

/**
 * Make authenticated request to DoorDash Drive API
 */
export async function makeDoorDashRequest<T = any>(
  endpoint: string,
  options: DoorDashRequestOptions = {}
): Promise<DoorDashResponse<T>> {
  try {
    const config = getDoorDashConfig();
    const jwt = await generateDoorDashJWT(config);

    const url = `${DOORDASH_API_BASE_URL}${endpoint}`;
    const method = options.method || 'GET';

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${jwt}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    console.log(`🚗 DoorDash API ${method} ${endpoint}`);

    const fetchOptions: RequestInit = {
      method,
      headers,
    };

    if (options.body && (method === 'POST' || method === 'PUT')) {
      fetchOptions.body = JSON.stringify(options.body);
      console.log('Request body:', JSON.stringify(options.body, null, 2));
    }

    const response = await fetch(url, fetchOptions);
    const responseText = await response.text();

    console.log(`DoorDash API response status: ${response.status}`);
    console.log(`DoorDash API response:`, responseText);

    if (!response.ok) {
      return {
        success: false,
        error: `DoorDash API error: ${response.status} - ${responseText}`,
        status: response.status
      };
    }

    let data: T;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('Failed to parse DoorDash response:', parseError);
      return {
        success: false,
        error: 'Invalid JSON response from DoorDash',
        status: response.status
      };
    }

    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('DoorDash API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
}

/**
 * Helper function to format address for DoorDash API
 */
export function formatDoorDashAddress(address: {
  street?: string;
  street1?: string;
  city?: string;
  state?: string;
  zip?: string;
  zip_code?: string;
  country?: string;
}) {
  return {
    street: address.street || address.street1 || '',
    city: address.city || '',
    state: address.state || '',
    zip_code: address.zip || address.zip_code || '',
    country: address.country || 'US'
  };
}

/**
 * Helper function to format phone number for DoorDash API
 * DoorDash expects E.164 format: +1XXXXXXXXXX
 */
export function formatDoorDashPhone(phone: string): string {
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');

  // If 10 digits, add +1 prefix
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`;
  }

  // If 11 digits starting with 1, add + prefix
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`;
  }

  // Already formatted or international
  if (phone.startsWith('+')) {
    return phone;
  }

  // Default: add +1 prefix
  return `+1${digitsOnly}`;
}

/**
 * Validate DoorDash API configuration
 */
export function validateDoorDashConfig(): { valid: boolean; error?: string } {
  try {
    const config = getDoorDashConfig();

    if (!config.developerId || config.developerId.length < 10) {
      return {
        valid: false,
        error: 'DOORDASH_DEVELOPER_ID appears to be invalid or missing'
      };
    }

    if (!config.keyId || config.keyId.length < 10) {
      return {
        valid: false,
        error: 'DOORDASH_KEY_ID appears to be invalid or missing'
      };
    }

    if (!config.signingSecret || config.signingSecret.length < 20) {
      return {
        valid: false,
        error: 'DOORDASH_SIGNING_SECRET appears to be invalid or missing'
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Configuration validation failed'
    };
  }
}
