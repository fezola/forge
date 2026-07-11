export interface ITriggerListener {
  startPolling(installationId: string, interval: number, callback: (data: unknown) => void): void;
  stopPolling(installationId: string): void;
}
