import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { ConfigEntry, ConfigValue, CreateConfigInput, UpdateConfigInput, SetConfigValueInput, ConfigFilter, ConfigListResult, ResolvedConfigValue } from '@forge/config-types';
import { ConfigError } from '@forge/config-types';
import { IConfigRepository } from '../domain/config-repository.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';
import { IInheritanceResolver } from '../domain/inheritance-resolver.interface';

@Injectable()
export class ConfigService {
  constructor(
    @Inject(IConfigRepository) private readonly repo: IConfigRepository,
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
    @Inject(IConfigEventEmitter) private readonly events: IConfigEventEmitter,
    @Inject(IInheritanceResolver) private readonly inheritance: IInheritanceResolver,
  ) {}

  async create(input: CreateConfigInput, createdBy: string): Promise<ConfigEntry> {
    const existing = await this.repo.findByKey(input.key);
    if (existing) throw new ConfigError('CONFIG_ALREADY_EXISTS', `Config '${input.key}' already exists`, 409);
    const config = await this.repo.create({ ...input, id: uuid(), createdBy });
    await this.audit.log({ id: uuid(), configId: config.id, action: 'config.created', actorId: createdBy, timestamp: new Date().toISOString() });
    this.events.emit('config.created', { configId: config.id, key: config.key, createdBy });
    return config;
  }

  async update(id: string, input: UpdateConfigInput, updatedBy: string): Promise<ConfigEntry> {
    const config = await this.repo.findById(id);
    if (!config) throw new ConfigError('CONFIG_NOT_FOUND', `Config '${id}' not found`, 404);
    const updated = await this.repo.update(id, { ...input, updatedBy });
    await this.audit.log({ id: uuid(), configId: id, action: 'config.updated', actorId: updatedBy, details: `Updated config '${updated.key}'`, timestamp: new Date().toISOString() });
    this.events.emit('config.updated', { configId: id, key: updated.key, updatedBy });
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const config = await this.repo.findById(id);
    if (!config) throw new ConfigError('CONFIG_NOT_FOUND', `Config '${id}' not found`, 404);
    await this.repo.delete(id);
    await this.audit.log({ id: uuid(), configId: id, action: 'config.deleted', actorId: deletedBy, timestamp: new Date().toISOString() });
    this.events.emit('config.deleted', { configId: id, key: config.key, deletedBy });
  }

  async get(id: string): Promise<ConfigEntry | null> {
    return this.repo.findById(id);
  }

  async findByKey(key: string, projectId?: string, organizationId?: string): Promise<ConfigEntry | null> {
    return this.repo.findByKey(key, projectId, organizationId);
  }

  async find(filter: ConfigFilter): Promise<ConfigListResult> {
    return this.repo.find(filter);
  }

  async setValue(configId: string, input: SetConfigValueInput, createdBy: string): Promise<ConfigValue> {
    const config = await this.repo.findById(configId);
    if (!config) throw new ConfigError('CONFIG_NOT_FOUND', `Config '${configId}' not found`, 404);
    const value = await this.repo.setValue(configId, { ...input, createdBy });
    await this.audit.log({ id: uuid(), configId, environmentId: input.environmentId, action: 'config.value_set', actorId: createdBy, timestamp: new Date().toISOString() });
    this.events.emit('config.value_changed', { configId, environmentId: input.environmentId, valueId: value.id, createdBy });
    return value;
  }

  async getValue(configId: string, environmentId: string): Promise<ConfigValue | null> {
    return this.repo.getActiveValue(configId, environmentId);
  }

  async resolve(configId: string, environmentId: string): Promise<ResolvedConfigValue> {
    return this.inheritance.resolve(configId, environmentId);
  }

  async getResolvedValue(key: string, environmentId: string, projectId?: string): Promise<string | undefined> {
    const config = await this.repo.findByKey(key, projectId);
    if (!config) return undefined;
    const resolved = await this.inheritance.resolve(config.id, environmentId);
    return resolved.effectiveValue;
  }

  async setEncrypted(configId: string, environmentId: string, value: string, createdBy: string): Promise<ConfigValue> {
    return this.setValue(configId, { environmentId, value, encrypted: true }, createdBy);
  }
}