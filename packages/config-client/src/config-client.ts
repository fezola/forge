import type {
  ConfigEntry, ConfigValue, ConfigListResult, CreateConfigInput, UpdateConfigInput, SetConfigValueInput,
  Environment, CreateEnvironmentInput, UpdateEnvironmentInput,
  FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput, FeatureFlagEvaluation,
  BrandConfig, BrandConfigInput, BlockchainConfig, BlockchainConfigInput, AiConfig, AiConfigInput,
  ConfigFilter, ResolvedConfigValue, Secret, ConfigAuditEntry,
} from '@forge/config-types';

export interface ConfigClientConfig {
  baseUrl: string;
  apiKey?: string;
  projectId: string;
}

export class ConfigClient {
  private readonly baseUrl: string;
  private readonly projectId: string;
  private readonly headers: Record<string, string>;

  constructor(config: ConfigClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.projectId = config.projectId;
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    };
  }

  // ── Config Entries ──

  async listConfigs(filter?: ConfigFilter): Promise<ConfigListResult> {
    const params = new URLSearchParams({ ...filter as any, projectId: this.projectId });
    return this.get(`/api/config?${params}`);
  }

  async getConfig(id: string): Promise<ConfigEntry> {
    return this.get(`/api/config/${id}`);
  }

  async createConfig(input: CreateConfigInput): Promise<ConfigEntry> {
    return this.post('/api/config', { ...input, projectId: this.projectId });
  }

  async updateConfig(id: string, input: UpdateConfigInput): Promise<ConfigEntry> {
    return this.put(`/api/config/${id}`, input);
  }

  async deleteConfig(id: string): Promise<void> {
    return this.delete(`/api/config/${id}`);
  }

  // ── Config Values ──

  async setConfigValue(configId: string, input: SetConfigValueInput): Promise<ConfigValue> {
    return this.post(`/api/config/${configId}/values`, input);
  }

  async getConfigValue(configId: string, environmentId: string): Promise<ConfigValue | null> {
    return this.get(`/api/config/${configId}/values?environmentId=${environmentId}`);
  }

  async resolveConfigValue(configId: string, environmentId: string): Promise<ResolvedConfigValue> {
    return this.get(`/api/config/${configId}/resolve?environmentId=${environmentId}`);
  }

  async getResolved(key: string, environmentId: string, projectId?: string): Promise<string | undefined> {
    const params = new URLSearchParams({ key, environmentId });
    if (projectId) params.set('projectId', projectId);
    return this.get(`/api/config/resolve?${params}`);
  }

  // ── Secrets ──

  async createSecret(configId: string, value: string): Promise<Secret> {
    return this.post(`/api/config/${configId}/secrets`, { value });
  }

  async readSecret(secretId: string): Promise<string> {
    return this.get(`/api/config/secrets/${secretId}`);
  }

  async rotateSecret(secretId: string, newValue: string): Promise<Secret> {
    return this.post(`/api/config/secrets/${secretId}/rotate`, { newValue });
  }

  async revokeSecret(secretId: string): Promise<void> {
    return this.post(`/api/config/secrets/${secretId}/revoke`, {});
  }

  // ── Feature Flags ──

  async listFlags(projectId?: string): Promise<FeatureFlag[]> {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    return this.get(`/api/config/feature-flags?${params}`);
  }

  async getFlag(id: string): Promise<FeatureFlag> {
    return this.get(`/api/config/feature-flags/${id}`);
  }

  async createFlag(input: CreateFeatureFlagInput): Promise<FeatureFlag> {
    return this.post('/api/config/feature-flags', input);
  }

  async updateFlag(id: string, input: UpdateFeatureFlagInput): Promise<FeatureFlag> {
    return this.put(`/api/config/feature-flags/${id}`, input);
  }

  async deleteFlag(id: string): Promise<void> {
    return this.delete(`/api/config/feature-flags/${id}`);
  }

  async evaluateFlag(id: string, context?: { identityId?: string; organizationId?: string; projectId?: string; environmentId?: string }): Promise<FeatureFlagEvaluation> {
    return this.post(`/api/config/feature-flags/${id}/evaluate`, context ?? {});
  }

  // ── Environments ──

  async listEnvironments(projectId?: string): Promise<Environment[]> {
    return this.get(`/api/config/environments?projectId=${projectId ?? this.projectId}`);
  }

  async createEnvironment(input: CreateEnvironmentInput): Promise<Environment> {
    return this.post('/api/config/environments', input);
  }

  async updateEnvironment(id: string, input: UpdateEnvironmentInput): Promise<Environment> {
    return this.put(`/api/config/environments/${id}`, input);
  }

  async deleteEnvironment(id: string): Promise<void> {
    return this.delete(`/api/config/environments/${id}`);
  }

  async createSnapshot(environmentId: string, label: string): Promise<any> {
    return this.post(`/api/config/environments/${environmentId}/snapshots`, { label });
  }

  // ── Brand ──

  async getBrand(projectId?: string): Promise<BrandConfig | null> {
    return this.get(`/api/config/brand/${projectId ?? this.projectId}`);
  }

  async upsertBrand(input: BrandConfigInput, projectId?: string): Promise<BrandConfig> {
    return this.put(`/api/config/brand/${projectId ?? this.projectId}`, input);
  }

  async deleteBrand(projectId?: string): Promise<void> {
    return this.delete(`/api/config/brand/${projectId ?? this.projectId}`);
  }

  // ── Blockchain Config ──

  async listBlockchainConfigs(projectId?: string): Promise<BlockchainConfig[]> {
    return this.get(`/api/config/blockchain/${projectId ?? this.projectId}`);
  }

  async upsertBlockchainConfig(projectId: string, input: BlockchainConfigInput): Promise<BlockchainConfig> {
    return this.post(`/api/config/blockchain/${projectId}`, input);
  }

  async deleteBlockchainConfig(id: string): Promise<void> {
    return this.delete(`/api/config/blockchain/${id}`);
  }

  // ── AI Config ──

  async listAiConfigs(projectId?: string): Promise<AiConfig[]> {
    return this.get(`/api/config/ai/${projectId ?? this.projectId}`);
  }

  async upsertAiConfig(projectId: string, input: AiConfigInput): Promise<AiConfig> {
    return this.post(`/api/config/ai/${projectId}`, input);
  }

  async deleteAiConfig(id: string): Promise<void> {
    return this.delete(`/api/config/ai/${id}`);
  }

  // ── Audit ──

  async listAudit(configId?: string, projectId?: string, limit = 50, offset = 0): Promise<ConfigAuditEntry[]> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (configId) params.set('configId', configId);
    if (projectId) params.set('projectId', projectId);
    return this.get(`/api/config/audit?${params}`);
  }

  // ── Helpers ──

  private async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers });
    return this.handleResponse<T>(res);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: 'POST', headers: this.headers, body: JSON.stringify(body) });
    return this.handleResponse<T>(res);
  }

  private async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: 'PUT', headers: this.headers, body: JSON.stringify(body) });
    return this.handleResponse<T>(res);
  }

  private async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { method: 'DELETE', headers: this.headers });
    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Config API error (${res.status}): ${error}`);
    }
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
  }
}