export type SecretProvider = 'project' | 'connector' | 'global';

export interface SecretDTO {
  id: string;
  name: string;
  provider: SecretProvider;
  maskedValue: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSecretRequest {
  name: string;
  value: string;
  provider: SecretProvider;
}

export interface SecretReference {
  key: string;
  secretId: string;
}
