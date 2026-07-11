export interface Role {
  id: string;
  projectId: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  permissions: string[];
  isSystem: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export type SystemRoleName = 'owner' | 'admin' | 'editor' | 'moderator' | 'support' | 'developer' | 'designer' | 'viewer';

export const SYSTEM_ROLES: Record<SystemRoleName, Omit<Role, 'id' | 'createdAt' | 'updatedAt'>> = {
  owner: {
    projectId: '',
    organizationId: null,
    name: 'Owner',
    description: 'Full access to everything including billing and settings',
    permissions: ['*'],
    isSystem: true,
    priority: 1000,
  },
  admin: {
    projectId: '',
    organizationId: null,
    name: 'Admin',
    description: 'Full access except billing',
    permissions: ['*'],
    isSystem: true,
    priority: 900,
  },
  editor: {
    projectId: '',
    organizationId: null,
    name: 'Editor',
    description: 'Can create and edit resources',
    permissions: [
      'project:read', 'project:write',
      'workflow:read', 'workflow:write', 'workflow:publish',
      'connector:read', 'connector:write',
    ],
    isSystem: true,
    priority: 700,
  },
  moderator: {
    projectId: '',
    organizationId: null,
    name: 'Moderator',
    description: 'Can manage users and content',
    permissions: [
      'project:read',
      'identity:read', 'identity:write',
      'organization:read', 'organization:write',
      'workflow:read',
    ],
    isSystem: true,
    priority: 600,
  },
  support: {
    projectId: '',
    organizationId: null,
    name: 'Support',
    description: 'Read access to user data and workflows',
    permissions: [
      'project:read',
      'identity:read',
      'organization:read',
      'workflow:read',
    ],
    isSystem: true,
    priority: 500,
  },
  developer: {
    projectId: '',
    organizationId: null,
    name: 'Developer',
    description: 'Can manage connectors and API keys',
    permissions: [
      'project:read', 'project:write',
      'connector:read', 'connector:write', 'connector:install',
      'workflow:read', 'workflow:write', 'workflow:publish',
      'api_key:read', 'api_key:write',
    ],
    isSystem: true,
    priority: 750,
  },
  designer: {
    projectId: '',
    organizationId: null,
    name: 'Designer',
    description: 'Can edit components and layouts',
    permissions: [
      'project:read',
      'component:read', 'component:write',
      'binding:read', 'binding:write',
    ],
    isSystem: true,
    priority: 650,
  },
  viewer: {
    projectId: '',
    organizationId: null,
    name: 'Viewer',
    description: 'Read-only access',
    permissions: ['project:read'],
    isSystem: true,
    priority: 100,
  },
};

export interface IRoleRepository {
  findById(id: string): Promise<Role | null>;
  findByProject(projectId: string): Promise<Role[]>;
  findByOrganization(organizationId: string): Promise<Role[]>;
  create(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role>;
  update(id: string, data: Partial<Role>): Promise<Role>;
  delete(id: string): Promise<void>;
  getIdentityRoles(identityId: string, organizationId?: string): Promise<Role[]>;
  assignRole(identityId: string, roleId: string, organizationId?: string): Promise<void>;
  removeRole(identityId: string, roleId: string, organizationId?: string): Promise<void>;
}