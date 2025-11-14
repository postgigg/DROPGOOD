/**
 * Request Guard Middleware
 * Protects against oversized requests, timeouts, and resource exhaustion
 */

export interface RequestGuardConfig {
  maxBodySize?: number; // in bytes
  maxUrlLength?: number;
  maxHeaderSize?: number;
  timeout?: number; // in milliseconds
}

const DEFAULT_CONFIG: Required<RequestGuardConfig> = {
  maxBodySize: 10 * 1024 * 1024, // 10MB
  maxUrlLength: 2048,
  maxHeaderSize: 8192,
  timeout: 30000, // 30 seconds
};

/**
 * Check request size limits
 */
export async function checkRequestSizeLimits(
  req: Request,
  config: RequestGuardConfig = {}
): Promise<{ allowed: boolean; reason?: string; oversized?: boolean }> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Check URL length
  if (req.url.length > finalConfig.maxUrlLength) {
    return {
      allowed: false,
      reason: `URL exceeds maximum length of ${finalConfig.maxUrlLength} characters`,
      oversized: true,
    };
  }

  // Check header size
  let totalHeaderSize = 0;
  req.headers.forEach((value, key) => {
    totalHeaderSize += key.length + value.length;
  });

  if (totalHeaderSize > finalConfig.maxHeaderSize) {
    return {
      allowed: false,
      reason: `Headers exceed maximum size of ${finalConfig.maxHeaderSize} bytes`,
      oversized: true,
    };
  }

  // Check content length
  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > finalConfig.maxBodySize) {
    return {
      allowed: false,
      reason: `Request body exceeds maximum size of ${finalConfig.maxBodySize} bytes`,
      oversized: true,
    };
  }

  return { allowed: true };
}

/**
 * Read request body with size limit
 */
export async function readBodyWithLimit(
  req: Request,
  maxSize: number = DEFAULT_CONFIG.maxBodySize
): Promise<{ success: true; data: any } | { success: false; error: string }> {
  try {
    // Clone request to avoid consuming the body
    const clonedReq = req.clone();

    // Read body as text first to check size
    const bodyText = await clonedReq.text();

    if (bodyText.length > maxSize) {
      return {
        success: false,
        error: `Request body size ${bodyText.length} exceeds maximum of ${maxSize} bytes`,
      };
    }

    // Parse JSON
    try {
      const data = JSON.parse(bodyText);
      return { success: true, data };
    } catch (e) {
      return {
        success: false,
        error: 'Invalid JSON in request body',
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read request body',
    };
  }
}

/**
 * Execute request with timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = DEFAULT_CONFIG.timeout,
  errorMessage: string = 'Request timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

/**
 * Request guard middleware that combines all protections
 */
export async function requestGuardMiddleware(
  req: Request,
  config: RequestGuardConfig = {}
): Promise<Response | null> {
  // Check size limits
  const sizeCheck = await checkRequestSizeLimits(req, config);
  if (!sizeCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Request rejected',
        reason: sizeCheck.reason,
      }),
      {
        status: 413, // Payload Too Large
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  return null;
}

/**
 * Safe environment variable access (prevents logging sensitive data)
 */
export function getSafeEnvVar(name: string, redact: boolean = true): string | undefined {
  const value = Deno.env.get(name);

  if (!value) return undefined;

  // Don't return full value for sensitive vars in logs
  if (redact && (
    name.includes('SECRET') ||
    name.includes('KEY') ||
    name.includes('TOKEN') ||
    name.includes('PASSWORD')
  )) {
    return '[REDACTED]';
  }

  return value;
}

/**
 * Log request safely (without exposing sensitive data)
 */
export function logRequestSafely(req: Request, additionalInfo?: Record<string, any>): void {
  const url = new URL(req.url);

  const logData = {
    method: req.method,
    path: url.pathname,
    timestamp: new Date().toISOString(),
    userAgent: req.headers.get('user-agent')?.substring(0, 100), // Truncate
    ip: req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        'unknown',
    ...additionalInfo,
  };

  // Remove any sensitive data from additionalInfo
  if (logData.authorization) delete logData.authorization;
  if (logData.apikey) delete logData.apikey;
  if (logData.secret) delete logData.secret;
  if (logData.password) delete logData.password;
  if (logData.token) delete logData.token;

  console.log('REQUEST:', JSON.stringify(logData));
}

/**
 * Sanitize error for client response (prevent info leakage)
 */
export function sanitizeError(error: any, isDevelopment: boolean = false): {
  error: string;
  details?: any;
} {
  if (isDevelopment) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
    };
  }

  // Production: generic error messages only
  const genericMessages: Record<string, string> = {
    'unauthorized': 'Authentication required',
    'forbidden': 'Access denied',
    'not found': 'Resource not found',
    'invalid': 'Invalid request',
  };

  const errorMessage = error instanceof Error ? error.message.toLowerCase() : '';

  for (const [key, message] of Object.entries(genericMessages)) {
    if (errorMessage.includes(key)) {
      return { error: message };
    }
  }

  return { error: 'An error occurred while processing your request' };
}
