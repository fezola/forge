import { Injectable } from '@nestjs/common';
import { ConnectorManifest } from '@forge/connector-sdk';
import { IManifestLoader } from '../domain/manifest.loader.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FsManifestLoader implements IManifestLoader {
  private readonly connectorsDir: string;

  constructor() {
    // Connectors are loaded from a configurable directory
    this.connectorsDir = process.env.CONNECTORS_DIR || path.join(process.cwd(), 'connectors');
  }

  async load(manifestId: string): Promise<ConnectorManifest> {
    const manifestPath = path.join(this.connectorsDir, manifestId, 'connector.json');
    const exists = fs.existsSync(manifestPath);
    if (!exists) throw new Error(`Connector "${manifestId}" not found at ${manifestPath}`);
    const raw = fs.readFileSync(manifestPath, 'utf-8');
    return JSON.parse(raw) as ConnectorManifest;
  }

  async loadAll(): Promise<ConnectorManifest[]> {
    if (!fs.existsSync(this.connectorsDir)) return [];
    const entries = fs.readdirSync(this.connectorsDir, { withFileTypes: true });
    const manifests: ConnectorManifest[] = [];
    for (const entry of entries) {
      if (entry.isDirectory()) {
        try {
          const manifest = await this.load(entry.name);
          manifests.push(manifest);
        } catch {
          // skip invalid connector directories
        }
      }
    }
    return manifests;
  }

  validate(manifest: ConnectorManifest): boolean {
    return !!(
      manifest.id &&
      manifest.name &&
      manifest.version &&
      manifest.actions &&
      manifest.actions.length > 0
    );
  }
}
