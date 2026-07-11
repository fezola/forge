export class DataError extends Error {
  public readonly code: DataErrorCode;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown> | undefined;

  constructor(code: DataErrorCode, message: string, statusCode: number = 400, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DataError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export type DataErrorCode =
  | 'TABLE_NOT_FOUND'
  | 'TABLE_ALREADY_EXISTS'
  | 'FIELD_NOT_FOUND'
  | 'FIELD_ALREADY_EXISTS'
  | 'FIELD_TYPE_MISMATCH'
  | 'FIELD_REQUIRED'
  | 'FIELD_UNIQUE_VIOLATION'
  | 'FIELD_VALIDATION_FAILED'
  | 'RECORD_NOT_FOUND'
  | 'RECORD_ALREADY_EXISTS'
  | 'INVALID_FILTER'
  | 'INVALID_SORT'
  | 'INVALID_QUERY'
  | 'QUERY_TOO_COMPLEX'
  | 'QUERY_LIMIT_EXCEEDED'
  | 'PROVIDER_NOT_FOUND'
  | 'PROVIDER_DISCONNECTED'
  | 'PROVIDER_ERROR'
  | 'PROVIDER_NOT_SUPPORTED'
  | 'PROVIDER_CONFIG_INVALID'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_FIELD_DENIED'
  | 'TRANSACTION_FAILED'
  | 'TRANSACTION_CONFLICT'
  | 'IMPORT_FAILED'
  | 'IMPORT_INVALID_FORMAT'
  | 'BACKUP_FAILED'
  | 'BACKUP_NOT_FOUND'
  | 'RESTORE_FAILED'
  | 'VERSION_NOT_FOUND'
  | 'RELATIONSHIP_CYCLE'
  | 'RELATIONSHIP_NOT_FOUND'
  | 'INDEX_NOT_FOUND'
  | 'INDEX_ALREADY_EXISTS'
  | 'SEARCH_NOT_SUPPORTED'
  | 'REALTIME_NOT_SUPPORTED'
  | 'RATE_LIMITED'
  | 'UNSUPPORTED_FIELD_TYPE';