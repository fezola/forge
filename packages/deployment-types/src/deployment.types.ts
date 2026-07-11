export interface Deployment {
  id: string;
  environmentId: string;
  projectId: string;
  version: string;
  status: DeploymentStatus;
  branch?: string | null;
  commitSha?: string | null;
  commitMessage?: string | null;
  commitAuthor?: string | null;
  commitUrl?: string | null;
  imageTag?: string | null;
  containerId?: string | null;
  url?: string | null;
  logs?: string | null;
  errorMessage?: string | null;
  durationMs?: number | null;
  deployedBy: string;
  deployedAt?: string | null;
  rollbackToId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export type DeploymentStatus = 'pending' | 'building' | 'deploying' | 'active' | 'failed' | 'rolled_back' | 'cancelled';
