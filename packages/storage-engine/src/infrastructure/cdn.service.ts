import { Injectable, Logger } from '@nestjs/common';
import type {
  CdnConfig, CdnPurgeRequest, CdnMetrics, FileDefinition,
} from '@forge/storage-types';
import type { ICdnService } from '../domain/storage-interfaces';

@Injectable()
export class CdnService implements ICdnService {
  private readonly logger = new Logger(CdnService.name);
  private configs = new Map<string, CdnConfig>();

  async enableForBucket(bucketId: string, config?: Partial<CdnConfig>): Promise<CdnConfig> {
    const fullConfig: CdnConfig = {
      id: `cdn-${bucketId}`,
      bucketId,
      enabled: true,
      provider: config?.provider || 'cloudflare',
      domain: config?.domain,
      ttlSeconds: config?.ttlSeconds ?? 3600,
      originPath: config?.originPath || `/storage/${bucketId}`,
      enableGzip: config?.enableGzip ?? true,
      enableBrotli: config?.enableBrotli ?? true,
      enableWebp: config?.enableWebp ?? true,
      enableAvif: config?.enableAvif ?? false,
      customHeaders: config?.customHeaders,
      cacheKeyParams: config?.cacheKeyParams,
      cacheKeyHeaders: config?.cacheKeyHeaders,
      allowedMethods: config?.allowedMethods || ['GET', 'HEAD'],
      restrictByReferrer: config?.restrictByReferrer ?? false,
      allowedReferrers: config?.allowedReferrers,
      wafEnabled: config?.wafEnabled ?? false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.configs.set(bucketId, fullConfig);
    return fullConfig;
  }

  async disableForBucket(bucketId: string): Promise<void> {
    this.configs.delete(bucketId);
  }

  async getConfig(bucketId: string): Promise<CdnConfig | null> {
    return this.configs.get(bucketId) || null;
  }

  async getUrl(file: FileDefinition): Promise<string> {
    const config = this.configs.get(file.bucketId);
    if (!config || !config.enabled || !config.domain) {
      return file.publicUrl || '';
    }

    const baseUrl = `https://${config.domain}`;
    return `${baseUrl}/${file.storagePath}`;
  }

  async purge(_request: CdnPurgeRequest): Promise<void> {
    this.logger.warn('CDN purge not implemented — provider-specific implementation required');
  }

  async getMetrics(_bucketId: string): Promise<CdnMetrics> {
    return {
      requestsPerSecond: 0,
      bandwidthBps: 0,
      cacheHitRatio: 0,
      originRequestsPerSecond: 0,
      errorRate: 0,
      topPaths: [],
      topReferrers: [],
    };
  }
}