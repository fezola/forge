import { Injectable, Inject } from '@nestjs/common';
import type { IAuditRepository } from '../domain/repository-interfaces';
import type { AuditEvent } from '@forge/enterprise-types';

@Injectable()
export class AuditService {
  constructor(@Inject('IAuditRepository') private readonly repo: IAuditRepository) {}

  async findByProject(projectId: string, limit = 100, offset = 0): Promise<AuditEvent[]> {
    return this.repo.findByProject(projectId, limit, offset);
  }

  async findById(id: string): Promise<AuditEvent> {
    const event = await this.repo.findById(id);
    if (!event) throw new Error('Audit event not found');
    return event;
  }

  async findByActor(actorId: string, limit = 100): Promise<AuditEvent[]> {
    return this.repo.findByActor(actorId, limit);
  }

  async search(params: { projectId?: string; action?: string; resourceType?: string; severity?: string; actorId?: string; from?: string; to?: string; limit?: number; offset?: number }): Promise<AuditEvent[]> {
    return this.repo.search(params);
  }

  async record(data: { projectId?: string; organizationId?: string; actorId: string; actorType?: string; actorName?: string; action: string; resourceType: string; resourceId?: string; resourceName?: string; targetId?: string; targetType?: string; changes?: Record<string, unknown>; metadata?: Record<string, unknown>; ip?: string; userAgent?: string; sessionId?: string; severity?: string; status?: string; retentionUntil?: string }): Promise<AuditEvent> {
    return this.repo.create(data);
  }

  async purgeOlderThan(days: number): Promise<number> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return this.repo.purgeOlderThan(date);
  }
}
