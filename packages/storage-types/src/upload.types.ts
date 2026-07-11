export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface UploadRequest {
  id: string;
  bucketId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  imageProcessing?: ImageProcessingOptions;
  status: UploadStatus;
  uploadUrl?: string;
  uploadMethod: 'direct' | 'signed_url' | 'multipart';
  expiresAt?: string;
  createdAt: string;
}

export interface UploadResult {
  fileId: string;
  bucketId: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  checksum: string;
  publicUrl?: string;
  cdnUrl?: string;
  thumbnails?: ThumbnailInfo[];
  metadata?: Record<string, unknown>;
  version: number;
  createdAt: string;
}

export interface ImageProcessingOptions {
  resize?: ResizeOptions;
  crop?: CropOptions;
  format?: 'original' | 'jpeg' | 'png' | 'webp' | 'avif';
  quality?: number;
  blur?: number;
  watermark?: WatermarkOptions;
  generateThumbnails?: boolean | ThumbnailSpec[];
  backgroundRemoval?: boolean;
  autoOrient?: boolean;
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  withoutEnlargement?: boolean;
}

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WatermarkOptions {
  image?: string;
  text?: string;
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  opacity?: number;
  scale?: number;
}

export interface ThumbnailSpec {
  suffix: string;
  width: number;
  height: number;
  fit?: 'cover' | 'contain' | 'fill';
}

export interface ThumbnailInfo {
  spec: string;
  width: number;
  height: number;
  url: string;
  sizeBytes: number;
}

export interface MultipartUploadInit {
  uploadId: string;
  partsUrl: string[];
  partSizeBytes: number;
  totalParts: number;
  expiresAt: string;
}

export interface MultipartPart {
  partNumber: number;
  etag: string;
  sizeBytes: number;
}

export interface MultipartCompleteInput {
  uploadId: string;
  parts: MultipartPart[];
}