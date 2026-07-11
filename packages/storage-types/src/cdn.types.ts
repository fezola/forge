export interface CdnConfig {
  id: string;
  bucketId: string;
  enabled: boolean;
  provider?: 'cloudflare' | 'aws_cloudfront' | 'fastly' | 'akamai' | 'custom';
  domain?: string;
  originPath?: string;
  ttlSeconds: number;
  ttlOverrideSeconds?: number;
  customHeaders?: Record<string, string>;
  cacheKeyParams?: string[];
  cacheKeyHeaders?: string[];
  allowedMethods?: ('GET' | 'HEAD' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[];
  enableGzip?: boolean;
  enableBrotli?: boolean;
  enableWebp?: boolean;
  enableAvif?: boolean;
  restrictByReferrer?: boolean;
  allowedReferrers?: string[];
  wafEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CdnPurgeRequest {
  paths: string[];
  type: 'single' | 'wildcard' | 'all';
}

export interface CdnUrlResult {
  fileId: string;
  cdnUrl: string;
  edgeCacheHit: boolean;
  ttlSeconds: number;
  generatedAt: string;
}

export interface CdnMetrics {
  requestsPerSecond: number;
  bandwidthBps: number;
  cacheHitRatio: number;
  originRequestsPerSecond: number;
  errorRate: number;
  topPaths: { path: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}