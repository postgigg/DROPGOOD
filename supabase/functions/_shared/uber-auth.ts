const UBER_TOKEN_URL = 'https://auth.uber.com/oauth/v2/token';
const UBER_API_BASE = 'https://api.uber.com/v1';

interface UberTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getUberAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token;
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch(UBER_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials&scope=eats.deliveries',
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Uber OAuth failed: ${response.status} - ${error}`);
  }

  const data: UberTokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  };

  return data.access_token;
}

export async function makeUberRequest(
  endpoint: string,
  options: {
    method: string;
    body?: any;
    clientId: string;
    clientSecret: string;
  }
): Promise<any> {
  const token = await getUberAccessToken(options.clientId, options.clientSecret);

  const response = await fetch(`${UBER_API_BASE}${endpoint}`, {
    method: options.method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const responseData = await response.json();

  if (!response.ok) {
    console.error('Uber API Error:', responseData);
    throw new Error(responseData.message || 'Uber API request failed');
  }

  return responseData;
}
