import { api } from './api';

export const billingApi = {
  getPlans: () =>
    fetch(`${api.getBaseUrl()}/api/payment/plans`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getPublicPlans: () =>
    fetch(`${api.getBaseUrl()}/api/payment/plans?publicOnly=true`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getPlan: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/plans/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  createPlan: (data: any) =>
    fetch(`${api.getBaseUrl()}/api/payment/plans`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  updatePlan: (id: string, data: any) =>
    fetch(`${api.getBaseUrl()}/api/payment/plans/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  deletePlan: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/plans/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  addFeature: (planId: string, data: { key: string; name: string; value: string; highlight?: boolean }) =>
    fetch(`${api.getBaseUrl()}/api/payment/plans/${planId}/features`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),

  removeFeature: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/features/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${api.getToken()}` } }),

  getSubscriptions: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/subscriptions${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getSubscription: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/subscriptions/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getInvoices: (projectId?: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/invoices${projectId ? `?projectId=${projectId}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getInvoice: (id: string) =>
    fetch(`${api.getBaseUrl()}/api/payment/invoices/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};
