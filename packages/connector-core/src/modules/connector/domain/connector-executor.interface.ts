import { ConnectorExecutionResult } from '@forge/types';

export interface IConnectorExecutor {
  execute(connector: { type: string; config: Record<string, unknown> }, payload?: unknown): Promise<ConnectorExecutionResult>;
  test(connector: { type: string; config: Record<string, unknown> }): Promise<boolean>;
}
