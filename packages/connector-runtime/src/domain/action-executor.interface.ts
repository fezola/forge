import { ConnectorContext, ConnectorExecutionResult } from '@forge/connector-sdk';
import { ConnectorManifestDTO } from '@forge/types';

export interface IActionExecutor {
  execute(
    manifest: ConnectorManifestDTO,
    context: ConnectorContext,
  ): Promise<ConnectorExecutionResult>;
}
