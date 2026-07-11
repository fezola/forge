import { api } from './api';

export const blockchainApi = {
  getChains: (enabledOnly?: boolean) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/chains${enabledOnly ? '?enabled=true' : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getChain: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/chains/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  createChain: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/chains`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updateChain: (id: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/chains/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  getContracts: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/contracts${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getContract: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/contracts/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  createContract: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/contracts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deleteContract: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/blockchain/contracts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  getTransactions: (projectId?: string, address?: string) => {
    const params = new URLSearchParams();
    if (projectId) params.set('projectId', projectId);
    if (address) params.set('address', address);
    return fetch(`${api.getBaseUrl()}/api/blockchain/transactions?${params}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },
};
