import { Injectable, Inject } from '@nestjs/common';
import type { ISsoRepository, ISsoDomainRepository, ISamlConfigRepository, IOidcConfigRepository } from '../domain/repository-interfaces';
import type { SsoProvider } from '@forge/enterprise-types';

@Injectable()
export class SsoService {
  constructor(
    @Inject('ISsoRepository') private readonly ssoRepo: ISsoRepository,
    @Inject('ISsoDomainRepository') private readonly domainRepo: ISsoDomainRepository,
    @Inject('ISamlConfigRepository') private readonly samlRepo: ISamlConfigRepository,
    @Inject('IOidcConfigRepository') private readonly oidcRepo: IOidcConfigRepository,
  ) {}

  async findByProject(projectId: string): Promise<SsoProvider[]> {
    return this.ssoRepo.findByProject(projectId);
  }

  async findById(id: string): Promise<SsoProvider> {
    const provider = await this.ssoRepo.findById(id);
    if (!provider) throw new Error('SSO provider not found');
    return provider;
  }

  async create(data: { projectId: string; name: string; provider: string; clientId?: string; clientSecret?: string; issuer?: string; authorizeUrl?: string; tokenUrl?: string; userInfoUrl?: string; scopes?: string[]; autoProvision?: boolean; defaultRoleId?: string }): Promise<SsoProvider> {
    return this.ssoRepo.create(data);
  }

  async update(id: string, data: Partial<SsoProvider>): Promise<SsoProvider> {
    return this.ssoRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.ssoRepo.delete(id);
  }

  async getDomains(providerId: string) {
    return this.domainRepo.findByProvider(providerId);
  }

  async addDomain(data: { providerId: string; domain: string }) {
    return this.domainRepo.create(data);
  }

  async verifyDomain(id: string) {
    return this.domainRepo.verify(id);
  }

  async removeDomain(id: string) {
    await this.domainRepo.delete(id);
  }

  async getSamlConfig(providerId: string) {
    return this.samlRepo.findByProvider(providerId);
  }

  async upsertSamlConfig(providerId: string, data: { entityId: string; acsUrl: string; metadataUrl?: string; certificate?: string; privateKey?: string; signatureAlgorithm?: string; digestAlgorithm?: string; nameIdFormat?: string; attributeMapping?: Record<string, unknown> }) {
    return this.samlRepo.upsert(providerId, data);
  }

  async getOidcConfig(providerId: string) {
    return this.oidcRepo.findByProvider(providerId);
  }

  async upsertOidcConfig(providerId: string, data: { authorizationEndpoint: string; tokenEndpoint: string; userInfoEndpoint?: string; jwksUri?: string; logoutEndpoint?: string; clientId: string; clientSecret?: string; responseType?: string; grantType?: string; scopes?: string[]; claimMapping?: Record<string, unknown>; pkceEnabled?: boolean }) {
    return this.oidcRepo.upsert(providerId, data);
  }
}
