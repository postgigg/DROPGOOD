/**
 * Security Headers Middleware
 * Implements modern security headers to protect against common web vulnerabilities
 */

export interface SecurityHeadersConfig {
  enableCSP?: boolean;
  allowedOrigins?: string[];
  enableHSTS?: boolean;
  maxAge?: number;
}

/**
 * Get comprehensive security headers
 */
export function getSecurityHeaders(config: SecurityHeadersConfig = {}): HeadersInit {
  const {
    enableCSP = true,
    allowedOrigins = [],
    enableHSTS = true,
    maxAge = 31536000, // 1 year
  } = config;

  const headers: Record<string, string> = {
    // Prevent clickjacking attacks
    'X-Frame-Options': 'DENY',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Enable XSS protection in older browsers
    'X-XSS-Protection': '1; mode=block',

    // Control referrer information
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy (formerly Feature-Policy)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',

    // Prevent browser caching of sensitive data
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  // HTTP Strict Transport Security (force HTTPS)
  if (enableHSTS) {
    headers['Strict-Transport-Security'] = `max-age=${maxAge}; includeSubDomains; preload`;
  }

  // Content Security Policy
  if (enableCSP) {
    headers['Content-Security-Policy'] = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://api.mapbox.com",
      "style-src 'self' 'unsafe-inline' https://api.mapbox.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mapbox.com https://events.mapbox.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; ');
  }

  // CORS headers
  if (allowedOrigins.length > 0) {
    // Don't set these here - they should be set by CORS middleware based on request origin
  }

  return headers;
}

/**
 * Get CORS headers based on request origin
 */
export function getCORSHeaders(requestOrigin: string | null, allowedOrigins: string[]): HeadersInit {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-Request-ID',
    'Access-Control-Max-Age': '86400', // 24 hours
  };

  // Check if origin is allowed
  if (requestOrigin && (allowedOrigins.includes(requestOrigin) || allowedOrigins.includes('*'))) {
    headers['Access-Control-Allow-Origin'] = requestOrigin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  } else if (allowedOrigins.includes('*')) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  // Add Vary header to prevent caching issues
  headers['Vary'] = 'Origin';

  return headers;
}

/**
 * Enhanced CORS handler with origin validation
 */
export function handleSecureCors(
  req: Request,
  allowedOrigins: string[] = ['*']
): Response | null {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    const corsHeaders = getCORSHeaders(origin, allowedOrigins);
    const securityHeaders = getSecurityHeaders({ enableHSTS: false }); // No HSTS for OPTIONS

    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        ...securityHeaders,
      },
    });
  }

  return null;
}

/**
 * Create a secure response with all security headers
 */
export function secureResponse(
  data: any,
  status: number = 200,
  additionalHeaders: HeadersInit = {},
  config: SecurityHeadersConfig = {}
): Response {
  const origin = config.allowedOrigins?.[0] || '*';

  return new Response(
    typeof data === 'string' ? data : JSON.stringify(data),
    {
      status,
      headers: {
        ...getSecurityHeaders(config),
        ...getCORSHeaders(origin, config.allowedOrigins || ['*']),
        'Content-Type': 'application/json',
        ...additionalHeaders,
      },
    }
  );
}

/**
 * Create error response with security headers
 */
export function secureErrorResponse(
  message: string,
  status: number = 400,
  config: SecurityHeadersConfig = {}
): Response {
  return secureResponse(
    { error: message },
    status,
    {},
    config
  );
}
