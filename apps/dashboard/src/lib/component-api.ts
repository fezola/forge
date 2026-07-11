import { api } from './api';

export const componentApi = {
  list: (params?: { type?: string; categoryId?: string; status?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set('type', params.type);
    if (params?.categoryId) qs.set('categoryId', params.categoryId);
    if (params?.status) qs.set('status', params.status);
    const query = qs.toString();
    return fetch(`${api.getBaseUrl()}/api/components${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },

  search: (q: string) =>
    fetch(`${api.getBaseUrl()}/api/components/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/components/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  create: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/components`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (id: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/components/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/components/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  getVersions: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/components/${id}/versions`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getCategories: () =>
    fetch(`${api.getBaseUrl()}/api/components/categories`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getInstalls: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/components/installs${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};
