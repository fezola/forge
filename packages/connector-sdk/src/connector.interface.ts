import type { ConnectorManifest } from './manifest.interface';
import type { ConnectorContext } from './context.interface';

export interface ConnectorExecutionResult {
  success: boolean;
  statusCode: number;
  data: unknown;
  duration: number;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface IConnector {
  manifest: ConnectorManifest;
  execute(context: ConnectorContext): Promise<ConnectorExecutionResult>;
  validate?(context: ConnectorContext): Promise<ValidationResult>;
}