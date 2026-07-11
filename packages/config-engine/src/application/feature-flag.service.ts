import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput, FeatureFlagEvaluation, FlagOverride } from '@forge/config-types';
import { ConfigError } from '@forge/config-types';
import { IFeatureFlagRepository } from '../domain/feature-flag-repository.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';

@Injectable()
export class FeatureFlagService {
  constructor(
    @Inject(IFeatureFlagRepository) private readonly repo: IFeatureFlagRepository,
    @Inject(IConfigAuditLog) private readonly audit: IConfigAuditLog,
    @Inject(IConfigEventEmitter) private readonly events: IConfigEventEmitter,
  ) {}

  async create(input: CreateFeatureFlagInput, createdBy: string): Promise<FeatureFlag> {
    const existing = await this.repo.findByKey(input.key);
    if (existing) throw new ConfigError('FEATURE_FLAG_ALREADY_EXISTS', `Feature flag '${input.key}' already exists`, 409);
    const flag = await this.repo.create({ ...input, id: uuid(), createdBy });
    await this.audit.log({ id: uuid(), action: 'feature_flag.created', actorId: createdBy, details: `Created flag '${flag.key}'`, timestamp: new Date().toISOString() });
    this.events.emit('feature_flag.created', { flagId: flag.id, key: flag.key, createdBy });
    return flag;
  }

  async update(id: string, input: UpdateFeatureFlagInput, updatedBy: string): Promise<FeatureFlag> {
    const flag = await this.repo.findById(id);
    if (!flag) throw new ConfigError('FEATURE_FLAG_NOT_FOUND', `Feature flag '${id}' not found`, 404);
    const updated = await this.repo.update(id, { ...input, updatedBy });
    await this.audit.log({ id: uuid(), action: 'feature_flag.updated', actorId: updatedBy, details: `Updated flag '${updated.key}'`, timestamp: new Date().toISOString() });

    if (input.enabled !== undefined && input.enabled !== flag.enabled) {
      this.events.emit('feature_flag.status_changed', { flagId: id, key: updated.key, enabled: updated.enabled, updatedBy });
    }
    if (input.rolloutPercentage !== undefined && input.rolloutPercentage !== flag.rolloutPercentage) {
      this.events.emit('feature_flag.rollout_changed', { flagId: id, key: updated.key, rolloutPercentage: updated.rolloutPercentage, updatedBy });
    }
    return updated;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const flag = await this.repo.findById(id);
    if (!flag) throw new ConfigError('FEATURE_FLAG_NOT_FOUND', `Feature flag '${id}' not found`, 404);
    await this.repo.delete(id);
    await this.audit.log({ id: uuid(), action: 'feature_flag.deleted', actorId: deletedBy, details: `Deleted flag '${flag.key}'`, timestamp: new Date().toISOString() });
    this.events.emit('feature_flag.deleted', { flagId: id, key: flag.key, deletedBy });
  }

  async evaluate(key: string, context: { identityId?: string; organizationId?: string; projectId?: string; environmentId?: string }): Promise<FeatureFlagEvaluation> {
    const flag = await this.repo.findByKey(key);
    if (!flag || flag.status !== 'active') {
      return { flag: flag ?? { id: '', key, name: key, status: 'inactive', enabled: false, sticky: false, metadata: {}, createdAt: '', updatedAt: '', createdBy: '' }, enabled: false, reason: 'Flag not found or inactive', evaluatedAt: new Date().toISOString() };
    }

    const override = await this.repo.getEffectiveOverride(flag.id, context.identityId, context.organizationId, context.projectId, context.environmentId);
    if (override) {
      await this.audit.log({ id: uuid(), action: 'feature_flag.overridden', actorId: context.identityId ?? 'system', details: `Flag '${key}' evaluated via override: ${override.enabled}`, timestamp: new Date().toISOString() });
      return { flag, enabled: override.enabled, reason: 'Override applied', evaluatedAt: new Date().toISOString() };
    }

    if (!flag.enabled) {
      return { flag, enabled: false, reason: 'Flag is disabled', evaluatedAt: new Date().toISOString() };
    }

    if (flag.rolloutPercentage !== undefined && flag.rolloutPercentage < 100) {
      const hash = this.hashKey(context.identityId ?? key, flag.id);
      if (hash > flag.rolloutPercentage) {
        return { flag, enabled: false, reason: `Rollout ${flag.rolloutPercentage}% — not in cohort`, evaluatedAt: new Date().toISOString() };
      }
    }

    if (flag.targetIdentities && flag.targetIdentities.length > 0 && context.identityId && !flag.targetIdentities.includes(context.identityId)) {
      return { flag, enabled: false, reason: 'Identity not in target list', evaluatedAt: new Date().toISOString() };
    }

    this.events.emit('feature_flag.evaluated', { flagId: flag.id, key: flag.key, enabled: true, context });
    return { flag, enabled: true, reason: 'Flag is enabled', evaluatedAt: new Date().toISOString() };
  }

  async setOverride(input: FlagOverride): Promise<FlagOverride> {
    return this.repo.setOverride(input);
  }

  async removeOverride(flagId: string, identityId?: string, organizationId?: string, projectId?: string): Promise<void> {
    await this.repo.removeOverride(flagId, identityId, organizationId, projectId);
  }

  async list(projectId?: string): Promise<FeatureFlag[]> {
    if (projectId) return this.repo.findByProject(projectId);
    return this.repo.listActive();
  }

  private hashKey(identity: string, salt: string): number {
    let hash = 0;
    const str = identity + salt;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash) % 100;
  }
}