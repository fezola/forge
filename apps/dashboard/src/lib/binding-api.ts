import { api } from './api';

export const bindingApi = {
  list: (projectId: string) => {
    const params = new URLSearchParams({ projectId });
    return fetch(`${api.getBaseUrl()}/api/v1/bindings?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  get: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  create: (data: {
    projectId: string;
    name: string;
    sourceType: string;
    sourceConfig: Record<string, unknown>;
    targetComponentId?: string;
    targetProperty?: string;
  }) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  update: (id: string, data: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(data),
    }).then((r) => r.json()),

  delete: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json()),

  resolveBinding: (id: string, context?: Record<string, unknown>) => {
    const params = context ? new URLSearchParams({ context: JSON.stringify(context) }) : undefined;
    const url = params
      ? `${api.getBaseUrl()}/api/v1/bindings/${id}/resolve?${params}`
      : `${api.getBaseUrl()}/api/v1/bindings/${id}/resolve`;
    return fetch(url, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then((r) => r.json());
  },

  resolveAll: (bindings: string[], context?: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/resolve-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify({ bindingIds: bindings, context }),
    }).then((r) => r.json()),

  evaluateExpression: (expression: string, context: Record<string, unknown>) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify({ expression, context }),
    }).then((r) => r.json()),

  executeQuery: (request: { sourceType: string; config: Record<string, unknown> }) =>
    fetch(`${api.getBaseUrl()}/api/v1/bindings/execute-query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${api.getToken()}`,
      },
      body: JSON.stringify(request),
    }).then((r) => r.json()),
};
