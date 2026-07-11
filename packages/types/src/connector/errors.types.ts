export class ConnectorError extends Error {
  constructor(
    message: string,
    public readonly code: ConnectorErrorCode,
    public readonly statusCode: number = 500,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ConnectorError';
  }
}

export type ConnectorErrorCode =
  | 'CONNECTOR_NOT_FOUND'
  | 'CONNECTOR_NOT_INSTALLED'
  | 'CONNECTOR_DISABLED'
  | 'ACTION_NOT_FOUND'
  | 'ACTION_EXECUTION_FAILED'
  | 'INVALID_CONFIG'
  | 'MISSING_SECRETS'
  | 'PERMISSION_DENIED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'TIMEOUT'
  | 'MANIFEST_INVALID';
