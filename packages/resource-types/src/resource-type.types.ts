export interface ResourceTypeDefinition {
  type: string;
  displayName: string;
  pluralName: string;
  description?: string;
  icon?: string;
  color?: string;
  category: ResourceTypeCategory;
  supportedLifecycles: string[];
  supportsVersions: boolean;
  supportsMetadata: boolean;
  supportsTags: boolean;
  supportsRelationships: boolean;
  supportsComments: boolean;
  supportsPermissions: boolean;
  supportsHealth: boolean;
  supportsDeployments: boolean;
  config?: Record<string, unknown>;
}

export type ResourceTypeCategory =
  | 'core'
  | 'data'
  | 'storage'
  | 'workflow'
  | 'connector'
  | 'identity'
  | 'payment'
  | 'ai'
  | 'deployment'
  | 'template'
  | 'component'
  | 'domain'
  | 'secret'
  | 'function'
  | 'custom';

export const BUILT_IN_RESOURCE_TYPES: ResourceTypeDefinition[] = [
  { type: 'project', displayName: 'Project', pluralName: 'Projects', icon: 'folder', color: '#6366f1', category: 'core', supportedLifecycles: ['active', 'archived', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'user', displayName: 'User', pluralName: 'Users', icon: 'user', color: '#22c55e', category: 'core', supportedLifecycles: ['active', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: false, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'organization', displayName: 'Organization', pluralName: 'Organizations', icon: 'building', color: '#f59e0b', category: 'core', supportedLifecycles: ['active', 'archived', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'workflow', displayName: 'Workflow', pluralName: 'Workflows', icon: 'git-branch', color: '#3b82f6', category: 'workflow', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'connector', displayName: 'Connector', pluralName: 'Connectors', icon: 'plug', color: '#8b5cf6', category: 'connector', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'table', displayName: 'Table', pluralName: 'Tables', icon: 'database', color: '#06b6d4', category: 'data', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'bucket', displayName: 'Bucket', pluralName: 'Buckets', icon: 'archive', color: '#ec4899', category: 'storage', supportedLifecycles: ['active', 'inactive', 'archived', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'file', displayName: 'File', pluralName: 'Files', icon: 'file', color: '#f97316', category: 'storage', supportedLifecycles: ['uploading', 'processing', 'ready', 'failed', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'wallet', displayName: 'Wallet', pluralName: 'Wallets', icon: 'wallet', color: '#14b8a6', category: 'identity', supportedLifecycles: ['active', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: false, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'secret', displayName: 'Secret', pluralName: 'Secrets', icon: 'lock', color: '#dc2626', category: 'secret', supportedLifecycles: ['active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: false, supportsComments: false, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'payment', displayName: 'Payment', pluralName: 'Payments', icon: 'credit-card', color: '#10b981', category: 'payment', supportedLifecycles: ['active', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'deployment', displayName: 'Deployment', pluralName: 'Deployments', icon: 'rocket', color: '#64748b', category: 'deployment', supportedLifecycles: ['creating', 'draft', 'active', 'failed', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'ai_model', displayName: 'AI Model', pluralName: 'AI Models', icon: 'brain', color: '#a855f7', category: 'ai', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'template', displayName: 'Template', pluralName: 'Templates', icon: 'copy', color: '#e11d48', category: 'template', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: false, supportsComments: true, supportsPermissions: true, supportsHealth: false, supportsDeployments: false },
  { type: 'component', displayName: 'Component', pluralName: 'Components', icon: 'puzzle', color: '#0ea5e9', category: 'component', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: false, supportsDeployments: true },
  { type: 'function', displayName: 'Function', pluralName: 'Functions', icon: 'code', color: '#7c3aed', category: 'function', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: true },
  { type: 'domain', displayName: 'Domain', pluralName: 'Domains', icon: 'globe', color: '#0891b2', category: 'domain', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: false, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: false, supportsPermissions: true, supportsHealth: true, supportsDeployments: false },
  { type: 'api', displayName: 'API', pluralName: 'APIs', icon: 'api', color: '#84cc16', category: 'core', supportedLifecycles: ['draft', 'active', 'archived', 'deleted'], supportsVersions: true, supportsMetadata: true, supportsTags: true, supportsRelationships: true, supportsComments: true, supportsPermissions: true, supportsHealth: true, supportsDeployments: true },
];