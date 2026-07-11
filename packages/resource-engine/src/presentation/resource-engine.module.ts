import { Module, Global, OnModuleInit } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ResourceService } from '../application/resource.service';
import { ResourceEventService } from '../infrastructure/resource-event.service';
import { ResourceWorkflowBridgeService } from '../infrastructure/resource-workflow-trigger';
import { ResourceTypeRegistry } from '../infrastructure/resource-type-registry';
import { PrismaResourceRepository } from '../infrastructure/prisma-resource.repository';
import {
  PrismaVersionRepository, PrismaResourcePermissionRepository,
  PrismaRelationshipRepository, PrismaResourceMetadataRepository,
  PrismaCommentRepository, PrismaAuditRepository,
  PrismaActivityRepository, PrismaFavoriteRepository,
  PrismaHealthRepository, PrismaSearchIndexRepository,
} from '../infrastructure/prisma-resource-stores';
import { PrismaClient } from '@prisma/client';
import { BUILT_IN_RESOURCE_TYPES } from '@forge/resource-types';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  providers: [
    ResourceService,
    ResourceEventService,
    ResourceWorkflowBridgeService,
    ResourceTypeRegistry,
    PrismaResourceRepository,
    PrismaVersionRepository,
    PrismaResourcePermissionRepository,
    PrismaRelationshipRepository,
    PrismaResourceMetadataRepository,
    PrismaCommentRepository,
    PrismaAuditRepository,
    PrismaActivityRepository,
    PrismaFavoriteRepository,
    PrismaHealthRepository,
    PrismaSearchIndexRepository,
    PrismaClient,
    {
      provide: 'IResourceRepository',
      useExisting: PrismaResourceRepository,
    },
    {
      provide: 'IResourceTypeRepository',
      useExisting: ResourceTypeRegistry,
    },
    {
      provide: 'IVersionRepository',
      useExisting: PrismaVersionRepository,
    },
    {
      provide: 'IPermissionRepository',
      useExisting: PrismaResourcePermissionRepository,
    },
    {
      provide: 'IRelationshipRepository',
      useExisting: PrismaRelationshipRepository,
    },
    {
      provide: 'IMetadataRepository',
      useExisting: PrismaResourceMetadataRepository,
    },
    {
      provide: 'ICommentRepository',
      useExisting: PrismaCommentRepository,
    },
    {
      provide: 'IAuditRepository',
      useExisting: PrismaAuditRepository,
    },
    {
      provide: 'IActivityRepository',
      useExisting: PrismaActivityRepository,
    },
    {
      provide: 'IFavoriteRepository',
      useExisting: PrismaFavoriteRepository,
    },
    {
      provide: 'IHealthRepository',
      useExisting: PrismaHealthRepository,
    },
    {
      provide: 'ISearchIndexRepository',
      useExisting: PrismaSearchIndexRepository,
    },
    {
      provide: 'IResourceEventPort',
      useExisting: ResourceEventService,
    },
    {
      provide: 'IResourceWorkflowPort',
      useExisting: ResourceWorkflowBridgeService,
    },
  ],
  exports: [
    ResourceService,
    ResourceTypeRegistry,
    ResourceEventService,
    ResourceWorkflowBridgeService,
  ],
})
export class ResourceEngineModule implements OnModuleInit {
  constructor(
    private readonly resourceService: ResourceService,
  ) {}

  onModuleInit() {
    for (const typeDef of BUILT_IN_RESOURCE_TYPES) {
      try {
        this.resourceService.registerType(typeDef);
      } catch {
        // already registered
      }
    }
  }
}