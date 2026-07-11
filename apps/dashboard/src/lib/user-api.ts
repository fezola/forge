import { api } from './api';

export const userApi = {
  list: () =>
    fetch(`${api.getBaseUrl()}/api/users`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/users/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  update: (id: string, data: { name?: string; email?: string; avatar?: string }) =>
    fetch(`${api.getBaseUrl()}/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }),
};
