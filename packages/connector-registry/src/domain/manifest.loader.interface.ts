import { ConnectorManifest } from '@forge/connector-sdk';

export interface IManifestLoader {
  load(manifestId: string): Promise<ConnectorManifest>;
  loadAll(): Promise<ConnectorManifest[]>;
  validate(manifest: ConnectorManifest): boolean;
}
