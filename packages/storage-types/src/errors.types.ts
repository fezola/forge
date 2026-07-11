export type StorageErrorCode =
  | 'BUCKET_NOT_FOUND'
  | 'BUCKET_ALREADY_EXISTS'
  | 'BUCKET_FULL'
  | 'BUCKET_INACTIVE'
  | 'FILE_NOT_FOUND'
  | 'FILE_TOO_LARGE'
  | 'FILE_TYPE_NOT_ALLOWED'
  | 'FILE_ALREADY_EXISTS'
  | 'FILE_UPLOAD_FAILED'
  | 'FILE_PROCESSING_FAILED'
  | 'FILE_VERSION_NOT_FOUND'
  | 'FOLDER_NOT_FOUND'
  | 'FOLDER_ALREADY_EXISTS'
  | 'STORAGE_PROVIDER_NOT_FOUND'
  | 'STORAGE_PROVIDER_ERROR'
  | 'STORAGE_PROVIDER_DISCONNECTED'
  | 'STORAGE_PROVIDER_UNAVAILABLE'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_ALREADY_EXISTS'
  | 'SIGNED_URL_EXPIRED'
  | 'SIGNED_URL_INVALID'
  | 'SIGNED_URL_GENERATION_FAILED'
  | 'MULTIPART_UPLOAD_NOT_FOUND'
  | 'MULTIPART_UPLOAD_EXPIRED'
  | 'MULTIPART_PART_MISMATCH'
  | 'IMAGE_PROCESSING_FAILED'
  | 'IMAGE_FORMAT_UNSUPPORTED'
  | 'IMAGE_TOO_LARGE'
  | 'LIFECYCLE_RULE_NOT_FOUND'
  | 'LIFECYCLE_EXECUTION_FAILED'
  | 'CDN_CONFIG_NOT_FOUND'
  | 'CDN_PURGE_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INVALID_INPUT'
  | 'INTERNAL_ERROR';

export class StorageError extends Error {
  public readonly code: StorageErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: StorageErrorCode, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'StorageError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}