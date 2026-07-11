import { BaseApi } from './base';
import type { Storage, StorageFile, UploadFileInput } from '@forge/types';

export class StorageApi extends BaseApi {
  async list(projectId: string): Promise<StorageFile[]> {
    const result = await this.get<{ data: StorageFile[] }>(`/projects/${projectId}/storage`);
    return result.data;
  }

  async upload(projectId: string, input: UploadFileInput): Promise<StorageFile> {
    const formData = new FormData();
    formData.append('file', input.file);
    const result = await this.request<{ data: StorageFile }>(`/projects/${projectId}/storage`, {
      method: 'POST',
      body: formData,
    });
    return result.data;
  }

  async delete(projectId: string, key: string): Promise<void> {
    await this.delete(`/projects/${projectId}/storage/${key}`);
  }
}
