export interface ComponentVersion {
  id: string;
  componentId: string;
  version: string;
  changelog?: string | null;
  packageUrl?: string | null;
  sourceUrl?: string | null;
  entryPoint: string;
  dependencies: string[];
  peerDependencies: string[];
  sizeBytes?: number | null;
  checksum?: string | null;
  published: boolean;
  publishedAt?: string | null;
  createdAt: string;
}
