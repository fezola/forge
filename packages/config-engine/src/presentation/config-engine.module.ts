import { Module, Global } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigService } from '../application/config.service';
import { SecretService } from '../application/secret.service';
import { FeatureFlagService } from '../application/feature-flag.service';
import { EnvironmentService } from '../application/environment.service';
import { BrandService } from '../application/brand.service';
import { AuditService } from '../application/audit.service';
import { ValidationService } from '../application/validation.service';
import { InheritanceResolverService } from '../application/inheritance-resolver.service';
import { PrismaConfigRepository } from '../infrastructure/prisma-config.repository';
import { PrismaSecretStore } from '../infrastructure/prisma-secret-store';
import { PrismaEnvironmentRepository } from '../infrastructure/prisma-environment.repository';
import { PrismaFeatureFlagRepository } from '../infrastructure/prisma-feature-flag.repository';
import { PrismaBrandRepository, PrismaBlockchainConfigRepository, PrismaAiConfigRepository } from '../infrastructure/prisma-brand.repository';
import { PrismaConfigAuditLog } from '../infrastructure/prisma-config-audit-log';
import { ConfigEventService } from '../infrastructure/config-event.service';
import { ConfigWorkflowBridge } from '../infrastructure/config-workflow-bridge';
import { EncryptionService } from '../infrastructure/encryption.service';
import { ConfigValidatorImpl } from '../infrastructure/config-validator-impl';
import { PrismaClient } from '@prisma/client';
import { IConfigRepository } from '../domain/config-repository.interface';
import { ISecretStore } from '../domain/secret-store.interface';
import { IEnvironmentRepository } from '../domain/environment-repository.interface';
import { IFeatureFlagRepository } from '../domain/feature-flag-repository.interface';
import { IBrandRepository, IBlockchainConfigRepository, IAiConfigRepository } from '../domain/brand-repository.interface';
import { IConfigAuditLog } from '../domain/config-audit-log.interface';
import { IConfigEventEmitter } from '../domain/config-event-emitter.interface';
import { IConfigWorkflowBridge } from '../domain/config-workflow-bridge.interface';
import { IEncryptionService } from '../domain/encryption-service.interface';
import { IConfigValidator } from '../domain/config-validator.interface';
import { IInheritanceResolver } from '../domain/inheritance-resolver.interface';

@Global()
@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
  ],
  providers: [
    ConfigService,
    SecretService,
    FeatureFlagService,
    EnvironmentService,
    BrandService,
    AuditService,
    ValidationService,
    InheritanceResolverService,
    PrismaConfigRepository,
    PrismaSecretStore,
    PrismaEnvironmentRepository,
    PrismaFeatureFlagRepository,
    PrismaBrandRepository,
    PrismaBlockchainConfigRepository,
    PrismaAiConfigRepository,
    PrismaConfigAuditLog,
    ConfigEventService,
    ConfigWorkflowBridge,
    EncryptionService,
    ConfigValidatorImpl,
    PrismaClient,
    {
      provide: IConfigRepository,
      useExisting: PrismaConfigRepository,
    },
    {
      provide: ISecretStore,
      useExisting: PrismaSecretStore,
    },
    {
      provide: IEnvironmentRepository,
      useExisting: PrismaEnvironmentRepository,
    },
    {
      provide: IFeatureFlagRepository,
      useExisting: PrismaFeatureFlagRepository,
    },
    {
      provide: IBrandRepository,
      useExisting: PrismaBrandRepository,
    },
    {
      provide: IBlockchainConfigRepository,
      useExisting: PrismaBlockchainConfigRepository,
    },
    {
      provide: IAiConfigRepository,
      useExisting: PrismaAiConfigRepository,
    },
    {
      provide: IConfigAuditLog,
      useExisting: PrismaConfigAuditLog,
    },
    {
      provide: IConfigEventEmitter,
      useExisting: ConfigEventService,
    },
    {
      provide: IConfigWorkflowBridge,
      useExisting: ConfigWorkflowBridge,
    },
    {
      provide: IEncryptionService,
      useExisting: EncryptionService,
    },
    {
      provide: IConfigValidator,
      useExisting: ConfigValidatorImpl,
    },
    {
      provide: IInheritanceResolver,
      useExisting: InheritanceResolverService,
    },
  ],
  exports: [
    ConfigService,
    SecretService,
    FeatureFlagService,
    EnvironmentService,
    BrandService,
    AuditService,
    ValidationService,
    InheritanceResolverService,
  ],
})
export class ConfigEngineModule {}
