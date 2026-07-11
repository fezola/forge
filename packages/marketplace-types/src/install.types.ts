export interface MarketplaceInstall {
  id: string;
  listingId: string;
  projectId: string;
  version: string;
  status: InstallStatus;
  config?: Record<string, unknown> | null;
  installedBy: string;
  installedAt: string;
  updatedAt: string;
}

export type InstallStatus = 'installed' | 'updating' | 'error' | 'removed';
