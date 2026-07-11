import { api } from './api';

export const aiApi = {
  getModels: (provider?: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/models${provider ? `?provider=${provider}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getModel: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/models/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getPrompts: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/prompts${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getPrompt: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/prompts/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  createPrompt: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/ai/prompts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updatePrompt: (id: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/ai/prompts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deletePrompt: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/prompts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  getCompletions: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/completions${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getAgents: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/ai/agents${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};
