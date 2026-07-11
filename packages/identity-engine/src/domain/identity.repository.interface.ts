import { ForgeIdentity, CreateIdentityRequest, UpdateIdentity, IdentitySummary } from '@forge/identity-types';
import { IdentityEntity } from './identity.entity';

export interface IIdentityRepository {
  findById(id: string): Promise<IdentityEntity | null>;
  findByEmail(email: string): Promise<IdentityEntity | null>;
  findByPhone(phone: string): Promise<IdentityEntity | null>;
  findByProject(projectId: string, offset?: number, limit?: number): Promise<{ items: IdentitySummary[]; total: number }>;
  findByProvider(provider: string, providerUserId: string): Promise<IdentityEntity | null>;
  create(data: CreateIdentityRequest): Promise<IdentityEntity>;
  update(id: string, data: UpdateIdentity): Promise<IdentityEntity>;
  updateInternal(id: string, data: Partial<ForgeIdentity>): Promise<void>;
  delete(id: string): Promise<void>;
  addOrganization(identityId: string, organizationId: string): Promise<void>;
  removeOrganization(identityId: string, organizationId: string): Promise<void>;
  countByProject(projectId: string): Promise<number>;
}