export { ResourceEngineModule } from './presentation/resource-engine.module';
export { ResourceService } from './application/resource.service';
export { ResourceTypeRegistry } from './infrastructure/resource-type-registry';
export { ResourceEventService } from './infrastructure/resource-event.service';
export { ResourceWorkflowBridgeService } from './infrastructure/resource-workflow-trigger';
export type {
  IResourceRepository, IResourceTypeRepository, IVersionRepository,
  IPermissionRepository, IRelationshipRepository, IMetadataRepository,
  ICommentRepository, IAuditRepository, IActivityRepository,
  IFavoriteRepository, IHealthRepository, ISearchIndexRepository,
  IResourceEventPort, IResourceWorkflowPort,
} from './domain/resource-interfaces';