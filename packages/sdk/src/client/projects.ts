import { BaseApi } from './base';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@forge/types';

export class ProjectApi extends BaseApi {
  async list(): Promise<Project[]> {
    const result = await this.get<{ data: Project[] }>('/projects');
    return result.data;
  }

  async get(id: string): Promise<Project> {
    const result = await this.get<{ data: Project }>(`/projects/${id}`);
    return result.data;
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const result = await this.post<{ data: Project }>('/projects', input);
    return result.data;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const result = await this.put<{ data: Project }>(`/projects/${id}`, input);
    return result.data;
  }

  async delete(id: string): Promise<void> {
    await this.delete(`/projects/${id}`);
  }
}
