/**
 * Security Monitoring and Logging
 * Detects and logs suspicious activity, potential attacks, and security violations
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { detectSuspiciousPatterns } from './input-validator.ts';

export interface SecurityEvent {
  id?: string;
  timestamp: Date;
  event_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ip_address?: string;
  user_agent?: string;
  endpoint?: string;
  method?: string;
  details?: Record<string, any>;
  blocked?: boolean;
}

export interface IPBlockEntry {
  ip: string;
  reason: string;
  blockedAt: number;
  blockUntil: number;
  violations: number;
}

/**
 * Security Monitor for tracking and blocking malicious activity
 */
export class SecurityMonitor {
  private blockedIPs: Map<string, IPBlockEntry> = new Map();
  private violationCounts: Map<string, number> = new Map();
  private supabase: any;

  constructor() {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    // Cleanup old blocks every 10 minutes
    setInterval(() => this.cleanupExpiredBlocks(), 10 * 60 * 1000);
  }

  /**
   * Log security event to database
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    // Always log to console
    console.warn('SECURITY EVENT:', {
      type: event.event_type,
      severity: event.severity,
      ip: event.ip_address,
      endpoint: event.endpoint,
    });

    // Store in database if available
    if (this.supabase) {
      try {
        await this.supabase.from('security_logs').insert({
          event_type: event.event_type,
          severity: event.severity,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          endpoint: event.endpoint,
          method: event.method,
          details: event.details,
          blocked: event.blocked,
          created_at: event.timestamp.toISOString(),
        });
      } catch (error) {
        console.error('Failed to log security event:', error);
      }
    }
  }

  /**
   * Check if IP is blocked
   */
  isIPBlocked(ip: string): boolean {
    const block = this.blockedIPs.get(ip);
    if (!block) return false;

    if (block.blockUntil < Date.now()) {
      this.blockedIPs.delete(ip);
      return false;
    }

    return true;
  }

  /**
   * Block an IP address
   */
  blockIP(ip: string, reason: string, durationMs: number = 3600000): void {
    const now = Date.now();
    const existing = this.blockedIPs.get(ip);

    const block: IPBlockEntry = {
      ip,
      reason,
      blockedAt: now,
      blockUntil: now + durationMs,
      violations: (existing?.violations || 0) + 1,
    };

    this.blockedIPs.set(ip, block);

    this.logSecurityEvent({
      timestamp: new Date(),
      event_type: 'IP_BLOCKED',
      severity: 'high',
      ip_address: ip,
      details: { reason, durationMs, violations: block.violations },
      blocked: true,
    });
  }

  /**
   * Record a security violation
   */
  recordViolation(ip: string, violationType: string): void {
    const count = (this.violationCounts.get(`${ip}:${violationType}`) || 0) + 1;
    this.violationCounts.set(`${ip}:${violationType}`, count);

    // Auto-block after threshold
    if (count >= 5) {
      const blockDuration = Math.min(count * 300000, 86400000); // Max 24 hours
      this.blockIP(ip, `Multiple ${violationType} violations`, blockDuration);
    }
  }

  /**
   * Analyze request for suspicious patterns
   */
  async analyzeRequest(req: Request, body?: any): Promise<{
    suspicious: boolean;
    patterns: string[];
    severity: 'low' | 'medium' | 'high' | 'critical';
  }> {
    const patterns: string[] = [];
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    // Check IP
    const ip = this.getIPFromRequest(req);
    if (this.isIPBlocked(ip)) {
      patterns.push('BLOCKED_IP');
      severity = 'critical';
    }

    // Check for suspicious headers
    const userAgent = req.headers.get('user-agent') || '';
    if (this.isSuspiciousUserAgent(userAgent)) {
      patterns.push('SUSPICIOUS_USER_AGENT');
      severity = severity === 'critical' ? 'critical' : 'medium';
    }

    // Check request body for malicious content
    if (body) {
      const bodyPatterns = detectSuspiciousPatterns(body);
      if (bodyPatterns.length > 0) {
        patterns.push(...bodyPatterns);
        severity = severity === 'critical' ? 'critical' : 'high';
      }
    }

    // Check for common attack patterns in URL
    const url = new URL(req.url);
    if (this.isSuspiciousURL(url)) {
      patterns.push('SUSPICIOUS_URL');
      severity = severity === 'critical' ? 'critical' : 'high';
    }

    // Log if suspicious
    if (patterns.length > 0) {
      await this.logSecurityEvent({
        timestamp: new Date(),
        event_type: 'SUSPICIOUS_REQUEST',
        severity,
        ip_address: ip,
        user_agent: userAgent,
        endpoint: url.pathname,
        method: req.method,
        details: { patterns },
        blocked: false,
      });

      // Record violations for each pattern
      patterns.forEach(pattern => {
        this.recordViolation(ip, pattern);
      });
    }

    return {
      suspicious: patterns.length > 0,
      patterns,
      severity,
    };
  }

  /**
   * Get IP address from request
   */
  private getIPFromRequest(req: Request): string {
    return req.headers.get('cf-connecting-ip') ||
           req.headers.get('x-forwarded-for')?.split(',')[0] ||
           req.headers.get('x-real-ip') ||
           'unknown';
  }

  /**
   * Check if user agent is suspicious
   */
  private isSuspiciousUserAgent(userAgent: string): boolean {
    const suspicious = [
      'sqlmap',
      'nikto',
      'nmap',
      'masscan',
      'acunetix',
      'nessus',
      'burp',
      'metasploit',
      'havij',
      'loader',
    ];

    const lowerUA = userAgent.toLowerCase();
    return suspicious.some(pattern => lowerUA.includes(pattern)) ||
           userAgent.length < 10 ||
           userAgent.length > 500;
  }

  /**
   * Check if URL contains suspicious patterns
   */
  private isSuspiciousURL(url: URL): boolean {
    const suspiciousPatterns = [
      '../',
      '..\\',
      '/etc/passwd',
      '/proc/',
      'eval(',
      'base64',
      '<script',
      'javascript:',
    ];

    const fullUrl = url.href.toLowerCase();
    return suspiciousPatterns.some(pattern => fullUrl.includes(pattern));
  }

  /**
   * Clean up expired IP blocks
   */
  private cleanupExpiredBlocks(): void {
    const now = Date.now();
    for (const [ip, block] of this.blockedIPs.entries()) {
      if (block.blockUntil < now) {
        this.blockedIPs.delete(ip);
      }
    }

    // Clean up old violation counts (older than 1 hour)
    const cutoff = now - 3600000;
    for (const [key] of this.violationCounts.entries()) {
      // Simple cleanup - could be improved with timestamps
      if (Math.random() < 0.1) { // Probabilistic cleanup
        this.violationCounts.delete(key);
      }
    }
  }

  /**
   * Get blocked IPs list
   */
  getBlockedIPs(): IPBlockEntry[] {
    return Array.from(this.blockedIPs.values());
  }

  /**
   * Manually unblock an IP
   */
  unblockIP(ip: string): boolean {
    return this.blockedIPs.delete(ip);
  }
}

// Global security monitor instance
const securityMonitor = new SecurityMonitor();

export { securityMonitor };

/**
 * Middleware to check request security before processing
 */
export async function securityCheckMiddleware(
  req: Request,
  body?: any
): Promise<Response | null> {
  const ip = req.headers.get('cf-connecting-ip') ||
             req.headers.get('x-forwarded-for')?.split(',')[0] ||
             req.headers.get('x-real-ip') ||
             'unknown';

  // Check if IP is blocked
  if (securityMonitor.isIPBlocked(ip)) {
    return new Response(
      JSON.stringify({
        error: 'Access denied',
        reason: 'Your IP has been temporarily blocked due to suspicious activity',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Analyze request for suspicious patterns
  const analysis = await securityMonitor.analyzeRequest(req, body);

  // Block if critical severity
  if (analysis.severity === 'critical') {
    securityMonitor.blockIP(ip, 'Critical security violation', 3600000);
    return new Response(
      JSON.stringify({
        error: 'Access denied',
        reason: 'Request blocked due to security policy violation',
      }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Allow request but log if suspicious
  return null;
}
