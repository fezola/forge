import { AuthApi } from './auth';
import { ProjectApi } from './projects';
import { UserApi } from './users';
import { DatabaseApi } from './databases';
import { StorageApi } from './storage';

export interface ForgeClientConfig {
  baseUrl: string;
  token?: string;
}

export class ForgeClient {
  public auth: AuthApi;
  public project: ProjectApi;
  public user: UserApi;
  public database: DatabaseApi;
  public storage: StorageApi;
  private config: ForgeClientConfig;

  constructor(config: ForgeClientConfig) {
    this.config = config;
    this.auth = new AuthApi(config);
    this.project = new ProjectApi(config);
    this.user = new UserApi(config);
    this.database = new DatabaseApi(config);
    this.storage = new StorageApi(config);
  }

  setToken(token: string): void {
    this.config.token = token;
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getToken(): string | undefined {
    return this.config.token;
  }
}
