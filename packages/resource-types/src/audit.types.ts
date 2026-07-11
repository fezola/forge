export type AuditAction =
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'resource.archived'
  | 'resource.restored'
  | 'resource.lifecycle_changed'
  | 'resource.permission_granted'
  | 'resource.permission_revoked'
  | 'resource.version_created'
  | 'resource.version_restored'
  | 'resource.metadata_updated'
  | 'resource.tags_updated'
  | 'resource.visibility_changed'
  | 'resource.relationship_created'
  | 'resource.relationship_deleted'
  | 'resource.shared'
  | 'resource.comment_added'
  | 'resource.comment_updated'
  | 'resource.comment_deleted'
  | 'resource.favorited'
  | 'resource.unfavorited';

export interface AuditEntry {
  id: string;
  resourceId: string;
  resourceType: string;
  action: AuditAction;
  actorId: string;
  actorName?: string;
  projectId?: string;
  organizationId?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
  timestamp: string;
  ip?: string;
  userAgent?: string;
}

export interface AuditFilter {
  resourceId?: string;
  resourceType?: string;
  actorId?: string;
  projectId?: string;
  action?: AuditAction;
  createdAfter?: string;
  createdBefore?: string;
  offset?: number;
  limit?: number;
}