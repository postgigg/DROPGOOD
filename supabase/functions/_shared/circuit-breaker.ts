/**
 * Circuit Breaker Pattern
 * Protects against cascading failures in third-party service calls
 */

export interface CircuitBreakerConfig {
  failureThreshold: number; // Number of failures before opening
  successThreshold: number; // Number of successes needed to close
  timeout: number; // Milliseconds to wait before trying again
  monitorInterval: number; // Interval to check circuit health
}

export enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Circuit broken, reject requests
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  nextAttemptTime?: number;
  totalRequests: number;
  rejectedRequests: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000, // 1 minute
  monitorInterval: 10000, // 10 seconds
};

/**
 * Circuit Breaker for protecting third-party API calls
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime?: number;
  private nextAttemptTime?: number;
  private totalRequests = 0;
  private rejectedRequests = 0;
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < (this.nextAttemptTime || 0)) {
        this.rejectedRequests++;
        throw new Error(
          `Circuit breaker [${this.name}] is OPEN. Service temporarily unavailable. ` +
          `Retry after ${new Date(this.nextAttemptTime!).toISOString()}`
        );
      }
      // Try to transition to half-open
      this.state = CircuitState.HALF_OPEN;
      console.log(`Circuit breaker [${this.name}] transitioning to HALF_OPEN`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Handle successful request
   */
  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.state = CircuitState.CLOSED;
        this.successes = 0;
        console.log(`Circuit breaker [${this.name}] is now CLOSED (recovered)`);
      }
    }
  }

  /**
   * Handle failed request
   */
  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      this.open();
    } else if (this.failures >= this.config.failureThreshold) {
      this.open();
    }
  }

  /**
   * Open the circuit (stop allowing requests)
   */
  private open(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = Date.now() + this.config.timeout;
    this.successes = 0;

    console.error(
      `Circuit breaker [${this.name}] is now OPEN. ` +
      `Too many failures (${this.failures}). ` +
      `Will retry at ${new Date(this.nextAttemptTime).toISOString()}`
    );
  }

  /**
   * Get current circuit breaker statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      nextAttemptTime: this.nextAttemptTime,
      totalRequests: this.totalRequests,
      rejectedRequests: this.rejectedRequests,
    };
  }

  /**
   * Manually reset the circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = undefined;
    this.nextAttemptTime = undefined;
    console.log(`Circuit breaker [${this.name}] manually reset`);
  }

  /**
   * Check if circuit is healthy
   */
  isHealthy(): boolean {
    return this.state === CircuitState.CLOSED;
  }
}

/**
 * Circuit Breaker Manager for multiple services
 */
export class CircuitBreakerManager {
  private breakers = new Map<string, CircuitBreaker>();

  /**
   * Get or create a circuit breaker for a service
   */
  getBreaker(serviceName: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(serviceName)) {
      this.breakers.set(serviceName, new CircuitBreaker(serviceName, config));
    }
    return this.breakers.get(serviceName)!;
  }

  /**
   * Get all circuit breaker statistics
   */
  getAllStats(): Record<string, CircuitBreakerStats> {
    const stats: Record<string, CircuitBreakerStats> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      stats[name] = breaker.getStats();
    }
    return stats;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }

  /**
   * Get health status of all services
   */
  getHealthStatus(): Record<string, boolean> {
    const health: Record<string, boolean> = {};
    for (const [name, breaker] of this.breakers.entries()) {
      health[name] = breaker.isHealthy();
    }
    return health;
  }
}

// Global circuit breaker manager
export const circuitBreakerManager = new CircuitBreakerManager();

/**
 * Wrapper for Stripe API calls with circuit breaker
 */
export async function callStripeWithBreaker<T>(
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = circuitBreakerManager.getBreaker('stripe', config);
  return breaker.execute(fn);
}

/**
 * Wrapper for Uber API calls with circuit breaker
 */
export async function callUberWithBreaker<T>(
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = circuitBreakerManager.getBreaker('uber', config);
  return breaker.execute(fn);
}

/**
 * Wrapper for external API calls with circuit breaker
 */
export async function callExternalAPIWithBreaker<T>(
  serviceName: string,
  fn: () => Promise<T>,
  config?: Partial<CircuitBreakerConfig>
): Promise<T> {
  const breaker = circuitBreakerManager.getBreaker(serviceName, config);
  return breaker.execute(fn);
}

/**
 * HTTP fetch with circuit breaker, timeout, and retry
 */
export async function fetchWithCircuitBreaker(
  serviceName: string,
  url: string,
  options?: RequestInit,
  config?: {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    circuitBreaker?: Partial<CircuitBreakerConfig>;
  }
): Promise<Response> {
  const {
    timeout = 30000,
    retries = 3,
    retryDelay = 1000,
    circuitBreaker: cbConfig,
  } = config || {};

  const breaker = circuitBreakerManager.getBreaker(serviceName, cbConfig);

  return breaker.execute(async () => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  });
}
