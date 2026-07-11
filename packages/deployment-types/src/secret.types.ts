export interface DeploymentSecret {
  id: string;
  environmentId: string;
  projectId: string;
  name: string;
  value: string;
  isBuildTime: boolean;
  createdAt: string;
  updatedAt: string;
}
