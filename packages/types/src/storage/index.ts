export type StorageProvider = 's3' | 'gcs' | 'azure' | 'local';

export interface Storage {
  id: string;
  name: string;
  provider: StorageProvider;
  bucket: string;
  region?: string;
  createdAt: string;
  updatedAt: string;
  projectId: string;
}

export interface StorageFile {
  key: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface UploadFileInput {
  path: string;
  file: File | Buffer;
  mimetype: string;
}
