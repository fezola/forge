export type ConfigEventType =
  | 'config.created'
  | 'config.updated'
  | 'config.deleted'
  | 'config.value_changed'
  | 'config.value_expired'
  | 'config.validated'
  | 'config.validation_failed'
  | 'config.inheritance_resolved'
  | 'secret.created'
  | 'secret.accessed'
  | 'secret.rotated'
  | 'secret.rotation_required'
  | 'secret.revoked'
  | 'secret.compromised'
  | 'secret.pre_expiry_warning'
  | 'environment.created'
  | 'environment.updated'
  | 'environment.deleted'
  | 'environment.promotion_requested'
  | 'environment.promotion_approved'
  | 'environment.promotion_completed'
  | 'environment.snapshot_created'
  | 'feature_flag.created'
  | 'feature_flag.updated'
  | 'feature_flag.deleted'
  | 'feature_flag.status_changed'
  | 'feature_flag.rollout_changed'
  | 'feature_flag.evaluated'
  | 'brand.updated'
  | 'blockchain.updated'
  | 'ai.updated';

export interface ConfigEvent {
  id: string;
  type: ConfigEventType;
  configId?: string;
  environmentId?: string;
  projectId?: string;
  organizationId?: string;
  actorId: string;
  payload: Record<string, unknown>;
  previousValue?: unknown;
  newValue?: unknown;
  timestamp: string;
}