import { BaseApi } from './base';
import type { User, UpdateUserInput } from '@forge/types';

export class UserApi extends BaseApi {
  async list(): Promise<User[]> {
    const result = await this.get<{ data: User[] }>('/users');
    return result.data;
  }

  async get(id: string): Promise<User> {
    const result = await this.get<{ data: User }>(`/users/${id}`);
    return result.data;
  }

  async me(): Promise<User> {
    const result = await this.get<{ data: User }>('/users/me');
    return result.data;
  }

  async update(id: string, input: UpdateUserInput): Promise<User> {
    const result = await this.put<{ data: User }>(`/users/${id}`, input);
    return result.data;
  }

  async delete(id: string): Promise<void> {
    await this.delete(`/users/${id}`);
  }
}
