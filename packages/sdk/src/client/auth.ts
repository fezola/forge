import { BaseApi } from './base';
import type { AuthTokens, LoginInput, RegisterInput, User } from '@forge/types';

export class AuthApi extends BaseApi {
  async register(input: RegisterInput): Promise<User> {
    const result = await this.post<{ data: User }>('/auth/register', input);
    return result.data;
  }

  async login(input: LoginInput): Promise<AuthTokens> {
    const result = await this.post<{ data: AuthTokens }>('/auth/login', input);
    return result.data;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const result = await this.post<{ data: AuthTokens }>('/auth/refresh', { refreshToken });
    return result.data;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.post('/auth/logout', { refreshToken });
  }
}
