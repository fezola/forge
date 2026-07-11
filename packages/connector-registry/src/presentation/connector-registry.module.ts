import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConnectorRegistryService } from '../application/connector-registry.service';
import { InstallConnectorUseCase } from '../application/install-connector.use-case';
import { UpdateConnectorUseCase } from '../application/update-connector.use-case';
import { UninstallConnectorUseCase } from '../application/uninstall-connector.use-case';
import { FsManifestLoader } from '../infrastructure/fs-manifest-loader';
import { PrismaInstallationRepository } from '../infrastructure/prisma-installation.repository';

@Module({
  providers: [
    ConnectorRegistryService,
    InstallConnectorUseCase,
    UpdateConnectorUseCase,
    UninstallConnectorUseCase,
    PrismaClient,
    { provide: 'IInstallationRepository', useClass: PrismaInstallationRepository },
    { provide: 'IManifestLoader', useClass: FsManifestLoader },
  ],
  exports: [ConnectorRegistryService, InstallConnectorUseCase, UpdateConnectorUseCase, UninstallConnectorUseCase],
})
export class ConnectorRegistryModule {}
