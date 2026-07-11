import { api } from './api';

export const workflowApi = {
  list: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/v1/workflows?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  create: (data: { projectId: string; name: string; description?: string }) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  publish: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  rollback: (id: string, version?: number) => {
    const params = version ? `?version=${version}` : '';
    return fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}/rollback${params}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  duplicate: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}/duplicate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
    }).then((r) => r.json()),

  execute: (id: string, input?: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: input ? JSON.stringify({ input }) : undefined,
    }).then((r) => r.json()),

  validate: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/${id}/validate`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  getNodeTemplates: () =>
    fetch(`${api.getBaseUrl()}/api/v1/workflows/node-templates`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),
};