import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { Environment, CreateEnvironmentInput, UpdateEnvironmentInput, EnvironmentPromotionRequest, EnvironmentSnapshot } from '@forge/config-types';
import { ConfigError } from '@forge/config-types';
import { IEnvironmentRepository } from '../domain/environment-repository.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';
import { IConfigRepository } from '../domain/config-repository.interface';

@Injectable()
export class EnvironmentService {
  constructor(
    @Inject(IEnvironmentRepository) private readonly repo: IEnvironmentRepository,
    @Inject(IConfigRepository) private readonly configRepo: IConfigRepository,
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
    @Inject(IConfigEventEmitter) private readonly events: IConfigEventEmitter,
  ) {}

  async create(input: CreateEnvironmentInput, createdBy: string): Promise<Environment> {
    const slug = input.slug || input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const existing = await this.repo.findBySlug(input.projectId, slug);
    if (existing) throw new ConfigError('ENVIRONMENT_ALREADY_EXISTS', `Environment '${slug}' already exists in project`, 409);

    const env = await this.repo.create({ ...input, id: uuid(), slug, createdBy });
    await this.audit.log({ id: uuid(), projectId: input.projectId, action: 'environment.created', actorId: createdBy, details: `Created environment '${env.name}'`, timestamp: new Date().toISOString() });
    this.events.emit('environment.created', { environmentId: env.id, projectId: input.projectId, name: env.name, createdBy });
    return env;
  }

  async update(id: string, input: UpdateEnvironmentInput): Promise<Environment> {
    const env = await this.repo.findById(id);
    if (!env) throw new ConfigError('ENVIRONMENT_NOT_FOUND', `Environment '${id}' not found`, 404);
    if (env.protected && (input.protected !== undefined || input.name !== undefined)) {
      throw new ConfigError('ENVIRONMENT_PROTECTED', 'Protected environment cannot be modified', 403);
    }
    const updated = await this.repo.update(id, input);
    await this.audit.log({ id: uuid(), projectId: env.projectId, action: 'environment.updated', actorId: 'system', details: `Updated environment '${updated.name}'`, timestamp: new Date().toISOString() });
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const env = await this.repo.findById(id);
    if (!env) throw new ConfigError('ENVIRONMENT_NOT_FOUND', `Environment '${id}' not found`, 404);
    if (env.protected) throw new ConfigError('ENVIRONMENT_PROTECTED', 'Protected environment cannot be deleted', 403);
    await this.repo.delete(id);
    await this.audit.log({ id: uuid(), projectId: env.projectId, action: 'environment.deleted', actorId: deletedBy, details: `Deleted environment '${env.name}'`, timestamp: new Date().toISOString() });
    this.events.emit('environment.deleted', { environmentId: id, projectId: env.projectId, deletedBy });
  }

  async findById(id: string): Promise<Environment | null> {
    return this.repo.findById(id);
  }

  async findByProject(projectId: string): Promise<Environment[]> {
    return this.repo.findByProject(projectId);
  }

  async getDefault(projectId: string): Promise<Environment | null> {
    return this.repo.getDefault(projectId);
  }

  async requestPromotion(environmentId: string, targetEnvironmentId: string, configIds: string[], requestedBy: string): Promise<EnvironmentPromotionRequest> {
    const request = await this.repo.createPromotionRequest({ id: uuid(), environmentId, targetEnvironmentId, configIds, status: 'pending', requestedBy });
    this.events.emit('environment.promotion_requested', { requestId: request.id, environmentId, targetEnvironmentId, requestedBy });
    return request;
  }

  async approvePromotion(requestId: string, approvedBy: string): Promise<EnvironmentPromotionRequest> {
    const request = await this.repo.approvePromotionRequest(requestId, approvedBy);
    this.events.emit('environment.promotion_approved', { requestId, approvedBy });
    return request;
  }

  async promote(requestId: string): Promise<void> {
    const request = await this.repo.getPromotionRequestById(requestId);
    if (!request) throw new ConfigError('ENVIRONMENT_NOT_FOUND', 'Promotion request not found', 404);
    if (request.status !== 'approved') throw new ConfigError('ENVIRONMENT_PROMOTION_FAILED', 'Promotion request is not approved', 400);
    for (const configId of request.configIds) {
      const sourceValue = await this.configRepo.getActiveValue(configId, request.environmentId);
      if (sourceValue) {
        await this.configRepo.setValue(configId, { environmentId: request.targetEnvironmentId, value: sourceValue.value, encrypted: sourceValue.encrypted, createdBy: 'system' });
      }
    }
    await this.repo.completePromotion(requestId);
    this.events.emit('environment.promotion_completed', { requestId, environmentId: request.environmentId, targetEnvironmentId: request.targetEnvironmentId });
  }

  async createSnapshot(environmentId: string, label: string, createdBy: string): Promise<EnvironmentSnapshot> {
    const env = await this.repo.findById(environmentId);
    if (!env) throw new ConfigError('ENVIRONMENT_NOT_FOUND', `Environment '${environmentId}' not found`, 404);
    const configValues: Record<string, string> = {};
    const values = await this.configRepo.getValues(environmentId);
    for (const v of values) {
      const config = await this.configRepo.findById(v.configId);
      if (config) configValues[config.key] = v.value;
    }
    const snapshot = await this.repo.createSnapshot({ id: uuid(), environmentId, label, configValues, createdBy });
    this.events.emit('environment.snapshot_created', { snapshotId: snapshot.id, environmentId, createdBy });
    return snapshot;
  }
}