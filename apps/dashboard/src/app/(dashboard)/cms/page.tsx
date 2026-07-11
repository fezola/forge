'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCmsCollectionsPage, useCmsStats } from '../../../hooks/use-cms-page';
import { cmsApi } from '../../../lib/cms-api';

export default function CmsCollectionsPage() {
  const { collections, loading, error, mutate } = useCmsCollectionsPage();
  const { stats, mutate: refreshStats } = useCmsStats();
  const [syncing, setSyncing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const hasActive = collections.some((c: any) => c.lastSyncStatus === 'in_progress');
    if (hasActive) {
      const timer = setInterval(() => mutate(), 10_000);
      return () => clearInterval(timer);
    }
  }, [collections]);

  const handleSync = async (collectionId: string) => {
    setSyncing(collectionId);
    try {
      await cmsApi.triggerSync(collectionId, 'default');
    } catch { /* ignore */ }
    setSyncing(null);
    mutate();
    refreshStats();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this CMS collection mapping? This does not delete the Framer CMS collection itself.')) return;
    await cmsApi.deleteCollection(id);
    mutate();
    refreshStats();
  };

  const filtered = statusFilter === 'all'
    ? collections
    : collections.filter((c: any) => c.lastSyncStatus === statusFilter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CMS Collections</h1>
          <p className="text-muted-foreground mt-1">
            Manage Forge-to-Framer CMS collection mappings and sync status.
          </p>
        </div>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-4 gap-4">
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.totalCollections ?? 0}</div>
            <p className="text-sm text-muted-foreground">Collections</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className="text-2xl font-bold">{stats.totalItems ?? 0}</div>
            <p className="text-sm text-muted-foreground">Synced Items</p>
          </div>
          <div className="rounded-lg border p-4">
            <div className={`text-2xl font-bold ${stats.lastSyncAt ? 'text-green-600' : 'text-muted-foreground'}`}>
              {stats.lastSyncAt ? new Date(stats.lastSyncAt).toLocaleTimeString() : '—'}
            </div>
            <p className="text-sm text-muted-foreground">
              Last Sync {stats.lastSyncAt ? `(${Math.round((Date.now() - new Date(stats.lastSyncAt).getTime()) / 60000)}m ago)` : ''}
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <div className={`text-2xl font-bold ${stats.activeErrors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.activeErrors ?? 0}
            </div>
            <p className="text-sm text-muted-foreground">Active Errors</p>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Filter:</span>
        {['all', 'success', 'error', 'in_progress', 'never'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={`rounded-full px-3 py-1 text-xs ${
              statusFilter === f ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'
            }`}
          >
            {f === 'in_progress' ? 'running' : f}
          </button>
        ))}
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Source Table</th>
              <th className="px-4 py-3 font-medium">Items</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Sync</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((col: any) => (
              <tr key={col.id} className={`border-b text-sm last:border-0 hover:bg-muted/50 ${col.lastSyncStatus === 'in_progress' ? 'bg-blue-50/50' : ''}`}>
                <td className="px-4 py-3">
                  <Link href={`/cms/${col.id}`} className="font-medium text-primary hover:underline">
                    {col.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{col.sourceTableId || '—'}</td>
                <td className="px-4 py-3">{col.itemCount ?? 0}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    col.lastSyncStatus === 'success' ? 'bg-green-100 text-green-700' :
                    col.lastSyncStatus === 'error' ? 'bg-red-100 text-red-700' :
                    col.lastSyncStatus === 'in_progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {col.lastSyncStatus || 'never'}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {col.lastSyncAt ? new Date(col.lastSyncAt).toLocaleString() : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSync(col.id)}
                      disabled={syncing === col.id || col.lastSyncStatus === 'in_progress'}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      {syncing === col.id ? 'Triggering...' : col.lastSyncStatus === 'in_progress' ? 'Running...' : 'Sync Now'}
                    </button>
                    <button onClick={() => handleDelete(col.id)} className="text-sm text-red-500 hover:text-red-700">
                      Unlink
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  {statusFilter === 'all'
                    ? 'No CMS collections linked. Use the Forge Framer Plugin to configure your first collection.'
                    : `No collections with status "${statusFilter}"`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}