'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCmsCollectionDetail } from '../../../hooks/use-cms-page';
import { cmsApi } from '../../../lib/cms-api';
import { useParams } from 'next/navigation';

export default function CmsCollectionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { collection, syncHistory, loading, mutate } = useCmsCollectionDetail(id);
  const [syncing, setSyncing] = useState(false);
  const [activeSyncId, setActiveSyncId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSync = syncHistory.find((s: any) => s.status === 'in_progress' && !s.completedAt);

  useEffect(() => {
    if (activeSync) {
      setActiveSyncId(activeSync.id);
      pollRef.current = setInterval(() => {
        mutate();
      }, 5_000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
      setActiveSyncId(null);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [syncHistory.length, activeSync?.id]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await cmsApi.triggerSync(id, 'default');
      setActiveSyncId(result.syncId);
      mutate();
    } catch { /* ignore */ }
    setSyncing(false);
  };

  const syncTime = (started: string) => {
    const diff = Date.now() - new Date(started).getTime();
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!collection) return <p className="text-red-500">Collection not found</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/cms" className="text-sm text-muted-foreground hover:text-primary">
          &larr; Back to CMS Collections
        </Link>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{collection.name}</h1>
            {activeSync && (
              <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700 animate-pulse">
                Syncing... ({syncTime(activeSync.startedAt)})
              </span>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Source: {collection.sourceTableId || 'No source'}
            {collection.projectId ? ` · Project: ${collection.projectId}` : ''}
            {collection.forgeApiKey ? ' · API key configured' : ' · No API key'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing || !!activeSync}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {syncing ? 'Triggering...' : activeSync ? 'Sync in Progress...' : 'Sync Now'}
        </button>
      </div>

      <div className="mb-8">
        <h2 className="mb-3 text-lg font-semibold">Field Mapping</h2>
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Forge Field</th>
                <th className="px-4 py-3 font-medium">CMS Field</th>
                <th className="px-4 py-3 font-medium">CMS Type</th>
              </tr>
            </thead>
            <tbody>
              {(collection.fieldMapping ?? []).length > 0 ? (
                (collection.fieldMapping ?? []).map((mapping: any, i: number) => (
                  <tr key={i} className="border-b text-sm last:border-0 hover:bg-muted/50">
                    <td className="px-4 py-3 font-medium">{mapping.forgeFieldId}</td>
                    <td className="px-4 py-3">{mapping.cmsFieldName}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">{mapping.cmsFieldType}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No field mappings configured
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Sync History</h2>
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Started</th>
                <th className="px-4 py-3 font-medium">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Added</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 font-medium">Removed</th>
                <th className="px-4 py-3 font-medium">Errors</th>
                <th className="px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {syncHistory.map((entry: any) => {
                const dur = entry.completedAt
                  ? Math.round((new Date(entry.completedAt).getTime() - new Date(entry.startedAt).getTime()) / 1000)
                  : entry.status === 'in_progress'
                    ? 'running'
                    : '—';
                return (
                  <tr key={entry.id} className={`border-b text-sm last:border-0 hover:bg-muted/50 ${entry.status === 'in_progress' ? 'bg-blue-50/50' : ''}`}>
                    <td className="px-4 py-3">{new Date(entry.startedAt).toLocaleString()}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {typeof dur === 'number' ? `${dur}s` : dur === 'running' ? (
                        <span className="animate-pulse text-blue-600">{syncTime(entry.startedAt)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${
                        entry.status === 'success' ? 'bg-green-100 text-green-700' :
                        entry.status === 'error' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{entry.itemsAdded ?? 0}</td>
                    <td className="px-4 py-3">{entry.itemsUpdated ?? 0}</td>
                    <td className="px-4 py-3">{entry.itemsRemoved ?? 0}</td>
                    <td className="px-4 py-3">
                      {entry.errors > 0 ? (
                        <span className="text-red-500">{entry.errors}</span>
                      ) : (
                        <span className="text-green-600">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {entry.errorMessage && <span className="text-red-500">{entry.errorMessage}</span>}
                      {entry.metadata?.rowsFetched !== undefined && (
                        <span>{entry.metadata.rowsFetched} rows from {entry.metadata.collectionName || 'source'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {syncHistory.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No syncs have been performed yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}