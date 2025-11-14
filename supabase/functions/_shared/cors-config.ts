/**
 * CORS Configuration
 * Centralized CORS settings with environment-based allowed origins
 */

/**
 * Get allowed origins based on environment
 */
export function getAllowedOrigins(): string[] {
  const customOrigins = Deno.env.get('ALLOWED_ORIGINS');

  if (customOrigins) {
    return customOrigins.split(',').map(origin => origin.trim());
  }

  // Default allowed origins for development and production
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
  ];

  // Add production domain if available
  const productionDomain = Deno.env.get('PRODUCTION_DOMAIN');
  if (productionDomain) {
    defaultOrigins.push(productionDomain);
    defaultOrigins.push(`https://${productionDomain}`);
    defaultOrigins.push(`https://www.${productionDomain}`);
  }

  return defaultOrigins;
}

/**
 * Check if origin is allowed
 */
export function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;

  const allowedOrigins = getAllowedOrigins();

  // Check for wildcard
  if (allowedOrigins.includes('*')) return true;

  // Check exact match
  return allowedOrigins.includes(origin);
}

/**
 * Get CORS headers for response
 */
export function getCORSResponseHeaders(requestOrigin: string | null): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Request-ID',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };

  // Only set origin if it's allowed
  if (requestOrigin && isOriginAllowed(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (getAllowedOrigins().includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

/**
 * Updated CORS handler with proper origin validation
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('origin');
    const corsHeaders = getCORSResponseHeaders(origin);

    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return null;
}

/**
 * JSON response with CORS headers
 */
export function jsonResponse(data: any, status: number = 200, req?: Request): Response {
  const origin = req?.headers.get('origin') || null;
  const corsHeaders = getCORSResponseHeaders(origin);

  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Error response with CORS headers
 */
export function errorResponse(message: string, status: number = 400, req?: Request): Response {
  return jsonResponse({ error: message }, status, req);
}
