import { ConnectorManifest } from '@forge/connector-sdk';

export class ConnectorInstallationEntity {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly manifestId: string,
    public readonly name: string,
    public readonly version: string,
    public readonly category: string,
    public status: 'active' | 'inactive' | 'error' | 'updating',
    public config: Record<string, unknown>,
    public enabled: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static install(projectId: string, manifest: ConnectorManifest, config?: Record<string, unknown>): ConnectorInstallationEntity {
    return new ConnectorInstallationEntity(
      crypto.randomUUID(),
      projectId,
      manifest.id,
      manifest.name,
      manifest.version,
      manifest.category,
      'active',
      config || {},
      true,
      new Date(),
      new Date(),
    );
  }

  enable(): void {
    this.enabled = true;
    this.updatedAt = new Date();
  }

  disable(): void {
    this.enabled = false;
    this.updatedAt = new Date();
  }

  updateVersion(version: string, config?: Record<string, unknown>): void {
    this.version = version;
    if (config) this.config = config;
    this.updatedAt = new Date();
  }

  markError(): void {
    this.status = 'error';
    this.updatedAt = new Date();
  }
}
