export enum AuthMethod {
  BEARER_TOKEN = 'BEARER_TOKEN',
  API_KEY = 'API_KEY',
  BASIC_AUTH = 'BASIC_AUTH',
  OAUTH2 = 'OAUTH2',
  NONE = 'NONE',
}

export interface BearerTokenAuthConfig {
  method: AuthMethod.BEARER_TOKEN;
  token: string;
}

export interface ApiKeyAuthConfig {
  method: AuthMethod.API_KEY;
  key: string;
  value: string;
  in: 'header' | 'query';
}

export interface BasicAuthConfig {
  method: AuthMethod.BASIC_AUTH;
  username: string;
  password: string;
}

export interface OAuth2AuthConfig {
  method: AuthMethod.OAUTH2;
  tokenUrl: string;
  clientId: string;
  clientSecret: string;
  scopes: string[];
  grantType: 'client_credentials' | 'authorization_code';
}

export interface NoAuthConfig {
  method: AuthMethod.NONE;
}

export type AuthConfig =
  | BearerTokenAuthConfig
  | ApiKeyAuthConfig
  | BasicAuthConfig
  | OAuth2AuthConfig
  | NoAuthConfig;

export type AuthCredential = Record<string, string>;