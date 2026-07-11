import { api } from './api';

export const projectApi = {
  list: () =>
    fetch(`${api.getBaseUrl()}/api/projects`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/projects/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  create: (data: { name: string; description?: string }) =>
    fetch(`${api.getBaseUrl()}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/projects/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }),
};