import { api } from './api';

export const connectorApi = {
  list: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/v1/connectors?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  install: (projectId: string, manifestId: string, config?: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/install`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify({ projectId, manifestId, config }),
    }).then((r) => r.json()),

  uninstall: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  toggle: (id: string, enabled: boolean) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/${id}/toggle`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify({ enabled }),
    }).then((r) => r.json()),

  execute: (installationId: string, actionId: string, input: Record<string, unknown>, projectId: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/${installationId}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify({ actionId, input, projectId }),
    }).then((r) => r.json()),

  browseMarketplace: (query?: string, category?: string, page?: number, limit?: number) => {
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category) params.set('category', category);
    if (page) params.set('page', String(page));
    if (limit) params.set('limit', String(limit));
    return fetch(`${api.getBaseUrl()}/api/v1/marketplace?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  publishMarketplace: (manifestId: string, icon?: File) => {
    const formData = new FormData();
    formData.append('manifestId', manifestId);
    if (icon) formData.append('icon', icon);
    return fetch(`${api.getBaseUrl()}/api/v1/marketplace/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api.getToken()}` },
      body: formData,
    }).then((r) => r.json());
  },

  createCustom: (data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  listCustom: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/v1/connectors/custom?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  getCustom: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  deleteCustom: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  addEndpoint: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom/${id}/endpoints`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  addMapping: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom/${id}/mappings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  testEndpoint: (data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/connectors/custom/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  listSecrets: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/v1/secrets?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  createSecret: (data: { name: string; value: string; provider: string; projectId?: string; connectorId?: string }) =>
    fetch(`${api.getBaseUrl()}/api/v1/secrets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  deleteSecret: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/secrets/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),
};
