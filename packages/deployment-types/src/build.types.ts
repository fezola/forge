export interface DeploymentBuildConfig {
  id: string;
  environmentId: string;
  provider: 'docker' | 'nixpacks' | 'static' | 'node';
  dockerfilePath?: string | null;
  buildArgs?: Record<string, string> | null;
  cacheFrom?: string[];
  platform?: string | null;
  resourceClass?: 'small' | 'medium' | 'large' | 'xlarge';
  timeoutSec?: number | null;
  createdAt: string;
  updatedAt: string;
}

export type BuildProvider = 'docker' | 'nixpacks' | 'static' | 'node';
export type ResourceClass = 'small' | 'medium' | 'large' | 'xlarge';
