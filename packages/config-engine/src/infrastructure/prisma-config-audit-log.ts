import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ConfigAuditEntry, ConfigAuditAction } from '@forge/config-types';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';

@Injectable()
export class PrismaConfigAuditLog implements IConfigAuditLog {
  constructor(private readonly prisma: PrismaClient) {}

  async log(entry: ConfigAuditEntry): Promise<void> {
    await this.prisma.configAuditEntry.create({
      data: {
        id: entry.id,
        configId: entry.configId,
        environmentId: entry.environmentId,
        projectId: entry.projectId,
        organizationId: entry.organizationId,
        action: entry.action,
        actorId: entry.actorId,
        actorName: entry.actorName,
        details: entry.details,
        changes: entry.changes as any,
        metadata: entry.metadata as any,
        ip: entry.ip,
        userAgent: entry.userAgent,
        timestamp: new Date(entry.timestamp),
      },
    });
  }

  async findByConfig(configId: string, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    const rows = await this.prisma.configAuditEntry.findMany({
      where: { configId },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    });
    return rows.map(toAuditEntry);
  }

  async findByProject(projectId: string, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    const rows = await this.prisma.configAuditEntry.findMany({
      where: { projectId },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    });
    return rows.map(toAuditEntry);
  }

  async findByAction(action: ConfigAuditAction, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    const rows = await this.prisma.configAuditEntry.findMany({
      where: { action },
      orderBy: { timestamp: 'desc' },
      skip: offset,
      take: limit,
    });
    return rows.map(toAuditEntry);
  }
}

function toAuditEntry(row: any): ConfigAuditEntry {
  return {
    id: row.id,
    configId: row.configId ?? undefined,
    environmentId: row.environmentId ?? undefined,
    projectId: row.projectId ?? undefined,
    organizationId: row.organizationId ?? undefined,
    action: row.action as ConfigAuditAction,
    actorId: row.actorId,
    actorName: row.actorName ?? undefined,
    details: row.details ?? undefined,
    changes: row.changes as any,
    metadata: row.metadata as any,
    ip: row.ip ?? undefined,
    userAgent: row.userAgent ?? undefined,
    timestamp: row.timestamp.toISOString(),
  };
}