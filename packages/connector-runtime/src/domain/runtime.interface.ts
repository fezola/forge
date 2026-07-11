import { ConnectorExecutionResult } from '@forge/connector-sdk';

export interface IConnectorRuntime {
  execute(installationId: string, actionId: string, input: Record<string, unknown>, projectId: string): Promise<ConnectorExecutionResult>;
  executeRaw(config: { baseUrl: string; method: string; path: string; headers?: Record<string, string> }, body?: unknown): Promise<ConnectorExecutionResult>;
  validate(installationId: string): Promise<boolean>;
  health(): Promise<{ status: string; activeConnectors: number }>;
}
