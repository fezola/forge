import { Injectable } from '@nestjs/common';
import { ConnectorRuntimeService } from '@forge/connector-runtime';
import { ConnectorRegistryService } from '@forge/connector-registry';
import { ConnectorMarketplaceService } from '@forge/connector-marketplace';
import { CustomConnectorService, EndpointTestService } from '@forge/custom-connector';
import { SecretManagerService } from '@forge/secret-manager';

@Injectable()
export class ConnectorFacade {
  constructor(
    private readonly runtime: ConnectorRuntimeService,
    private readonly registry: ConnectorRegistryService,
    private readonly marketplace: ConnectorMarketplaceService,
    private readonly customConnector: CustomConnectorService,
    private readonly endpointTest: EndpointTestService,
    private readonly secrets: SecretManagerService,
  ) {}

  // --- Registry ---
  async listInstalled(projectId: string) {
    return this.registry.list(projectId);
  }

  async listAvailable() {
    return this.marketplace.browse();
  }

  async getInstallation(id: string) {
    return this.registry.get(id);
  }

  async install(projectId: string, manifestId: string, config?: Record<string, unknown>) {
    return this.registry.install(projectId, manifestId, config);
  }

  async uninstall(id: string) {
    return this.registry.uninstall(id);
  }

  async toggle(id: string, enabled: boolean) {
    return this.registry.toggle(id, enabled);
  }

  async updateConfig(id: string, config: Record<string, unknown>) {
    return this.registry.update(id, config);
  }

  // --- Runtime ---
  async execute(installationId: string, actionId: string, input: Record<string, unknown>, projectId: string) {
    return this.runtime.execute(installationId, actionId, input, projectId);
  }

  async executeWorkflow(projectId: string, steps: Array<{ connectorId: string; actionId: string; input: Record<string, unknown> }>) {
    return this.runtime.executeTest({ baseUrl: '', method: 'POST', path: '' });
  }

  // --- Marketplace ---
  async browseMarketplace(query?: string, category?: string, page?: number, limit?: number) {
    return this.marketplace.browse(query, category, page, limit);
  }

  async publishToMarketplace(manifestId: string, icon?: string) {
    return this.marketplace.publish(manifestId, icon);
  }

  async installFromMarketplace(projectId: string, marketplaceId: string, config?: Record<string, unknown>) {
    return this.marketplace.install(projectId, marketplaceId, config);
  }

  // --- Custom Connectors ---
  async createCustom(input: { projectId: string; name: string; description?: string; authConfig: any; baseUrl: string; globalHeaders?: Record<string, string> }) {
    return this.customConnector.create(input);
  }

  async listCustom(projectId: string) {
    return this.customConnector.list(projectId);
  }

  async getCustom(id: string) {
    return this.customConnector.get(id);
  }

  async deleteCustom(id: string) {
    return this.customConnector.delete(id);
  }

  async addCustomEndpoint(connectorId: string, input: any) {
    return this.customConnector.addEndpoint(connectorId, input);
  }

  async addCustomMapping(connectorId: string, input: any) {
    return this.customConnector.addResponseMapping(connectorId, input);
  }

  async generateCustomManifest(connectorId: string) {
    return this.customConnector.generateManifest(connectorId);
  }

  async testEndpoint(input: { baseUrl: string; method: string; path: string; headers?: Record<string, string>; body?: unknown; authConfig?: any }) {
    return this.endpointTest.testEndpoint(input);
  }

  // --- Secrets ---
  async listSecrets(projectId: string) {
    return this.secrets.list(projectId);
  }

  async createSecret(input: { name: string; value: string; provider: string; projectId?: string; connectorId?: string }) {
    return this.secrets.create(input);
  }

  async deleteSecret(id: string) {
    return this.secrets.delete(id);
  }
}
