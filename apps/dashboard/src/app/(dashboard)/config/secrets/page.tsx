'use client';

import { useState } from 'react';
import { useConfigPage, useAuditPage } from '../../../../hooks/use-config-page';
import { configApi } from '../../../../lib/config-api';

export default function SecretsPage() {
  const { configs, loading: configsLoading, mutate: refreshConfigs } = useConfigPage();
  const { audit, loading: auditLoading } = useAuditPage();
  const [showSecret, setShowSecret] = useState<string | null>(null);
  const [secretValue, setSecretValue] = useState('');
  const [creating, setCreating] = useState(false);
  const [newConfigId, setNewConfigId] = useState('');
  const [newValue, setNewValue] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConfigId || !newValue.trim()) return;
    setCreating(true);
    try {
      await configApi.secrets.create(newConfigId, newValue.trim());
      setNewValue('');
      refreshConfigs();
    } catch { /* ignore */ }
    setCreating(false);
  };

  const handleReveal = async (secretId: string) => {
    if (showSecret === secretId) {
      setShowSecret(null);
      setSecretValue('');
      return;
    }
    try {
      const val = await configApi.secrets.read(secretId);
      setSecretValue(val);
      setShowSecret(secretId);
    } catch {
      setSecretValue('(access denied / not found)');
      setShowSecret(secretId);
    }
  };

  const configsWithSecrets = configs.filter(c => c.type === 'secret');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Secrets</h1>
        <p className="text-muted-foreground mt-1">All secrets are encrypted at rest. Developers can reference them but never view raw values.</p>
      </div>

      <div className="mb-6 rounded-lg border bg-blue-50 p-4 text-sm text-blue-800">
        Secrets are managed through the Configuration Engine. Use <code className="rounded bg-blue-100 px-1">{'{{config.my_key.secret}}'}</code> syntax to reference secrets in your workflow and connector configurations.
      </div>

      <form onSubmit={handleCreate} className="mb-6 rounded-lg border p-4">
        <h3 className="mb-3 font-medium">Add New Secret</h3>
        <div className="flex gap-2">
          <select value={newConfigId} onChange={e => setNewConfigId(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
            <option value="">Select config...</option>
            {configs.filter(c => c.type === 'secret' || !c.type).map(c => (
              <option key={c.id} value={c.id}>{c.key}</option>
            ))}
          </select>
          <input value={newValue} onChange={e => setNewValue(e.target.value)} type="password" placeholder="Secret value" className="flex-1 rounded-md border px-3 py-2 text-sm" />
          <button type="submit" disabled={creating || !newConfigId || !newValue.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            Add
          </button>
        </div>
      </form>

      {configsLoading && <p className="text-muted-foreground">Loading...</p>}

      <div className="rounded-lg border">
        <div className="border-b bg-muted/30 px-4 py-3">
          <p className="text-sm font-medium">Configuration Secrets</p>
        </div>
        {configsWithSecrets.length > 0 ? (
          <div className="divide-y">
            {configsWithSecrets.map(c => (
              <div key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{c.key}</p>
                  <p className="text-xs text-muted-foreground">{'{{config.' + c.key + '}}'}</p>
                </div>
                <button onClick={() => handleReveal(c.id)} className="text-sm text-primary hover:underline">
                  {showSecret === c.id ? 'Hide' : 'View Hint'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-6 text-center text-sm text-muted-foreground">
            No secret configurations found. Create a config entry first, then add a secret value.
          </div>
        )}
      </div>

      <div className="mt-6">
        <h2 className="mb-3 text-lg font-semibold">Access Log</h2>
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Config</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Accessed By</th>
                <th className="px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {auditLoading && (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
              )}
              {!auditLoading && audit.length > 0 ? audit.map((entry: any) => (
                <tr key={entry.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">{entry.configId?.slice(0, 12) || '—'}</td>
                  <td className="px-4 py-3">{entry.action}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.actor || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{entry.timestamp ? new Date(entry.timestamp).toLocaleString() : '—'}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No access logs yet. Secret access is logged automatically.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}