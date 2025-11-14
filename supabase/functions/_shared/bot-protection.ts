/**
 * Bot Protection and Anti-Spam Mechanisms
 * Includes honeypot detection, fingerprinting, and behavioral analysis
 */

/**
 * Honeypot field validation
 * Honeypot fields should be empty (hidden from humans, filled by bots)
 */
export function validateHoneypot(data: any): {
  isBot: boolean;
  reason?: string;
} {
  const honeypotFields = [
    'website',
    'url',
    'homepage',
    'company_name', // If not expected in your forms
    'fax',
    'alternative_email',
  ];

  for (const field of honeypotFields) {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      return {
        isBot: true,
        reason: `Honeypot field '${field}' was filled`,
      };
    }
  }

  return { isBot: false };
}

/**
 * Time-based submission validation
 * Bots typically submit forms too quickly
 */
export function validateSubmissionTiming(
  formLoadTime: number,
  minSeconds: number = 3,
  maxSeconds: number = 3600
): {
  isBot: boolean;
  reason?: string;
} {
  const submissionTime = Date.now();
  const timeDiff = (submissionTime - formLoadTime) / 1000;

  if (timeDiff < minSeconds) {
    return {
      isBot: true,
      reason: `Form submitted too quickly (${timeDiff.toFixed(2)}s)`,
    };
  }

  if (timeDiff > maxSeconds) {
    return {
      isBot: true,
      reason: `Form submission took too long (${timeDiff.toFixed(2)}s)`,
    };
  }

  return { isBot: false };
}

/**
 * User agent analysis for bot detection
 */
export function analyzeUserAgent(userAgent: string): {
  isBot: boolean;
  confidence: number;
  reason?: string;
} {
  if (!userAgent || userAgent.length === 0) {
    return {
      isBot: true,
      confidence: 0.9,
      reason: 'Missing user agent',
    };
  }

  // Known bot user agents
  const botPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java(?!script)/i,
    /go-http/i,
    /axios/i,
    /fetch/i,
  ];

  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return {
        isBot: true,
        confidence: 0.8,
        reason: 'User agent matches bot pattern',
      };
    }
  }

  // Suspicious characteristics
  if (userAgent.length < 20) {
    return {
      isBot: true,
      confidence: 0.7,
      reason: 'User agent too short',
    };
  }

  if (userAgent.length > 500) {
    return {
      isBot: true,
      confidence: 0.6,
      reason: 'User agent abnormally long',
    };
  }

  return {
    isBot: false,
    confidence: 0,
  };
}

/**
 * Request fingerprinting for duplicate detection
 */
export function generateRequestFingerprint(req: Request, body?: any): string {
  const ip = req.headers.get('cf-connecting-ip') ||
             req.headers.get('x-forwarded-for')?.split(',')[0] ||
             'unknown';

  const userAgent = req.headers.get('user-agent') || '';
  const acceptLanguage = req.headers.get('accept-language') || '';

  const bodyHash = body ? JSON.stringify(body) : '';

  const fingerprint = `${ip}|${userAgent}|${acceptLanguage}|${bodyHash}`;

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return hash.toString(36);
}

/**
 * Duplicate submission detector
 */
export class DuplicateSubmissionDetector {
  private submissions = new Map<string, number>();
  private readonly windowMs: number;

  constructor(windowMs: number = 60000) {
    this.windowMs = windowMs;

    // Cleanup every minute
    setInterval(() => this.cleanup(), 60000);
  }

  isDuplicate(fingerprint: string): boolean {
    const now = Date.now();
    const lastSubmission = this.submissions.get(fingerprint);

    if (lastSubmission && (now - lastSubmission) < this.windowMs) {
      return true;
    }

    this.submissions.set(fingerprint, now);
    return false;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [fingerprint, timestamp] of this.submissions.entries()) {
      if (now - timestamp > this.windowMs) {
        this.submissions.delete(fingerprint);
      }
    }
  }
}

const duplicateDetector = new DuplicateSubmissionDetector();

/**
 * Comprehensive bot detection
 */
export interface BotDetectionResult {
  isBot: boolean;
  confidence: number;
  reasons: string[];
  shouldBlock: boolean;
}

export function detectBot(req: Request, data: any, formLoadTime?: number): BotDetectionResult {
  const reasons: string[] = [];
  let confidence = 0;

  // Check honeypot
  const honeypotResult = validateHoneypot(data);
  if (honeypotResult.isBot) {
    reasons.push(honeypotResult.reason!);
    confidence += 0.9;
  }

  // Check timing
  if (formLoadTime) {
    const timingResult = validateSubmissionTiming(formLoadTime);
    if (timingResult.isBot) {
      reasons.push(timingResult.reason!);
      confidence += 0.7;
    }
  }

  // Check user agent
  const userAgent = req.headers.get('user-agent') || '';
  const uaResult = analyzeUserAgent(userAgent);
  if (uaResult.isBot) {
    reasons.push(uaResult.reason!);
    confidence += uaResult.confidence;
  }

  // Check for duplicate submission
  const fingerprint = generateRequestFingerprint(req, data);
  if (duplicateDetector.isDuplicate(fingerprint)) {
    reasons.push('Duplicate submission detected');
    confidence += 0.8;
  }

  // Check headers
  const hasReferer = req.headers.has('referer');
  if (!hasReferer && req.method === 'POST') {
    reasons.push('Missing referer header on POST');
    confidence += 0.3;
  }

  const normalizedConfidence = Math.min(confidence, 1);

  return {
    isBot: normalizedConfidence > 0.5,
    confidence: normalizedConfidence,
    reasons,
    shouldBlock: normalizedConfidence > 0.7,
  };
}

/**
 * Validate CAPTCHA token (placeholder for Cloudflare Turnstile or similar)
 */
export async function validateCaptcha(token: string, secretKey: string): Promise<boolean> {
  // This is a placeholder - implement based on your CAPTCHA provider
  // For Cloudflare Turnstile:
  /*
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: secretKey,
      response: token,
    }),
  });

  const data = await response.json();
  return data.success;
  */

  // Temporary: accept any token if CAPTCHA is disabled
  if (!secretKey || secretKey === 'disabled') {
    return true;
  }

  return token !== '';
}

/**
 * Behavior-based scoring
 */
export interface BehaviorScore {
  score: number;
  factors: Record<string, number>;
}

export function calculateBehaviorScore(req: Request, data: any): BehaviorScore {
  const factors: Record<string, number> = {};
  let score = 100; // Start with perfect score

  // Legitimate requests typically have these headers
  if (!req.headers.has('accept')) factors['missing_accept'] = -10;
  if (!req.headers.has('accept-language')) factors['missing_accept_language'] = -5;
  if (!req.headers.has('user-agent')) factors['missing_user_agent'] = -20;

  // Suspicious patterns in data
  const dataString = JSON.stringify(data).toLowerCase();
  if (dataString.includes('http://') || dataString.includes('https://')) {
    factors['contains_urls'] = -15;
  }

  // Short values might be spam
  if (data.message && data.message.length < 10) {
    factors['short_message'] = -10;
  }

  // Calculate final score
  for (const value of Object.values(factors)) {
    score += value;
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    factors,
  };
}
