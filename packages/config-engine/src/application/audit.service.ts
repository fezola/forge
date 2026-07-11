import { Injectable, Inject } from '@nestjs/common';
import type { ConfigAuditEntry, ConfigAuditAction } from '@forge/config-types';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';

@Injectable()
export class AuditService {
  constructor(
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
  ) {}

  async log(entry: ConfigAuditEntry): Promise<void> {
    return this.audit.log(entry);
  }

  async findByConfig(configId: string, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    return this.audit.findByConfig(configId, limit, offset);
  }

  async findByProject(projectId: string, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    return this.audit.findByProject(projectId, limit, offset);
  }

  async findByAction(action: ConfigAuditAction, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    return this.audit.findByAction(action, limit, offset);
  }
}