import { api } from './api';

export const deploymentApi = {
  getStats: () =>
    fetch(`${api.getBaseUrl()}/api/deployment/stats`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),

  listEnvironments: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return fetch(`${api.getBaseUrl()}/api/deployment/environments${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },

  getEnvironment: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/deployment/environments/${id}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),

  createEnvironment: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/deployment/environments`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` }, body: JSON.stringify(data),
    }).then(r => r.json()),

  listDeployments: (environmentId?: string, projectId?: string) => {
    const params = new URLSearchParams();
    if (environmentId) params.set('environmentId', environmentId);
    if (projectId) params.set('projectId', projectId);
    const qs = params.toString();
    return fetch(`${api.getBaseUrl()}/api/deployment/deployments${qs ? `?${qs}` : ''}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },

  getDeployment: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/deployment/deployments/${id}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),

  rollback: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/deployment/deployments/${id}/rollback`, {
      method: 'POST', headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getDomains: (environmentId?: string) => {
    const qs = environmentId ? `?environmentId=${environmentId}` : '';
    return fetch(`${api.getBaseUrl()}/api/deployment/domains${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },

  getBuildConfig: (environmentId: string) =>
    fetch(`${api.getBaseUrl()}/api/deployment/build-config/${environmentId}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),

  upsertBuildConfig: (environmentId: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/deployment/build-config/${environmentId}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` }, body: JSON.stringify(data),
    }).then(r => r.json()),

  getSecrets: (environmentId: string) =>
    fetch(`${api.getBaseUrl()}/api/deployment/secrets/${environmentId}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),
};
