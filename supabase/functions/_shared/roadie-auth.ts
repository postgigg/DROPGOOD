/**
 * Roadie API Authentication Helper
 * Handles Bearer token authentication for Roadie API requests
 */

const ROADIE_API_BASE_URL = 'https://connect.roadie.com/v1';

interface RoadieRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
}

interface RoadieResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
}

/**
 * Make authenticated request to Roadie API
 */
export async function makeRoadieRequest<T = any>(
  endpoint: string,
  options: RoadieRequestOptions = {}
): Promise<RoadieResponse<T>> {
  const roadieToken = Deno.env.get('ROADIE_API_TOKEN');

  if (!roadieToken) {
    return {
      success: false,
      error: 'ROADIE_API_TOKEN not configured in environment',
      status: 500
    };
  }

  const url = `${ROADIE_API_BASE_URL}${endpoint}`;
  const method = options.method || 'GET';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${roadieToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers
  };

  try {
    console.log(`🚗 Roadie API ${method} ${endpoint}`);

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

    console.log(`Roadie API response status: ${response.status}`);
    console.log(`Roadie API response:`, responseText);

    if (!response.ok) {
      return {
        success: false,
        error: `Roadie API error: ${response.status} - ${responseText}`,
        status: response.status
      };
    }

    let data: T;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('Failed to parse Roadie response:', parseError);
      return {
        success: false,
        error: 'Invalid JSON response from Roadie',
        status: response.status
      };
    }

    return {
      success: true,
      data,
      status: response.status
    };
  } catch (error) {
    console.error('Roadie API request failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      status: 500
    };
  }
}

/**
 * Helper function to format address for Roadie API
 */
export function formatRoadieAddress(address: {
  street?: string;
  street1?: string;
  city?: string;
  state?: string;
  zip?: string;
  zip_code?: string;
  country?: string;
}) {
  return {
    street1: address.street || address.street1 || '',
    city: address.city || '',
    state: address.state || '',
    zip: address.zip || address.zip_code || '',
    country: address.country || 'US'
  };
}

/**
 * Helper function to format contact info for Roadie API
 */
export function formatRoadieContact(contact: {
  name?: string;
  phone?: string;
  email?: string;
}) {
  const formatted: any = {
    name: contact.name || 'Customer',
  };

  if (contact.phone) {
    // Format phone to just digits (Roadie accepts 10-digit phone numbers)
    const digitsOnly = contact.phone.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      formatted.phone = digitsOnly;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      formatted.phone = digitsOnly.substring(1);
    }
  }

  if (contact.email) {
    formatted.email = contact.email;
  }

  return formatted;
}

/**
 * Validate Roadie API configuration
 */
export function validateRoadieConfig(): { valid: boolean; error?: string } {
  const roadieToken = Deno.env.get('ROADIE_API_TOKEN');

  if (!roadieToken) {
    return {
      valid: false,
      error: 'ROADIE_API_TOKEN not set in environment variables'
    };
  }

  if (roadieToken.length < 20) {
    return {
      valid: false,
      error: 'ROADIE_API_TOKEN appears to be invalid (too short)'
    };
  }

  return { valid: true };
}
