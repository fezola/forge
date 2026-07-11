export type ConfigVisibility = 'public' | 'protected' | 'secret' | 'sensitive';
export type ConfigStatus = 'active' | 'deprecated' | 'expired' | 'revoked';
export type ConfigSource = 'manual' | 'imported' | 'inherited' | 'synchronized';

export interface ConfigEntry {
  id: string;
  key: string;
  type: ConfigValueType;
  visibility: ConfigVisibility;
  status: ConfigStatus;
  source: ConfigSource;
  schemaId?: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface ConfigValue {
  id: string;
  configId: string;
  environmentId: string;
  value: string;
  encrypted: boolean;
  version: number;
  isValid: boolean;
  validationMessage?: string;
  activatedAt?: string;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

export type ConfigValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'json'
  | 'secret'
  | 'url'
  | 'email'
  | 'host'
  | 'port'
  | 'select'
  | 'multi_select'
  | 'color'
  | 'image_url'
  | 'markdown';

export interface ConfigSchema {
  id: string;
  name: string;
  description?: string;
  fields: ConfigFieldDefinition[];
  required: string[];
  category: ConfigCategory;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface ConfigFieldDefinition {
  key: string;
  label: string;
  type: ConfigValueType;
  required: boolean;
  default?: unknown;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  validation?: ConfigValidationRule[];
  sensitive: boolean;
  encrypted: boolean;
}

export type ConfigCategory =
  | 'api_key'
  | 'oauth'
  | 'database'
  | 'blockchain'
  | 'ai'
  | 'storage'
  | 'webhook'
  | 'email'
  | 'domain'
  | 'feature_flag'
  | 'brand'
  | 'payment'
  | 'social'
  | 'security'
  | 'environment'
  | 'custom';

export interface ConfigValidationRule {
  type: 'required' | 'min_length' | 'max_length' | 'regex' | 'range' | 'custom';
  value?: string | number;
  message?: string;
}

export interface CreateConfigInput {
  key: string;
  type: ConfigValueType;
  visibility?: ConfigVisibility;
  schemaId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateConfigInput {
  key?: string;
  type?: ConfigValueType;
  visibility?: ConfigVisibility;
  status?: ConfigStatus;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SetConfigValueInput {
  environmentId: string;
  value: string;
  encrypted?: boolean;
  expiresAt?: string;
  activatedAt?: string;
}

export interface ConfigListResult {
  items: ConfigEntry[];
  total: number;
  offset: number;
  limit: number;
}

export interface ConfigFilter {
  projectId?: string;
  organizationId?: string;
  environmentId?: string;
  category?: ConfigCategory;
  type?: ConfigValueType;
  status?: ConfigStatus;
  tags?: string[];
  searchQuery?: string;
  offset?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}