export interface AuditEvent {
  id: string;
  projectId?: string | null;
  organizationId?: string | null;
  actorId: string;
  actorType: string;
  actorName?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  resourceName?: string | null;
  targetId?: string | null;
  targetType?: string | null;
  changes?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  sessionId?: string | null;
  severity: 'info' | 'warning' | 'error' | 'critical';
  status: 'success' | 'failure' | 'pending';
  timestamp: string;
  retentionUntil?: string | null;
}

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export type AuditStatus = 'success' | 'failure' | 'pending';
