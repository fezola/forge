export type ResourceErrorCode =
  | 'RESOURCE_NOT_FOUND'
  | 'RESOURCE_ALREADY_EXISTS'
  | 'RESOURCE_TYPE_NOT_FOUND'
  | 'RESOURCE_TYPE_ALREADY_REGISTERED'
  | 'INVALID_LIFECYCLE_TRANSITION'
  | 'LIFECYCLE_TRANSITION_NOT_ALLOWED'
  | 'PERMISSION_DENIED'
  | 'PERMISSION_ALREADY_EXISTS'
  | 'RELATIONSHIP_ALREADY_EXISTS'
  | 'RELATIONSHIP_NOT_FOUND'
  | 'RELATIONSHIP_CYCLE_DETECTED'
  | 'VERSION_NOT_FOUND'
  | 'COMMENT_NOT_FOUND'
  | 'METADATA_KEY_INVALID'
  | 'METADATA_KEY_REQUIRED'
  | 'TAG_LIMIT_EXCEEDED'
  | 'INVALID_INPUT'
  | 'QUOTA_EXCEEDED'
  | 'RESOURCE_HEALTH_CHECK_FAILED'
  | 'INTERNAL_ERROR';

export class ResourceError extends Error {
  public readonly code: ResourceErrorCode;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(code: ResourceErrorCode, message: string, statusCode = 500, details?: Record<string, unknown>) {
    super(message);
    this.name = 'ResourceError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}