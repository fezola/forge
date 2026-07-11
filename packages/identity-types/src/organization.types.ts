export interface Organization {
  id: string;
  projectId: string;
  name: string;
  slug: string;
  description: string | null;
  logoUrl: string | null;
  ownerId: string;
  settings: OrganizationSettings;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationSettings {
  require2FA: boolean;
  allowedDomains: string[];
  maxMembers: number;
  defaultRoleId: string;
  ssoEnabled: boolean;
  ssoProviderId: string | null;
}

export interface CreateOrganizationRequest {
  projectId: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId: string;
  settings?: Partial<OrganizationSettings>;
}

export interface UpdateOrganization {
  name?: string;
  slug?: string;
  description?: string | null;
  logoUrl?: string | null;
  settings?: Partial<OrganizationSettings>;
}

export interface OrganizationMember {
  identityId: string;
  organizationId: string;
  roleId: string;
  roleName: string;
  joinedAt: string;
  invitedBy: string;
  status: MembershipStatus;
  displayName: string;
  email: string | null;
  avatarUrl: string | null;
}

export type MembershipStatus = 'active' | 'invited' | 'suspended' | 'left';

export interface InviteMemberRequest {
  organizationId: string;
  email: string;
  roleId: string;
  invitedById: string;
  message?: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  roleId: string;
  token: string;
  expiresAt: string;
  invitedBy: string;
  status: 'pending' | 'accepted' | 'expired' | 'cancelled';
  createdAt: string;
}

export interface Team {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrganizationRepository {
  findById(id: string): Promise<Organization | null>;
  findBySlug(projectId: string, slug: string): Promise<Organization | null>;
  findByIdentity(identityId: string): Promise<Organization[]>;
  create(request: CreateOrganizationRequest): Promise<Organization>;
  update(id: string, data: UpdateOrganization): Promise<Organization>;
  delete(id: string): Promise<void>;
  addMember(identityId: string, organizationId: string, roleId: string, invitedBy: string): Promise<OrganizationMember>;
  removeMember(identityId: string, organizationId: string): Promise<void>;
  updateMemberRole(identityId: string, organizationId: string, roleId: string): Promise<void>;
  getMembers(organizationId: string): Promise<OrganizationMember[]>;
  createInvite(request: InviteMemberRequest): Promise<OrganizationInvite>;
  acceptInvite(token: string, identityId: string): Promise<void>;
  cancelInvite(id: string): Promise<void>;
  findInvitesByEmail(email: string): Promise<OrganizationInvite[]>;
}