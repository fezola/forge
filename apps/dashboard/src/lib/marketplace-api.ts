import { api } from './api';

export const marketplaceApi = {
  getStats: () =>
    fetch(`${api.getBaseUrl()}/api/marketplace/stats`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  list: (params?: { category?: string; type?: string; status?: string; featured?: boolean }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.type) qs.set('type', params.type);
    if (params?.status) qs.set('status', params.status);
    if (params?.featured) qs.set('featured', 'true');
    const query = qs.toString();
    return fetch(`${api.getBaseUrl()}/api/marketplace/listings${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },

  search: (q: string) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/listings/search?q=${encodeURIComponent(q)}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/listings/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  create: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/listings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (id: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/listings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/listings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  getInstalls: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/marketplace/installs${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};
