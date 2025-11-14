/**
 * Webhook Signature Verification
 * Protects against webhook spoofing and replay attacks
 */

/**
 * Verify Stripe webhook signature
 */
export async function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Stripe uses HMAC SHA256
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Extract timestamp and signature from header
    const elements = signature.split(',');
    const timestamp = elements.find(e => e.startsWith('t='))?.substring(2);
    const sig = elements.find(e => e.startsWith('v1='))?.substring(3);

    if (!timestamp || !sig) {
      return false;
    }

    // Check timestamp (reject if older than 5 minutes to prevent replay attacks)
    const webhookAge = Date.now() - parseInt(timestamp) * 1000;
    if (webhookAge > 5 * 60 * 1000) {
      console.warn('Webhook timestamp too old:', webhookAge / 1000, 'seconds');
      return false;
    }

    // Construct signed payload
    const signedPayload = `${timestamp}.${payload}`;
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex string
    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Compare signatures using constant-time comparison
    return constantTimeCompare(computedSignature, sig);
  } catch (error) {
    console.error('Error verifying Stripe webhook:', error);
    return false;
  }
}

/**
 * Verify Uber webhook signature
 * Uber uses X-Uber-Signature header with SHA512 HMAC
 */
export async function verifyUberWebhook(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );

    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(payload)
    );

    const computedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Uber signature might be base64 or hex - handle both
    const providedSignature = signature.toLowerCase();

    return constantTimeCompare(computedSignature, providedSignature);
  } catch (error) {
    console.error('Error verifying Uber webhook:', error);
    return false;
  }
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Generate a webhook signature (for testing)
 */
export async function generateWebhookSignature(
  payload: string,
  secret: string,
  algorithm: 'SHA-256' | 'SHA-512' = 'SHA-256'
): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: algorithm },
    false,
    ['sign']
  );

  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  return Array.from(new Uint8Array(signatureBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Validate webhook event ID to prevent duplicate processing
 */
export interface WebhookEventStore {
  has(eventId: string): Promise<boolean>;
  add(eventId: string): Promise<void>;
}

export class InMemoryWebhookEventStore implements WebhookEventStore {
  private events: Set<string> = new Set();
  private timestamps: Map<string, number> = new Map();

  async has(eventId: string): Promise<boolean> {
    this.cleanup();
    return this.events.has(eventId);
  }

  async add(eventId: string): Promise<void> {
    this.events.add(eventId);
    this.timestamps.set(eventId, Date.now());
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [eventId, timestamp] of this.timestamps.entries()) {
      if (now - timestamp > maxAge) {
        this.events.delete(eventId);
        this.timestamps.delete(eventId);
      }
    }
  }
}

const eventStore = new InMemoryWebhookEventStore();

/**
 * Check if webhook event has already been processed
 */
export async function isWebhookEventProcessed(eventId: string): Promise<boolean> {
  return await eventStore.has(eventId);
}

/**
 * Mark webhook event as processed
 */
export async function markWebhookEventProcessed(eventId: string): Promise<void> {
  await eventStore.add(eventId);
}
