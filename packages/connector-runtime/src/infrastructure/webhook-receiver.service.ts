import { Injectable } from '@nestjs/common';
import { IWebhookHandler } from '../domain/webhook-handler.interface';

@Injectable()
export class WebhookReceiverService implements IWebhookHandler {
  private registeredHooks: Map<string, { path: string; event: string }> = new Map();

  register(installationId: string, path: string): void {
    this.registeredHooks.set(installationId, { path, event: '' });
  }

  unregister(installationId: string): void {
    this.registeredHooks.delete(installationId);
  }

  async handle(event: string, payload: unknown): Promise<void> {
    // In production this would find the matching webhook registration
    // and forward to the appropriate project's workflow engine
    console.log(`[WebhookReceiver] Event: ${event}`, payload);
  }

  getRegisteredPaths(): string[] {
    return Array.from(this.registeredHooks.values()).map(h => h.path);
  }
}
