import { Injectable, Inject } from '@nestjs/common';
import { ActionOrchestratorService } from './action-orchestrator.service';
import { ConnectorRegistryService } from '@forge/connector-registry';
import { IManifestLoader } from '@forge/connector-registry';

@Injectable()
export class WorkflowExecutorService {
  constructor(
    private readonly orchestrator: ActionOrchestratorService,
    private readonly registry: ConnectorRegistryService,
    @Inject('IManifestLoader')
    private readonly manifestLoader: IManifestLoader,
  ) {}

  async executeWorkflow(projectId: string, steps: Array<{ connectorId: string; actionId: string; input: Record<string, unknown> }>) {
    const results = [];
    for (const step of steps) {
      const installation = await this.registry.get(step.connectorId);
      if (!installation || !installation.enabled) {
        throw new Error(`Connector "${step.connectorId}" is not installed or disabled`);
      }
      const manifest = await this.manifestLoader.load(installation.manifestId);
      const result = await this.orchestrator.execute(
        installation,
        manifest,
        step.actionId,
        step.input,
        projectId,
      );
      results.push(result);
    }
    return results;
  }
}
