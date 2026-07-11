import { api } from './api';

export const identityApi = {
  list: (projectId: string, offset?: number, limit?: number) => {
    const params = new URLSearchParams({ projectId });
    if (offset !== undefined) params.set('offset', String(offset));
    if (limit !== undefined) params.set('limit', String(limit));
    return fetch(`${api.getBaseUrl()}/api/identity?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/identity/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  listOrganizations: () =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getOrganization: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  createOrganization: (data: { projectId: string; name: string; slug: string; description?: string; ownerId: string }) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateOrganization: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteOrganization: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }),

  getMembers: (orgId: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations/${orgId}/members`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  inviteMember: (orgId: string, email: string, roleId: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/organizations/${orgId}/invites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ email, roleId }),
    }).then(r => r.json()),

  getRoles: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/identity/roles?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },

  assignRole: (identityId: string, roleId: string, organizationId?: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/roles/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ identityId, roleId, organizationId }),
    }).then(r => r.json()),

  removeRole: (identityId: string, roleId: string, organizationId?: string) =>
    fetch(`${api.getBaseUrl()}/api/identity/roles/remove`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ identityId, roleId, organizationId }),
    }),

  getWallets: () =>
    fetch(`${api.getBaseUrl()}/api/identity/wallets`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getSessions: () =>
    fetch(`${api.getBaseUrl()}/api/identity/sessions`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};