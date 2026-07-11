export interface IWebhookHandler {
  register(installationId: string, path: string): void;
  unregister(installationId: string): void;
  handle(event: string, payload: unknown): Promise<void>;
}
