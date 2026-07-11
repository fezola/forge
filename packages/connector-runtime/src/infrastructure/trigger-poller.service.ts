import { Injectable } from '@nestjs/common';
import { ITriggerListener } from '../domain/trigger-listener.interface';

@Injectable()
export class TriggerPollerService implements ITriggerListener {
  private activePollers: Map<string, NodeJS.Timeout> = new Map();

  startPolling(installationId: string, intervalMs: number, onData: (data: unknown) => void): void {
    if (this.activePollers.has(installationId)) return;

    const poller = setInterval(async () => {
      try {
        // In production this would call the connector's trigger endpoint
        onData({ polled: true, timestamp: new Date().toISOString() });
      } catch (error) {
        console.error(`[TriggerPoller] Error polling ${installationId}:`, error);
      }
    }, intervalMs);

    this.activePollers.set(installationId, poller);
  }

  stopPolling(installationId: string): void {
    const poller = this.activePollers.get(installationId);
    if (poller) {
      clearInterval(poller);
      this.activePollers.delete(installationId);
    }
  }

  stopAll(): void {
    for (const [id, poller] of this.activePollers) {
      clearInterval(poller);
    }
    this.activePollers.clear();
  }
}
