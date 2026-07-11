import { DataBindingConfig } from './component.types';

export interface ForgePluginConfig {
  apiKey: string;
  projectId: string;
  baseUrl: string;
}

export interface ForgeClientConfig {
  baseUrl: string;
  wsUrl?: string;
  token?: string;
  projectId: string;
}

export interface ComponentBinding {
  componentId: string;
  dataSource: DataBindingConfig;
  resolvedValue?: unknown;
  lastUpdated?: string;
}

export interface ForgePluginState {
  connected: boolean;
  projectId: string | null;
  apiKey: string | null;
  selectedComponent: string | null;
}
