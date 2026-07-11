export type StorageEventType =
  | 'storage.bucket.created'
  | 'storage.bucket.updated'
  | 'storage.bucket.deleted'
  | 'storage.file.uploaded'
  | 'storage.file.updated'
  | 'storage.file.deleted'
  | 'storage.file.restored'
  | 'storage.file.version.created'
  | 'storage.file.version.restored'
  | 'storage.file.moved'
  | 'storage.file.copied'
  | 'storage.file.processed'
  | 'storage.folder.created'
  | 'storage.folder.deleted'
  | 'storage.lifecycle.executed'
  | 'storage.cdn.purged'
  | 'storage.signed_url.generated'
  | 'storage.provider.error';

export interface StorageEvent {
  id: string;
  type: StorageEventType;
  projectId: string;
  bucketId: string;
  fileId?: string;
  versionId?: string;
  actorId: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  payload: Record<string, unknown>;
}

export interface StorageEventPayload {
  bucket: {
    id: string;
    name: string;
    projectId: string;
  };
  file?: {
    id: string;
    name: string;
    mimeType: string;
    sizeBytes: number;
    folder?: string;
    tags?: string[];
    version: number;
  };
  actor: {
    id: string;
    type: 'user' | 'system' | 'workflow' | 'connector';
  };
  changes?: Record<string, { from: unknown; to: unknown }>;
  provider?: {
    type: string;
    id: string;
  };
}

export interface IStorageEventEmitter {
  emit(event: StorageEvent): Promise<void>;
  on(type: StorageEventType, handler: (event: StorageEvent) => void): void;
  off(type: StorageEventType, handler: (event: StorageEvent) => void): void;
}

export interface IStorageWorkflowBridge {
  triggerWorkflow(event: StorageEvent): Promise<void>;
  isAvailable(): boolean;
}