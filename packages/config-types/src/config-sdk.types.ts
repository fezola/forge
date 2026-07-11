export interface ConfigSdkOptions {
  projectId?: string;
  organizationId?: string;
  environmentId?: string;
  apiUrl?: string;
  apiKey?: string;
}

export interface ConfigResolutionOptions {
  environmentId?: string;
  inherit?: boolean;
  resolveSecrets?: boolean;
  decrypt?: boolean;
}

export interface ConfigSdkInterface {
  get(key: string, options?: ConfigResolutionOptions): Promise<string | undefined>;
  getSecret(key: string): Promise<string | undefined>;
  getJson(key: string): Promise<Record<string, unknown> | undefined>;
  getNumber(key: string): Promise<number | undefined>;
  getBoolean(key: string): Promise<boolean | undefined>;
  featureFlag(key: string): Promise<boolean>;
  environment(): Promise<string>;
  has(key: string): Promise<boolean>;
  all(options?: ConfigResolutionOptions): Promise<Record<string, unknown>>;
  resolveTemplate(template: string): Promise<string>;
}