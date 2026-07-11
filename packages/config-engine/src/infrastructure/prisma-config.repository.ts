import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { ConfigEntry, ConfigValue, CreateConfigInput, UpdateConfigInput, SetConfigValueInput, ConfigFilter, ConfigListResult } from '@forge/config-types';
import { IConfigRepository } from '../domain/config-repository.interface';

function toConfigEntry(row: any): ConfigEntry {
  return {
    id: row.id,
    key: row.key,
    type: row.type,
    visibility: row.visibility,
    status: row.status,
    source: row.source,
    schemaId: row.schemaId ?? undefined,
    tags: row.tags ?? [],
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function toConfigValue(row: any): ConfigValue {
  return {
    id: row.id,
    configId: row.configId,
    environmentId: row.environmentId,
    value: row.value,
    encrypted: row.encrypted,
    version: row.version,
    isValid: row.isValid,
    validationMessage: row.validationMessage ?? undefined,
    activatedAt: row.activatedAt?.toISOString() ?? undefined,
    expiresAt: row.expiresAt?.toISOString() ?? undefined,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
  };
}

@Injectable()
export class PrismaConfigRepository implements IConfigRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(input: CreateConfigInput & { id: string; createdBy: string }): Promise<ConfigEntry> {
    const row = await this.prisma.configEntry.create({
      data: {
        id: input.id,
        key: input.key,
        type: input.type,
        visibility: input.visibility ?? 'protected',
        tags: input.tags ?? [],
        metadata: input.metadata as any,
        schemaId: input.schemaId,
        createdBy: input.createdBy,
        updatedBy: input.createdBy,
      },
    });
    return toConfigEntry(row);
  }

  async update(id: string, input: UpdateConfigInput & { updatedBy: string }): Promise<ConfigEntry> {
    const row = await this.prisma.configEntry.update({
      where: { id },
      data: {
        ...(input.key !== undefined && { key: input.key }),
        ...(input.type !== undefined && { type: input.type }),
        ...(input.visibility !== undefined && { visibility: input.visibility }),
        ...(input.status !== undefined && { status: input.status }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.metadata !== undefined && { metadata: input.metadata as any }),
        updatedBy: input.updatedBy,
      },
    });
    return toConfigEntry(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.configEntry.delete({ where: { id } });
  }

  async findById(id: string): Promise<ConfigEntry | null> {
    const row = await this.prisma.configEntry.findUnique({ where: { id } });
    return row ? toConfigEntry(row) : null;
  }

  async findByKey(key: string, _projectId?: string, _organizationId?: string): Promise<ConfigEntry | null> {
    const row = await this.prisma.configEntry.findUnique({ where: { key } });
    return row ? toConfigEntry(row) : null;
  }

  async find(filter: ConfigFilter): Promise<ConfigListResult> {
    const where: any = {};
    if (filter.type) where.type = filter.type;
    if (filter.status) where.status = filter.status;
    if (filter.tags && filter.tags.length > 0) where.tags = { hasSome: filter.tags };
    if (filter.searchQuery) where.key = { contains: filter.searchQuery, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.configEntry.findMany({
        where,
        skip: filter.offset ?? 0,
        take: filter.limit ?? 50,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.configEntry.count({ where }),
    ]);
    return { items: items.map(toConfigEntry), total, offset: filter.offset ?? 0, limit: filter.limit ?? 50 };
  }

  async setValue(configId: string, input: SetConfigValueInput & { createdBy: string }): Promise<ConfigValue> {
    const existing = await this.prisma.configValue.findFirst({
      where: { configId, environmentId: input.environmentId },
      orderBy: { version: 'desc' },
    });
    const nextVersion = existing ? existing.version + 1 : 1;

    const row = await this.prisma.configValue.create({
      data: {
        configId,
        environmentId: input.environmentId,
        value: input.value,
        encrypted: input.encrypted ?? false,
        version: nextVersion,
        activatedAt: input.activatedAt ? new Date(input.activatedAt) : undefined,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
        createdBy: input.createdBy,
      },
    });
    return toConfigValue(row);
  }

  async getValue(configId: string, environmentId: string): Promise<ConfigValue | null> {
    const row = await this.prisma.configValue.findFirst({
      where: { configId, environmentId },
      orderBy: { version: 'desc' },
    });
    return row ? toConfigValue(row) : null;
  }

  async getValues(configId: string): Promise<ConfigValue[]> {
    const rows = await this.prisma.configValue.findMany({
      where: { configId },
      orderBy: { version: 'desc' },
    });
    return rows.map(toConfigValue);
  }

  async deleteValue(id: string): Promise<void> {
    await this.prisma.configValue.delete({ where: { id } });
  }

  async getActiveValue(configId: string, environmentId: string): Promise<ConfigValue | null> {
    const row = await this.prisma.configValue.findFirst({
      where: {
        configId,
        environmentId,
        isValid: true,
        AND: [
          { OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
          { OR: [{ activatedAt: null }, { activatedAt: { lte: new Date() } }] },
        ],
      },
      orderBy: { version: 'desc' },
    });
    return row ? toConfigValue(row) : null;
  }
}