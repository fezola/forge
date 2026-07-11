'use client';

import { useState } from 'react';
import { useFeatureFlagsPage } from '../../../../hooks/use-config-page';
import { configApi } from '../../../../lib/config-api';

export default function FeatureFlagsPage() {
  const { flags, loading, mutate } = useFeatureFlagsPage();
  const [showCreate, setShowCreate] = useState(false);
  const [key, setKey] = useState('');
  const [name, setName] = useState('');

  const handleCreate = async () => {
    await configApi.featureFlags.create({ key, name, projectId: 'default' });
    setShowCreate(false);
    setKey('');
    setName('');
    mutate();
  };

  const handleToggle = async (id: string, current: boolean) => {
    await configApi.featureFlags.update(id, { enabled: !current });
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this flag?')) {
      await configApi.featureFlags.delete(id);
      mutate();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">Gradual rollouts, beta gates, and permission-based feature toggles.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          New Flag
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">New Feature Flag</h3>
          <div className="flex gap-3">
            <input value={key} onChange={e => setKey(e.target.value)} placeholder="Flag key" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      <div className="space-y-3">
        {flags.map(flag => (
          <div key={flag.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{flag.name}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{flag.key}</span>
                {flag.rolloutPercentage !== undefined && flag.rolloutPercentage !== null && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{flag.rolloutPercentage}% rollout</span>
                )}
              </div>
              {flag.description && <p className="mt-1 text-sm text-muted-foreground">{flag.description}</p>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => handleToggle(flag.id, flag.enabled)} className={`rounded-full px-3 py-1 text-xs font-medium ${flag.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {flag.enabled ? 'Enabled' : 'Disabled'}
              </button>
              <button onClick={() => handleDelete(flag.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
        {flags.length === 0 && !loading && (
          <p className="py-8 text-center text-muted-foreground">No feature flags defined.</p>
        )}
      </div>
    </div>
  );
}