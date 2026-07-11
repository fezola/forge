import { Injectable, Logger } from '@nestjs/common';
import { CmsService } from './cms.service';

@Injectable()
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private cleanupIntervalId: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cmsService: CmsService) {}

  onModuleInit() {
    this.intervalId = setInterval(() => this.processPending(), 15_000);
    this.cleanupIntervalId = setInterval(() => this.cleanup(), 60 * 60 * 1000);
    this.logger.log('SyncProcessor started — polling every 15s, cleanup every 60m');
    setTimeout(() => this.processPending(), 1_000);
  }

  onModuleDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
    if (this.cleanupIntervalId) clearInterval(this.cleanupIntervalId);
  }

  private async processPending() {
    try {
      const abandoned = await this.cmsService.getAbandonedSyncs();
      for (const sync of abandoned) {
        this.logger.warn(`Marking abandoned sync ${sync.id} (collection ${sync.collectionId}, started ${sync.startedAt})`);
        await this.cmsService.markAbandoned(sync.id);
      }

      const pending = await this.cmsService.getPendingSyncs();
      await Promise.allSettled(
        pending.map(sync =>
          this.processSync(sync.id, sync.collection).catch(err => {
            this.logger.error(`Sync ${sync.id} failed: ${err.message}`);
          }),
        ),
      );
    } catch (err) {
      this.logger.error(`Sync processor error: ${(err as Error).message}`);
    }
  }

  private async processSync(syncId: string, collection: any) {
    if (!collection?.forgeApiKey || !collection?.forgeBaseUrl) {
      this.logger.log(`Sync ${syncId}: No Forge credentials stored — external processing needed`);
      await this.cmsService.completeSync(syncId, {
        status: 'error',
        errorMessage: 'Forge API credentials not configured on this collection',
        metadata: { needsExternal: true },
      });
      return;
    }

    this.logger.log(`Processing sync ${syncId} for collection ${collection.name}`);

    try {
      const rows = await this.fetchForgeData(collection);
      const result = this.processRows(rows, collection.fieldMapping);
      await this.cmsService.completeSync(syncId, {
        status: 'success',
        itemsAdded: result.added,
        itemsUpdated: result.updated,
        itemsRemoved: result.removed,
        errors: result.errors,
        metadata: { rowsFetched: rows.length, transformed: result.transformed, collectionName: collection.name },
      });
      this.logger.log(`Sync ${syncId} completed: ${result.added} added, ${result.updated} updated, ${result.removed} removed`);
    } catch (err) {
      this.logger.error(`Sync ${syncId} execution failed: ${(err as Error).message}`);
      await this.cmsService.completeSync(syncId, {
        status: 'error',
        errorMessage: (err as Error).message,
      });
    }
  }

  private async fetchForgeData(collection: any): Promise<any[]> {
    if (!collection.sourceTableId) return [];

    const baseUrl = collection.forgeBaseUrl.replace(/\/+$/, '');
    const url = `${baseUrl}/api/v1/projects/${collection.projectId}/tables/${collection.sourceTableId}/rows`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${collection.forgeApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Forge API returned ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return Array.isArray(data) ? data : data.rows ?? data.data ?? [];
  }

  private processRows(rows: any[], fieldMapping: any) {
    const result = { added: rows.length, updated: 0, removed: 0, errors: 0, transformed: 0 };
    if (!fieldMapping || rows.length === 0) return result;

    try {
      for (const row of rows) {
        const mapped: Record<string, any> = {};
        for (const mapping of fieldMapping) {
          const val = this.resolveNestedValue(row, mapping.forgeFieldId);
          if (val !== undefined) {
            mapped[mapping.cmsFieldName || mapping.cmsFieldId] = val;
          }
        }
        result.transformed++;
      }
    } catch {
      result.errors++;
    }

    return result;
  }

  private resolveNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => (current != null ? current[key] : undefined), obj);
  }

  private async cleanup() {
    try {
      const result = await this.cmsService.cleanupOldRecords();
      this.logger.log(`Cleanup removed ${result.count} old sync records`);
    } catch (err) {
      this.logger.error(`Cleanup failed: ${(err as Error).message}`);
    }
  }
}