export interface LifecycleRule {
  id: string;
  bucketId: string;
  name: string;
  enabled: boolean;
  filter?: LifecycleFilter;
  actions: LifecycleAction[];
  createdAt: string;
  updatedAt: string;
}

export interface LifecycleFilter {
  prefix?: string;
  tags?: string[];
  mimeTypes?: string[];
  ageDays?: number;
  minSizeBytes?: number;
  maxSizeBytes?: number;
  versionsOlderThan?: number;
  includeVersions?: boolean;
}

export interface LifecycleAction {
  type: 'delete' | 'archive' | 'move_folder' | 'change_storage_class' | 'delete_versions' | 'expire_signed_urls';
  params?: Record<string, unknown>;
}

export interface LifecycleExecution {
  id: string;
  ruleId: string;
  bucketId: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'partial';
  filesScanned: number;
  filesAffected: number;
  errors: string[];
  metadata?: Record<string, unknown>;
}

export interface ArchiveOptions {
  targetProviderId?: string;
  compress?: boolean;
  retentionDays?: number;
  deleteAfterArchiveDays?: number;
}

export type StorageClass = 'standard' | 'infrequent_access' | 'archive' | 'deep_archive';