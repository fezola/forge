import type { ConfigAuditEntry, ConfigAuditAction } from '@forge/config-types';

export const IConfigAuditLog = Symbol('IConfigAuditLog');

export interface IConfigAuditLog {
  log(entry: ConfigAuditEntry): Promise<void>;
  findByConfig(configId: string, limit?: number, offset?: number): Promise<ConfigAuditEntry[]>;
  findByProject(projectId: string, limit?: number, offset?: number): Promise<ConfigAuditEntry[]>;
  findByAction(action: ConfigAuditAction, limit?: number, offset?: number): Promise<ConfigAuditEntry[]>;
}