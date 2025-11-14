/**
 * Input Validation Middleware
 * Protects against SQL injection, XSS, and malicious inputs
 */

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
  /(--|;|\/\*|\*\/|xp_|sp_)/gi,
  /('|(\\')|(;)|(--)|(\/\*))/gi,
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
];

// Path traversal patterns
const PATH_TRAVERSAL_PATTERNS = [
  /\.\.\//g,
  /\.\.\\/g,
];

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

/**
 * Validates and sanitizes input data
 */
export function validateInput(data: any, options: {
  allowHtml?: boolean;
  maxLength?: number;
  fieldName?: string;
} = {}): ValidationResult {
  const errors: string[] = [];
  const { allowHtml = false, maxLength = 10000, fieldName = 'input' } = options;

  if (typeof data === 'string') {
    // Check length
    if (data.length > maxLength) {
      errors.push(`${fieldName} exceeds maximum length of ${maxLength} characters`);
    }

    // Check for SQL injection attempts
    for (const pattern of SQL_INJECTION_PATTERNS) {
      if (pattern.test(data)) {
        errors.push(`${fieldName} contains suspicious SQL patterns`);
        break;
      }
    }

    // Check for XSS attempts (if HTML not allowed)
    if (!allowHtml) {
      for (const pattern of XSS_PATTERNS) {
        if (pattern.test(data)) {
          errors.push(`${fieldName} contains suspicious script patterns`);
          break;
        }
      }
    }

    // Check for path traversal
    for (const pattern of PATH_TRAVERSAL_PATTERNS) {
      if (pattern.test(data)) {
        errors.push(`${fieldName} contains path traversal patterns`);
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? data.trim() : undefined,
    };
  }

  if (typeof data === 'object' && data !== null) {
    const sanitizedData: any = Array.isArray(data) ? [] : {};

    for (const [key, value] of Object.entries(data)) {
      const result = validateInput(value, { ...options, fieldName: key });

      if (!result.isValid) {
        errors.push(...result.errors);
      } else {
        sanitizedData[key] = result.sanitizedData;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedData: errors.length === 0 ? sanitizedData : undefined,
    };
  }

  return {
    isValid: true,
    errors: [],
    sanitizedData: data,
  };
}

/**
 * Validates email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

/**
 * Validates phone number (US format)
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?1?\s*\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Validates UUID format
 */
export function validateUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Sanitizes text for safe storage and display
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, match => match === '"' ? '&quot;' : '&#39;') // Escape quotes
    .trim();
}

/**
 * Validates monetary amount
 */
export function validateAmount(amount: number): boolean {
  return typeof amount === 'number' &&
         amount >= 0 &&
         amount <= 100000 && // Max $1000
         !isNaN(amount) &&
         isFinite(amount);
}

/**
 * Detects suspicious request patterns
 */
export function detectSuspiciousPatterns(data: any): string[] {
  const suspiciousPatterns: string[] = [];
  const dataString = JSON.stringify(data).toLowerCase();

  // Check for common attack patterns
  if (dataString.includes('union select')) {
    suspiciousPatterns.push('SQL_UNION_ATTACK');
  }
  if (dataString.includes('base64')) {
    suspiciousPatterns.push('BASE64_ENCODING');
  }
  if (dataString.includes('eval(')) {
    suspiciousPatterns.push('EVAL_ATTEMPT');
  }
  if (dataString.match(/<script|javascript:|onerror=/)) {
    suspiciousPatterns.push('XSS_ATTEMPT');
  }
  if (dataString.includes('../') || dataString.includes('..\\')) {
    suspiciousPatterns.push('PATH_TRAVERSAL');
  }

  return suspiciousPatterns;
}
