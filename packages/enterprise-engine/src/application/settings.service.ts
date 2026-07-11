import { Injectable, Inject } from '@nestjs/common';
import type { IEnterpriseSettingsRepository } from '../domain/repository-interfaces';
import type { EnterpriseSettings } from '@forge/enterprise-types';

@Injectable()
export class SettingsService {
  constructor(@Inject('IEnterpriseSettingsRepository') private readonly repo: IEnterpriseSettingsRepository) {}

  async findByProject(projectId: string): Promise<EnterpriseSettings | null> {
    return this.repo.findByProject(projectId);
  }

  async upsert(projectId: string, data: { ssoRequired?: boolean; mfaRequired?: boolean; mfaMethods?: string[]; passwordPolicy?: Record<string, unknown>; sessionTimeout?: number; maxLoginAttempts?: number; ipWhitelist?: string[]; ipBlacklist?: string[]; auditRetentionDays?: number; allowedDomains?: string[]; restrictedDomains?: string[] }): Promise<EnterpriseSettings> {
    return this.repo.upsert(projectId, data);
  }
}
