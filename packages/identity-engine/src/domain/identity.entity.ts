import { ForgeIdentity, IdentitySettings, PasswordPolicy, DEFAULT_PASSWORD_POLICY, IdentitySummary } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';

export class IdentityEntity {
  public readonly id!: string;
  public projectId!: string;
  public displayName!: string;
  public primaryEmail!: string | null;
  public primaryPhone!: string | null;
  public avatarUrl!: string | null;
  public status!: ForgeIdentity['status'];
  public verifiedEmails!: string[];
  public verifiedPhones!: string[];
  public providers!: ForgeIdentity['providers'];
  public wallets!: string[];
  public organizations!: string[];
  public defaultOrganizationId!: string | null;
  public roles!: string[];
  public permissions!: string[];
  public metadata!: Record<string, unknown>;
  public settings!: IdentitySettings;
  public createdAt!: string;
  public updatedAt!: string;
  public lastLoginAt!: string | null;

  constructor(data: ForgeIdentity) {
    Object.assign(this, data);
  }

  static create(data: {
    projectId: string;
    displayName: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
    metadata?: Record<string, unknown>;
    settings?: Partial<IdentitySettings>;
  }): IdentityEntity {
    return new IdentityEntity({
      id: uuid(),
      projectId: data.projectId,
      displayName: data.displayName,
      primaryEmail: data.email ?? null,
      primaryPhone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      status: 'active',
      verifiedEmails: data.email ? [] : [],
      verifiedPhones: data.phone ? [] : [],
      providers: [],
      wallets: [],
      organizations: [],
      defaultOrganizationId: null,
      roles: ['viewer'],
      permissions: [],
      metadata: data.metadata ?? {},
      settings: {
        preferredLanguage: 'en',
        theme: 'system',
        timezone: 'UTC',
        country: 'US',
        notifications: {},
        privacy: {},
        ...data.settings,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLoginAt: null,
    });
  }

  update(data: Partial<ForgeIdentity>): void {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }

  addProvider(provider: ForgeIdentity['providers'][number]): void {
    if (!this.providers.includes(provider)) {
      this.providers = [...this.providers, provider];
      this.updatedAt = new Date().toISOString();
    }
  }

  removeProvider(provider: string): void {
    this.providers = this.providers.filter(p => p !== provider);
    this.updatedAt = new Date().toISOString();
  }

  addWallet(walletId: string): void {
    if (!this.wallets.includes(walletId)) {
      this.wallets = [...this.wallets, walletId];
      this.updatedAt = new Date().toISOString();
    }
  }

  removeWallet(walletId: string): void {
    this.wallets = this.wallets.filter(w => w !== walletId);
    this.updatedAt = new Date().toISOString();
  }

  verifyEmail(email: string): void {
    if (!this.verifiedEmails.includes(email)) {
      this.verifiedEmails = [...this.verifiedEmails, email];
      this.updatedAt = new Date().toISOString();
    }
  }

  verifyPhone(phone: string): void {
    if (!this.verifiedPhones.includes(phone)) {
      this.verifiedPhones = [...this.verifiedPhones, phone];
      this.updatedAt = new Date().toISOString();
    }
  }

  setStatus(status: ForgeIdentity['status']): void {
    this.status = status;
    this.updatedAt = new Date().toISOString();
  }

  addOrganization(orgId: string): void {
    if (!this.organizations.includes(orgId)) {
      this.organizations = [...this.organizations, orgId];
      if (!this.defaultOrganizationId) {
        this.defaultOrganizationId = orgId;
      }
      this.updatedAt = new Date().toISOString();
    }
  }

  removeOrganization(orgId: string): void {
    this.organizations = this.organizations.filter(o => o !== orgId);
    if (this.defaultOrganizationId === orgId) {
      this.defaultOrganizationId = this.organizations[0] ?? null;
    }
    this.updatedAt = new Date().toISOString();
  }

  recordLogin(): void {
    this.lastLoginAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  toSummary(): IdentitySummary {
    return {
      id: this.id,
      displayName: this.displayName,
      primaryEmail: this.primaryEmail,
      avatarUrl: this.avatarUrl,
      status: this.status,
      providerCount: this.providers.length,
      walletCount: this.wallets.length,
      lastLoginAt: this.lastLoginAt,
    };
  }

  static validatePassword(password: string, policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY): string[] {
    const errors: string[] = [];
    if (password.length < policy.minLength) errors.push(`Password must be at least ${policy.minLength} characters`);
    if (policy.requireUppercase && !/[A-Z]/.test(password)) errors.push('Password must contain an uppercase letter');
    if (policy.requireLowercase && !/[a-z]/.test(password)) errors.push('Password must contain a lowercase letter');
    if (policy.requireNumbers && !/\d/.test(password)) errors.push('Password must contain a number');
    if (policy.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain a special character');
    return errors;
  }
}