import { ReactiveClientConfig } from './reactive-client';
import { BindingResult, ResolveBindingsResponse } from '@forge/reactive-types';

export class BindingClient {
  constructor(private config: ReactiveClientConfig) {}

  async resolve(bindingId: string, context?: Record<string, unknown>): Promise<BindingResult> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/bindings/${bindingId}/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify({ context }),
    });
    if (!response.ok) {
      const error = await response.text();
      return { success: false, value: null, resolved: false, source: '', error, cached: false, timestamp: new Date().toISOString() };
    }
    return response.json();
  }

  async resolveAll(bindings: Array<{ id: string; source: Record<string, unknown>; transform?: Record<string, unknown> }>, context?: Record<string, unknown>): Promise<ResolveBindingsResponse> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/bindings/resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify({
        projectId: this.config.projectId,
        bindings,
        context,
      }),
    });
    return response.json();
  }

  async list(): Promise<any[]> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/bindings?projectId=${this.config.projectId}`, {
      headers: { ...(this.config.token ? { Authorization: `Bearer ${this.config.token}` } : {}) },
    });
    return response.json();
  }
}
