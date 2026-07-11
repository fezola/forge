import { Injectable, Inject } from '@nestjs/common';
import { ActionOrchestratorService } from './action-orchestrator.service';
import { IConnectorRuntime } from '../domain/runtime.interface';
import { ConnectorRegistryService } from '@forge/connector-registry';
import { IManifestLoader } from '@forge/connector-registry';
import { ConnectorExecutionResult } from '@forge/connector-sdk';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ConnectorRuntimeService implements IConnectorRuntime {
  constructor(
    private readonly orchestrator: ActionOrchestratorService,
    private readonly registry: ConnectorRegistryService,
    @Inject('IManifestLoader')
    private readonly manifestLoader: IManifestLoader,
    private readonly httpService: HttpService,
  ) {}

  async execute(
    installationId: string,
    actionId: string,
    input: Record<string, unknown>,
    projectId: string,
  ): Promise<ConnectorExecutionResult> {
    const installation = await this.registry.get(installationId);
    if (!installation) throw new Error(`Connector installation "${installationId}" not found`);
    if (!installation.enabled) throw new Error(`Connector "${installation.name}" is disabled`);

    const manifest = await this.manifestLoader.load(installation.manifestId);
    return this.orchestrator.execute(installation, manifest, actionId, input, projectId);
  }

  async executeTest(config: { baseUrl: string; method: string; path: string; headers?: Record<string, string> }, body?: unknown): Promise<ConnectorExecutionResult> {
    const start = Date.now();
    try {
      const response = await firstValueFrom(
        this.httpService.request({
          url: `${config.baseUrl}${config.path}`,
          method: config.method as any,
          headers: config.headers,
          data: body,
          timeout: 30000,
        }),
      );
      return { success: true, statusCode: response.status, data: response.data, duration: Date.now() - start };
    } catch (error: any) {
      return { success: false, statusCode: error?.response?.status || 500, data: error?.response?.data || error.message, duration: Date.now() - start };
    }
  }

  async validate(installationId: string): Promise<boolean> {
    try {
      const installation = await this.registry.get(installationId);
      if (!installation) return false;
      const manifest = await this.manifestLoader.load(installation.manifestId);
      return !!manifest;
    } catch { return false; }
  }

  async health(): Promise<{ status: string; activeConnectors: number }> {
    return { status: 'healthy', activeConnectors: 0 };
  }
}
