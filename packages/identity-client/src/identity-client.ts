import {
  AuthCredentials, AuthResult, ForgeIdentity, UpdateIdentity,
  Organization, CreateOrganizationRequest, UpdateOrganization, OrganizationMember, OrganizationInvite,
  Wallet, LinkWalletRequest,
  SessionSummary,
} from '@forge/identity-types';

export interface IdentityClientConfig {
  baseUrl: string;
  projectId: string;
  apiKey?: string;
  token?: string;
}

export class IdentityClient {
  private config: IdentityClientConfig;

  constructor(config: IdentityClientConfig) {
    this.config = config;
  }

  setToken(token: string) {
    this.config.token = token;
  }

  setApiKey(apiKey: string) {
    this.config.apiKey = apiKey;
  }

  // === Auth ===

  async login(credentials: AuthCredentials): Promise<AuthResult> {
    return this.post('/identity/auth/login', { credentials });
  }

  async register(credentials: AuthCredentials): Promise<AuthResult> {
    return this.post('/identity/auth/register', { credentials });
  }

  async refresh(): Promise<AuthResult> {
    return this.post('/identity/auth/refresh', {});
  }

  async logout(sessionId: string): Promise<void> {
    await this.post('/identity/auth/logout', { sessionId });
  }

  // === Identity ===

  async getProfile(): Promise<ForgeIdentity> {
    return this.get('/identity/me');
  }

  async updateProfile(data: UpdateIdentity): Promise<void> {
    await this.put('/identity/me', data);
  }

  async deleteAccount(): Promise<void> {
    await this.delete('/identity/me');
  }

  // === Organizations ===

  async getOrganizations(): Promise<Organization[]> {
    return this.get('/identity/organizations');
  }

  async getOrganization(id: string): Promise<Organization> {
    return this.get(`/identity/organizations/${id}`);
  }

  async createOrganization(request: CreateOrganizationRequest): Promise<Organization> {
    return this.post('/identity/organizations', request);
  }

  async updateOrganization(id: string, data: UpdateOrganization): Promise<Organization> {
    return this.put(`/identity/organizations/${id}`, data);
  }

  async deleteOrganization(id: string): Promise<void> {
    await this.delete(`/identity/organizations/${id}`);
  }

  async getOrganizationMembers(orgId: string): Promise<OrganizationMember[]> {
    return this.get(`/identity/organizations/${orgId}/members`);
  }

  async inviteMember(orgId: string, email: string, roleId: string): Promise<OrganizationInvite> {
    return this.post(`/identity/organizations/${orgId}/invites`, { email, roleId });
  }

  async acceptInvite(token: string): Promise<void> {
    await this.post('/identity/invites/accept', { token });
  }

  // === Wallets ===

  async getWallets(): Promise<Wallet[]> {
    return this.get('/identity/wallets');
  }

  async linkWallet(request: Omit<LinkWalletRequest, 'identityId'>): Promise<Wallet> {
    return this.post('/identity/wallets/link', request);
  }

  async unlinkWallet(id: string): Promise<void> {
    await this.post(`/identity/wallets/${id}/unlink`, {});
  }

  async setPrimaryWallet(id: string): Promise<void> {
    await this.post(`/identity/wallets/${id}/primary`, {});
  }

  // === Sessions ===

  async getSessions(): Promise<SessionSummary[]> {
    return this.get('/identity/sessions');
  }

  async revokeSession(id: string): Promise<void> {
    await this.post(`/identity/sessions/${id}/revoke`, {});
  }

  async revokeAllSessions(): Promise<void> {
    await this.post('/identity/sessions/revoke-all', {});
  }

  // === MFA ===

  async enableMfa(method: string, config?: Record<string, unknown>): Promise<boolean> {
    return this.post('/identity/mfa/enable', { method, config });
  }

  async disableMfa(id: string): Promise<void> {
    await this.post(`/identity/mfa/${id}/disable`, {});
  }

  // === HTTP helpers ===

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(this.url(path), { headers: this.headers() });
    if (!res.ok) throw new IdentityRequestError(res.status, await res.text());
    return res.json();
  }

  private async post<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new IdentityRequestError(res.status, await res.text());
    return res.json();
  }

  private async put<T>(path: string, data: unknown): Promise<T> {
    const res = await fetch(this.url(path), {
      method: 'PUT',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new IdentityRequestError(res.status, await res.text());
    return res.json();
  }

  private async delete(path: string): Promise<void> {
    const res = await fetch(this.url(path), {
      method: 'DELETE',
      headers: this.headers(),
    });
    if (!res.ok) throw new IdentityRequestError(res.status, await res.text());
  }

  private url(path: string): string {
    return `${this.config.baseUrl}${path}`;
  }

  private headers(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = { ...extra };
    if (this.config.token) headers['Authorization'] = `Bearer ${this.config.token}`;
    if (this.config.apiKey) headers['X-API-Key'] = this.config.apiKey;
    return headers;
  }
}

export class IdentityRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
  ) {
    super(`Identity request failed: ${status}`);
  }
}