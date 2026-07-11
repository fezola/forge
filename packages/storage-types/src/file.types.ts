export type FileStatus = 'uploading' | 'processing' | 'ready' | 'failed' | 'deleted';

export interface FileDefinition {
  id: string;
  bucketId: string;
  projectId: string;
  name: string;
  originalName: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  status: FileStatus;
  storagePath: string;
  publicUrl?: string;
  cdnUrl?: string;
  checksum: string;
  checksumAlgorithm: 'sha256' | 'md5';
  width?: number;
  height?: number;
  durationMs?: number;
  tags: string[];
  folder?: string;
  version: number;
  isLatestVersion: boolean;
  parentFileId?: string;
  metadata?: Record<string, unknown>;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface FileVersion {
  id: string;
  fileId: string;
  versionNumber: number;
  sizeBytes: number;
  storagePath: string;
  checksum: string;
  uploadedBy: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface CreateFileInput {
  bucketId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string;
  checksum: string;
  checksumAlgorithm?: 'sha256' | 'md5';
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  width?: number;
  height?: number;
  durationMs?: number;
}

export interface UpdateFileInput {
  name?: string;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  status?: FileStatus;
}

export interface FileFilter {
  bucketId?: string;
  folder?: string;
  tags?: string[];
  mimeType?: string;
  mimeCategory?: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'data' | 'other';
  status?: FileStatus;
  uploadedBy?: string;
  searchQuery?: string;
  createdAfter?: string;
  createdBefore?: string;
  sizeMinBytes?: number;
  sizeMaxBytes?: number;
  includeDeleted?: boolean;
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'sizeBytes' | 'version';
  sortDirection?: 'asc' | 'desc';
  offset?: number;
  limit?: number;
}

export interface FileListResult {
  items: FileDefinition[];
  total: number;
  offset: number;
  limit: number;
}

export interface FolderInfo {
  name: string;
  path: string;
  fileCount: number;
  totalSizeBytes: number;
  updatedAt: string;
}