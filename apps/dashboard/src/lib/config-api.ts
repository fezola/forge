import { api } from './api';

export const configApi = {
  list: (projectId: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/config?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/config/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  create: (input: any) =>
    fetch(`${api.getBaseUrl()}/api/v1/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(input),
    }).then(r => r.json()),

  update: (id: string, input: any) =>
    fetch(`${api.getBaseUrl()}/api/v1/config/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(input),
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/config/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => { if (!r.ok) throw new Error('Delete failed'); }),

  setValue: (configId: string, environmentId: string, value: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/config/${configId}/values`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ environmentId, value }),
    }).then(r => r.json()),

  featureFlags: {
    list: (projectId?: string) => {
      const params = projectId ? `?projectId=${projectId}` : '';
      return fetch(`${api.getBaseUrl()}/api/v1/config/feature-flags${params}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => r.json());
    },
    create: (input: any) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/feature-flags`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify(input),
      }).then(r => r.json()),
    update: (id: string, input: any) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/feature-flags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify(input),
      }).then(r => r.json()),
    delete: (id: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/feature-flags/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => { if (!r.ok) throw new Error('Delete failed'); }),
    evaluate: (id: string, context?: any) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/feature-flags/${id}/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify(context ?? {}),
      }).then(r => r.json()),
  },

  environments: {
    list: (projectId: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/environments?projectId=${projectId}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => r.json()),
    create: (input: any) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/environments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify(input),
      }).then(r => r.json()),
  },

  secrets: {
    create: (configId: string, value: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/${configId}/secrets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify({ value }),
      }).then(r => r.json()),
    read: (secretId: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/secrets/${secretId}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => r.text()),
    rotate: (secretId: string, newValue: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/secrets/${secretId}/rotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify({ newValue }),
      }).then(r => r.json()),
    revoke: (secretId: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/secrets/${secretId}/revoke`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => { if (!r.ok) throw new Error('Revoke failed'); }),
  },

  brand: {
    get: (projectId: string) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/brand/${projectId}`, {
        headers: { Authorization: `Bearer ${api.getToken()}` },
      }).then(r => r.json()),
    upsert: (projectId: string, input: any) =>
      fetch(`${api.getBaseUrl()}/api/v1/config/brand/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
        body: JSON.stringify(input),
      }).then(r => r.json()),
  },

  audit: (configId?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (configId) params.set('configId', configId);
    if (projectId) params.set('projectId', projectId);
    return fetch(`${api.getBaseUrl()}/api/v1/config/audit?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },
};