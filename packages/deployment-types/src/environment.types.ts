export interface DeploymentEnvironment {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  type: 'production' | 'staging' | 'preview' | 'development';
  branch?: string | null;
  autoDeploy: boolean;
  buildCommand?: string | null;
  outputDir?: string | null;
  nodeVersion?: string | null;
  installCommand?: string | null;
  envVars?: Record<string, string> | null;
  status: 'active' | 'inactive' | 'archived';
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type EnvironmentType = 'production' | 'staging' | 'preview' | 'development';
export type EnvironmentStatus = 'active' | 'inactive' | 'archived';
