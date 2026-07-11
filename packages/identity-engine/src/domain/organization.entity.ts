import { Organization, OrganizationSettings } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';

export class OrganizationEntity implements Organization {
  public readonly id!: string;
  public projectId!: string;
  public name!: string;
  public slug!: string;
  public description!: string | null;
  public logoUrl!: string | null;
  public ownerId!: string;
  public settings!: OrganizationSettings;
  public memberCount!: number;
  public createdAt!: string;
  public updatedAt!: string;

  constructor(data: Organization) {
    Object.assign(this, data);
  }

  static create(data: {
    projectId: string;
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
    ownerId: string;
    settings?: Partial<OrganizationSettings>;
  }): OrganizationEntity {
    return new OrganizationEntity({
      id: uuid(),
      projectId: data.projectId,
      name: data.name,
      slug: data.slug,
      description: data.description ?? null,
      logoUrl: data.logoUrl ?? null,
      ownerId: data.ownerId,
      settings: {
        require2FA: false,
        allowedDomains: [],
        maxMembers: 100,
        defaultRoleId: 'viewer',
        ssoEnabled: false,
        ssoProviderId: null,
        ...data.settings,
      },
      memberCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  update(data: Partial<Organization>): void {
    Object.assign(this, data);
    this.updatedAt = new Date().toISOString();
  }
}