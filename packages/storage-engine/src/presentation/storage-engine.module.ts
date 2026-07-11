import { Module, Global, OnModuleInit } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BucketService } from '../application/bucket.service';
import { FileService } from '../application/file.service';
import { UploadPipelineService } from '../application/upload-pipeline.service';
import { StorageEventService } from '../infrastructure/storage-event.service';
import { StorageWorkflowBridgeService } from '../infrastructure/storage-workflow-trigger';
import { FilesystemProvider } from '../infrastructure/providers/filesystem.provider';
import { StorageProviderRegistry } from '../infrastructure/providers/storage-provider-registry';
import { ImageProcessorService } from '../infrastructure/image-processor.service';
import { StoragePermissionService } from '../infrastructure/storage-permission.service';
import { SignedUrlService } from '../infrastructure/signed-url.service';
import { CdnService } from '../infrastructure/cdn.service';
import { PrismaBucketRepository } from '../infrastructure/prisma-bucket.repository';
import { PrismaFileRepository } from '../infrastructure/prisma-file.repository';
import { PrismaClient } from '@prisma/client';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  providers: [
    BucketService,
    FileService,
    UploadPipelineService,
    StorageEventService,
    StorageWorkflowBridgeService,
    FilesystemProvider,
    StorageProviderRegistry,
ImageProcessorService,
    StoragePermissionService,
    SignedUrlService,
    CdnService,
    PrismaBucketRepository,
    PrismaFileRepository,
    PrismaClient,
    {
      provide: 'IBucketRepository',
      useExisting: PrismaBucketRepository,
    },
    {
      provide: 'IFileRepository',
      useExisting: PrismaFileRepository,
    },
    {
      provide: 'IStorageProviderRegistryPort',
      useExisting: StorageProviderRegistry,
    },
    {
      provide: 'IStorageEventEmitter',
      useExisting: StorageEventService,
    },
    {
      provide: 'IStorageWorkflowBridge',
      useExisting: StorageWorkflowBridgeService,
    },
    {
      provide: 'IImageProcessor',
      useExisting: ImageProcessorService,
    },
    {
      provide: 'IPermissionService',
      useExisting: StoragePermissionService,
    },
    {
      provide: 'ISignedUrlService',
      useExisting: SignedUrlService,
    },
    {
      provide: 'ICdnService',
      useExisting: CdnService,
    },
    {
      provide: 'IStoragePermissionStore',
      useFactory: () => {
        throw new Error('IStoragePermissionStore not implemented — provide a concrete implementation');
      },
    },
    {
      provide: 'IQuotaChecker',
      useFactory: () => ({
        checkProjectQuota: async () => ({ allowed: true, currentBytes: 0, maxBytes: Infinity }),
        checkBucketQuota: async () => ({ allowed: true, currentBytes: 0, maxBytes: Infinity }),
      }),
    },
  ],
  exports: [
    BucketService,
    FileService,
    UploadPipelineService,
    StorageEventService,
    StorageWorkflowBridgeService,
    StorageProviderRegistry,
    FilesystemProvider,
  ],
})
export class StorageEngineModule implements OnModuleInit {
  constructor(
    private readonly providerRegistry: StorageProviderRegistry,
    private readonly filesystemProvider: FilesystemProvider,
  ) {}

  async onModuleInit() {
    this.providerRegistry.register(this.filesystemProvider);
  }
}