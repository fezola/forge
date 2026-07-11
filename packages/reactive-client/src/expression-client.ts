import { ReactiveClientConfig } from './reactive-client';
import { ExpressionEvalResult } from '@forge/reactive-types';

export class ExpressionClient {
  constructor(private config: ReactiveClientConfig) {}

  async evaluate(expression: string, context: Record<string, unknown>): Promise<ExpressionEvalResult> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/expressions/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify({ expression, context }),
    });
    return response.json();
  }

  async parse(expression: string): Promise<{ valid: boolean; ast?: string; errors?: string[] }> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/expressions/parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify({ expression }),
    });
    return response.json();
  }

  async validate(expression: string): Promise<boolean> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/expressions/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify({ expression }),
    });
    const result = await response.json();
    return result.valid;
  }
}
