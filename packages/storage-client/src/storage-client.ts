import type {
  BucketDefinition, CreateBucketInput, UpdateBucketInput, BucketStats,
  FileDefinition, FileListResult, FileVersion,
  UploadResult, SignedUrlRequest, SignedUrlResult,
} from '@forge/storage-types';

export interface StorageClientConfig {
  baseUrl: string;
  apiKey?: string;
  projectId: string;
}

export class StorageClient {
  private readonly baseUrl: string;
  private readonly projectId: string;
  private readonly headers: Record<string, string>;

  constructor(config: StorageClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.projectId = config.projectId;
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    };
  }

  // ---- Buckets ----

  async listBuckets(): Promise<BucketDefinition[]> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets?projectId=${this.projectId}`, { headers: this.headers });
    return this.handleResponse(res);
  }

  async getBucket(id: string): Promise<BucketDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${id}`, { headers: this.headers });
    return this.handleResponse(res);
  }

  async createBucket(input: CreateBucketInput): Promise<BucketDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets?projectId=${this.projectId}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(input),
    });
    return this.handleResponse(res);
  }

  async updateBucket(id: string, input: UpdateBucketInput): Promise<BucketDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(input),
    });
    return this.handleResponse(res);
  }

  async deleteBucket(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    this.handleResponse(res);
  }

  async getBucketStats(id: string): Promise<BucketStats> {
    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${id}/stats`, { headers: this.headers });
    return this.handleResponse(res);
  }

  // ---- Files ----

  async listFiles(bucketId: string, options?: {
    folder?: string; offset?: number; limit?: number; mimeType?: string; search?: string;
  }): Promise<FileListResult> {
    const params = new URLSearchParams();
    if (options?.folder) params.set('folder', options.folder);
    if (options?.offset) params.set('offset', String(options.offset));
    if (options?.limit) params.set('limit', String(options.limit));
    if (options?.mimeType) params.set('mimeType', options.mimeType);
    if (options?.search) params.set('search', options.search);

    const res = await fetch(
      `${this.baseUrl}/api/storage/buckets/${bucketId}/files?${params}`,
      { headers: this.headers },
    );
    return this.handleResponse(res);
  }

  async getFile(id: string): Promise<FileDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${id}`, { headers: this.headers });
    return this.handleResponse(res);
  }

  async deleteFile(id: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    this.handleResponse(res);
  }

  async getFileVersions(id: string): Promise<FileVersion[]> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${id}/versions`, { headers: this.headers });
    return this.handleResponse(res);
  }

  async restoreFileVersion(fileId: string, versionId: string): Promise<FileDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${fileId}/restore/${versionId}`, {
      method: 'POST',
      headers: this.headers,
    });
    return this.handleResponse(res);
  }

  async moveFile(fileId: string, folder: string): Promise<FileDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${fileId}/move`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ folder }),
    });
    return this.handleResponse(res);
  }

  async copyFile(fileId: string, targetBucketId: string, targetFolder?: string): Promise<FileDefinition> {
    const res = await fetch(`${this.baseUrl}/api/storage/files/${fileId}/copy`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ targetBucketId, targetFolder }),
    });
    return this.handleResponse(res);
  }

  async listFolders(bucketId: string, prefix?: string): Promise<{ name: string; path: string; fileCount: number; totalSizeBytes: number; updatedAt: string }[]> {
    const params = prefix ? `?prefix=${encodeURIComponent(prefix)}` : '';
    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${bucketId}/folders${params}`, { headers: this.headers });
    return this.handleResponse(res);
  }

  // ---- Upload ----

  async uploadFile(bucketId: string, file: File, options?: {
    folder?: string; tags?: string[];
  }): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags));

    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${bucketId}/upload`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(res);
  }

  async uploadBuffer(bucketId: string, data: Blob, fileName: string, options?: {
    folder?: string; tags?: string[]; mimeType?: string;
  }): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', data, fileName);
    if (options?.folder) formData.append('folder', options.folder);
    if (options?.tags) formData.append('tags', JSON.stringify(options.tags));

    const res = await fetch(`${this.baseUrl}/api/storage/buckets/${bucketId}/upload`, {
      method: 'POST',
      body: formData,
    });
    return this.handleResponse(res);
  }

  // ---- Signed URLs ----

  async generateSignedUrl(request: SignedUrlRequest): Promise<SignedUrlResult> {
    const res = await fetch(`${this.baseUrl}/api/storage/signed-url`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });
    return this.handleResponse(res);
  }

  // ---- Download URL ----

  getDownloadUrl(fileId: string): string {
    return `${this.baseUrl}/api/storage/files/${fileId}/download`;
  }

  // ---- Helpers ----

  private async handleResponse(res: Response): Promise<any> {
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`Storage API error ${res.status}: ${body || res.statusText}`);
    }
    if (res.status === 204) return undefined;
    return res.json();
  }
}