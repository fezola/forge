export type ConnectorCategory = 'authentication' | 'payments' | 'blockchain' | 'ai' | 'email' | 'kyc' | 'storage' | 'messaging' | 'analytics' | 'custom';

export type ConnectorStatus = 'active' | 'inactive' | 'error' | 'updating';

export interface ConnectorManifestDTO {
  id: string;
  name: string;
  version: string;
  description: string;
  category: ConnectorCategory;
  icon?: string;
  tags: string[];
  author: string;
  homepage?: string;
}

export interface ConnectorInstallationDTO {
  id: string;
  projectId: string;
  manifestId: string;
  name: string;
  version: string;
  category: ConnectorCategory;
  status: ConnectorStatus;
  config: Record<string, unknown>;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
