import type { ConfigScope, ConfigScopeType, ResolvedConfigValue } from '@forge/config-types';

export const IInheritanceResolver = Symbol('IInheritanceResolver');

export interface InheritanceChainItem {
  scope: ConfigScope;
  configValue?: string;
  encrypted: boolean;
}

export interface IInheritanceResolver {
  buildChain(configId: string, scopeType: ConfigScopeType, referenceId: string): Promise<ConfigScope[]>;
  resolve(configId: string, environmentId: string): Promise<ResolvedConfigValue>;
  resolveSecretRef(template: string, environmentId: string): Promise<string>;
  detectCycle(scopes: ConfigScope[]): boolean;
  getEffectiveScope(scopeType: ConfigScopeType, referenceId: string): Promise<ConfigScope>;
}