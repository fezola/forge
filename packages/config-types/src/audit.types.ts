export type ConfigAuditAction =
  | 'config.created'
  | 'config.updated'
  | 'config.deleted'
  | 'config.value_set'
  | 'config.value_updated'
  | 'config.value_deleted'
  | 'config.imported'
  | 'config.exported'
  | 'config.validated'
  | 'config.validation_failed'
  | 'secret.created'
  | 'secret.read'
  | 'secret.rotated'
  | 'secret.revoked'
  | 'secret.expired'
  | 'secret.compromised'
  | 'environment.created'
  | 'environment.updated'
  | 'environment.deleted'
  | 'environment.promoted'
  | 'environment.snapshot'
  | 'feature_flag.created'
  | 'feature_flag.updated'
  | 'feature_flag.deleted'
  | 'feature_flag.evaluated'
  | 'feature_flag.overridden'
  | 'brand.updated'
  | 'blockchain.updated'
  | 'ai.updated'
  | 'config.inherited'
  | 'config.resolved';

export interface ConfigAuditEntry {
  id: string;
  configId?: string;
  environmentId?: string;
  projectId?: string;
  organizationId?: string;
  action: ConfigAuditAction;
  actorId: string;
  actorName?: string;
  details?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
  metadata?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
  timestamp: string;
}