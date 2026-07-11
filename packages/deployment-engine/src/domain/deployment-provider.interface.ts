export interface IDeploymentProvider {
  readonly provider: string;
  deploy(input: { imageTag: string; environmentId: string; projectId: string; config: Record<string, unknown> }): Promise<{ url: string; containerId: string }>;
  build(input: { buildConfig: Record<string, unknown>; projectId: string; commitSha: string }): Promise<{ imageTag: string; logs: string }>;
  rollback(containerId: string): Promise<void>;
  healthCheck(containerId: string): Promise<{ status: string; message?: string }>;
}
