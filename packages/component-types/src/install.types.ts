export interface ComponentInstall {
  id: string;
  componentId: string;
  projectId: string;
  version: string;
  config?: Record<string, unknown> | null;
  status: InstallStatus;
  installedBy: string;
  installedAt: string;
  updatedAt: string;
}

export type InstallStatus = 'installed' | 'updating' | 'error' | 'removed';
