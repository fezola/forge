import { api } from './api';

interface CmsCollection {
  id: string;
  name: string;
  projectId: string;
  sourceTableId?: string;
  fieldMapping?: Array<{ forgeFieldId: string; cmsFieldId: string; cmsFieldName: string; cmsFieldType: string }>;
  lastSyncAt?: string;
  lastSyncStatus?: 'success' | 'error' | 'in_progress';
  lastSyncCount?: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

interface SyncHistoryEntry {
  id: string;
  collectionId: string;
  status: 'success' | 'error' | 'in_progress';
  startedAt: string;
  completedAt?: string;
  itemsAdded: number;
  itemsUpdated: number;
  itemsRemoved: number;
  errors: number;
  errorMessage?: string;
  metadata?: any;
}

export const cmsApi = {
  listCollections: (projectId: string): Promise<CmsCollection[]> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  getCollection: (id: string): Promise<CmsCollection> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${id}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),

  triggerSync: (collectionId: string, projectId: string): Promise<{ syncId: string }> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${collectionId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ projectId }),
    }).then(r => r.json()),

  createSync: (collectionId: string, projectId: string): Promise<{ syncId: string }> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${collectionId}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify({ projectId }),
    }).then(r => {
      if (!r.ok) throw new Error('Sync failed');
      return r.json();
    }),

  completeSync: (collectionId: string, syncId: string, result: {
    status: 'success' | 'error';
    itemsAdded?: number;
    itemsUpdated?: number;
    itemsRemoved?: number;
    errors?: number;
    errorMessage?: string;
  }): Promise<SyncHistoryEntry> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${collectionId}/syncs/${syncId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${api.getToken()}` },
      body: JSON.stringify(result),
    }).then(r => r.json()),

  deleteCollection: (id: string): Promise<void> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => { if (!r.ok) throw new Error('Delete failed'); }),

  getSyncHistory: (collectionId: string, status?: string): Promise<SyncHistoryEntry[]> => {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const qs = params.toString();
    return fetch(`${api.getBaseUrl()}/api/v1/cms-collections/${collectionId}/syncs${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json());
  },

  getStats: (projectId: string): Promise<{
    totalCollections: number;
    totalItems: number;
    lastSyncAt?: string;
    activeErrors: number;
  }> =>
    fetch(`${api.getBaseUrl()}/api/v1/cms-collections/stats?projectId=${projectId}`, {
      headers: { Authorization: `Bearer ${api.getToken()}` },
    }).then(r => r.json()),
};