export type ResourceEventType =
  | 'resource.created'
  | 'resource.updated'
  | 'resource.deleted'
  | 'resource.archived'
  | 'resource.restored'
  | 'resource.lifecycle_changed'
  | 'resource.permission_changed'
  | 'resource.shared'
  | 'resource.published'
  | 'resource.version_created'
  | 'resource.version_restored'
  | 'resource.comment_added'
  | 'resource.comment_resolved'
  | 'resource.favorited'
  | 'resource.unfavorited'
  | 'resource.health_changed'
  | 'resource.relationship_added'
  | 'resource.relationship_removed'
  | 'resource.exported'
  | 'resource.imported';

export interface ResourceEvent {
  id: string;
  type: ResourceEventType;
  resourceId: string;
  resourceType: string;
  projectId?: string;
  organizationId?: string;
  actorId: string;
  timestamp: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
}

export interface IResourceEventEmitter {
  emit(event: ResourceEvent): Promise<void>;
  on(type: ResourceEventType, handler: (event: ResourceEvent) => void): void;
  off(type: ResourceEventType, handler: (event: ResourceEvent) => void): void;
}

export interface IResourceWorkflowBridge {
  emitWorkflowEvent(event: ResourceEvent): Promise<void>;
  isAvailable(): boolean;
}