export type ConfigScopeType = 'organization' | 'project' | 'environment' | 'connector' | 'global';

export interface ConfigScope {
  id: string;
  type: ConfigScopeType;
  referenceId: string;
  parentId?: string;
  order: number;
}

export interface ConfigInheritanceChain {
  scopes: ConfigScope[];
  resolvers: InheritedConfigResolver[];
}

export interface InheritedConfigResolver {
  scopeType: ConfigScopeType;
  priority: number;
  allowedOverrides: boolean;
}

export interface ResolvedConfigValue {
  effectiveValue: string;
  encrypted: boolean;
  sourceScope: ConfigScope;
  sourceConfigId: string;
  inherited: boolean;
  overridden: boolean;
  overriddenAt?: string;
  overriddenBy?: string;
}

export interface InheritanceRule {
  id: string;
  configId: string;
  scopeType: ConfigScopeType;
  inheritFrom: ConfigScopeType;
  allowOverride: boolean;
  overrideRequiresPermission?: string;
  createdAt: string;
  updatedAt: string;
}

export type InheritanceMode = 'strict' | 'override' | 'merge';

export interface ConfigInheritanceConfig {
  mode: InheritanceMode;
  maxDepth: number;
  defaultScope: ConfigScopeType;
  mergeStrategy?: 'deep_merge' | 'shallow_merge' | 'replace';
}