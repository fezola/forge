import { Injectable } from '@nestjs/common';

export interface RetryConfig {
  maxAttempts: number;
  backoffMs: number;
  maxBackoffMs: number;
  retryableErrors: string[];
}

@Injectable()
export class RetryHandler {
  private readonly defaultConfig: RetryConfig = {
    maxAttempts: 3,
    backoffMs: 1000,
    maxBackoffMs: 30000,
    retryableErrors: ['TIMEOUT', 'RATE_LIMIT_EXCEEDED', 'NETWORK_ERROR', 'INTERNAL_ERROR'],
  };

  async execute<T>(
    fn: () => Promise<T>,
    config?: Partial<RetryConfig>,
  ): Promise<{ result: T; attempts: number }> {
    const cfg = { ...this.defaultConfig, ...config };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= cfg.maxAttempts; attempt++) {
      try {
        const result = await fn();
        return { result, attempts: attempt };
      } catch (error: any) {
        lastError = error;
        if (attempt < cfg.maxAttempts && this.isRetryable(error, cfg)) {
          const delay = Math.min(cfg.backoffMs * Math.pow(2, attempt - 1), cfg.maxBackoffMs);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw error;
        }
      }
    }

    throw lastError || new Error('Retry failed');
  }

  private isRetryable(error: any, config: RetryConfig): boolean {
    if (!error?.code) return true;
    return config.retryableErrors.includes(error.code);
  }
}
