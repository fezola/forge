import { api } from './api';

export const enterpriseApi = {
  getStats: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return fetch(`${api.getBaseUrl()}/api/enterprise/stats${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },
  listSso: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return fetch(`${api.getBaseUrl()}/api/enterprise/sso${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },
  listRoles: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return fetch(`${api.getBaseUrl()}/api/enterprise/roles${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },
  listAudit: (params?: { projectId?: string; action?: string; severity?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.projectId) qs.set('projectId', params.projectId);
    if (params?.action) qs.set('action', params.action);
    if (params?.severity) qs.set('severity', params.severity);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return fetch(`${api.getBaseUrl()}/api/enterprise/audit${query ? `?${query}` : ''}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },
  listCompliance: (projectId?: string) => {
    const qs = projectId ? `?projectId=${projectId}` : '';
    return fetch(`${api.getBaseUrl()}/api/enterprise/compliance${qs}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json());
  },
  getSettings: (projectId: string) =>
    fetch(`${api.getBaseUrl()}/api/enterprise/settings/${projectId}`, { headers: { Authorization: `Bearer ${api.getToken()}` } }).then(r => r.json()),
};
