import { Injectable, Inject } from '@nestjs/common';
import { IActionExecutor } from '../domain/action-executor.interface';
import { SecretManagerService } from '@forge/secret-manager';
import { ConnectorInstallationEntity } from '@forge/connector-registry';
import { ConnectorManifest } from '@forge/connector-sdk';

@Injectable()
export class ActionOrchestratorService {
  constructor(
    @Inject('IActionExecutor')
    private readonly executor: IActionExecutor,
    private readonly secrets: SecretManagerService,
  ) {}

  async execute(
    installation: ConnectorInstallationEntity,
    manifest: ConnectorManifest,
    actionId: string,
    input: Record<string, unknown>,
    projectId: string,
  ) {
    const action = manifest.actions.find(a => a.id === actionId);
    if (!action) throw new Error(`Action "${actionId}" not found in connector "${manifest.name}"`);

    const secrets = await this.secrets.resolveForExecution(projectId, installation.id);

    const context = {
      requestId: crypto.randomUUID(),
      projectId,
      environment: (process.env.NODE_ENV === 'production' ? 'production' : 'development') as 'development' | 'production',
      secrets,
      actionId,
      input,
      permissions: manifest.permissions,
    };

    return this.executor.execute(
      {
        id: manifest.id,
        name: manifest.name,
        version: manifest.version,
        category: manifest.category as any,
        description: manifest.description,
        tags: manifest.tags || [],
        author: manifest.author,
      },
      context,
    );
  }
}
