import type { SsoProvider, SsoDomain, SamlConfig, OidcConfig, RbacRole, RbacPermission, RbacRoleMember, AuditEvent, ComplianceReport, EnterpriseSettings } from '@forge/enterprise-types';

export interface ISsoRepository {
  findByProject(projectId: string): Promise<SsoProvider[]>;
  findById(id: string): Promise<SsoProvider | null>;
  findByProvider(projectId: string, provider: string): Promise<SsoProvider | null>;
  create(data: { projectId: string; name: string; provider: string; clientId?: string; clientSecret?: string; issuer?: string; authorizeUrl?: string; tokenUrl?: string; userInfoUrl?: string; scopes?: string[]; enabled?: boolean; autoProvision?: boolean; defaultRoleId?: string }): Promise<SsoProvider>;
  update(id: string, data: Partial<SsoProvider>): Promise<SsoProvider>;
  delete(id: string): Promise<void>;
}

export interface ISsoDomainRepository {
  findByProvider(providerId: string): Promise<SsoDomain[]>;
  create(data: { providerId: string; domain: string }): Promise<SsoDomain>;
  verify(id: string): Promise<SsoDomain>;
  delete(id: string): Promise<void>;
}

export interface ISamlConfigRepository {
  findByProvider(providerId: string): Promise<SamlConfig | null>;
  upsert(providerId: string, data: { entityId: string; acsUrl: string; metadataUrl?: string; certificate?: string; privateKey?: string; signatureAlgorithm?: string; digestAlgorithm?: string; nameIdFormat?: string; attributeMapping?: Record<string, unknown> }): Promise<SamlConfig>;
  delete(providerId: string): Promise<void>;
}

export interface IOidcConfigRepository {
  findByProvider(providerId: string): Promise<OidcConfig | null>;
  upsert(providerId: string, data: { authorizationEndpoint: string; tokenEndpoint: string; userInfoEndpoint?: string; jwksUri?: string; logoutEndpoint?: string; clientId: string; clientSecret?: string; responseType?: string; grantType?: string; scopes?: string[]; claimMapping?: Record<string, unknown>; pkceEnabled?: boolean }): Promise<OidcConfig>;
  delete(providerId: string): Promise<void>;
}

export interface IRbacRoleRepository {
  findByProject(projectId: string): Promise<RbacRole[]>;
  findById(id: string): Promise<RbacRole | null>;
  findBySlug(projectId: string, slug: string): Promise<RbacRole | null>;
  create(data: { projectId: string; name: string; slug: string; description?: string; isSystem?: boolean; sortOrder?: number }): Promise<RbacRole>;
  update(id: string, data: Partial<RbacRole>): Promise<RbacRole>;
  delete(id: string): Promise<void>;
}

export interface IRbacPermissionRepository {
  findByRole(roleId: string): Promise<RbacPermission[]>;
  create(data: { roleId: string; resource: string; action: string; conditions?: Record<string, unknown>; effect?: string }): Promise<RbacPermission>;
  update(id: string, data: { conditions?: Record<string, unknown>; effect?: string }): Promise<RbacPermission>;
  delete(id: string): Promise<void>;
}

export interface IRbacMemberRepository {
  findByRole(roleId: string): Promise<RbacRoleMember[]>;
  findByIdentity(identityId: string): Promise<RbacRoleMember[]>;
  add(data: { roleId: string; identityId: string; projectId?: string; grantedBy?: string; expiresAt?: string }): Promise<RbacRoleMember>;
  remove(id: string): Promise<void>;
}

export interface IAuditRepository {
  findByProject(projectId: string, limit?: number, offset?: number): Promise<AuditEvent[]>;
  findById(id: string): Promise<AuditEvent | null>;
  findByActor(actorId: string, limit?: number): Promise<AuditEvent[]>;
  search(params: { projectId?: string; action?: string; resourceType?: string; severity?: string; actorId?: string; from?: string; to?: string; limit?: number; offset?: number }): Promise<AuditEvent[]>;
  create(data: { projectId?: string; organizationId?: string; actorId: string; actorType?: string; actorName?: string; action: string; resourceType: string; resourceId?: string; resourceName?: string; targetId?: string; targetType?: string; changes?: Record<string, unknown>; metadata?: Record<string, unknown>; ip?: string; userAgent?: string; sessionId?: string; severity?: string; status?: string; retentionUntil?: string }): Promise<AuditEvent>;
  purgeOlderThan(date: Date): Promise<number>;
}

export interface IComplianceRepository {
  findByProject(projectId: string): Promise<ComplianceReport[]>;
  findById(id: string): Promise<ComplianceReport | null>;
  create(data: { projectId?: string; organizationId?: string; type: string; title: string; description?: string; periodStart: string; periodEnd: string; generatedBy: string; findings?: Record<string, unknown>; evidence?: Record<string, unknown> }): Promise<ComplianceReport>;
  update(id: string, data: Partial<ComplianceReport>): Promise<ComplianceReport>;
  delete(id: string): Promise<void>;
}

export interface IEnterpriseSettingsRepository {
  findByProject(projectId: string): Promise<EnterpriseSettings | null>;
  upsert(projectId: string, data: { ssoRequired?: boolean; mfaRequired?: boolean; mfaMethods?: string[]; passwordPolicy?: Record<string, unknown>; sessionTimeout?: number; maxLoginAttempts?: number; ipWhitelist?: string[]; ipBlacklist?: string[]; auditRetentionDays?: number; allowedDomains?: string[]; restrictedDomains?: string[] }): Promise<EnterpriseSettings>;
}
