'use client';

import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Trash2, Key } from 'lucide-react';
import { connectorApi } from '../../lib/connector-api';
import type { SecretDTO } from '@forge/types';

const MOCK_PROJECT_ID = 'proj_1';

export default function SecretsPage() {
  const [secrets, setSecrets] = useState<SecretDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const fetchSecrets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await connectorApi.listSecrets(MOCK_PROJECT_ID);
      const data = res.data ?? res ?? [];
      setSecrets(Array.isArray(data) ? data : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch secrets');
      setSecrets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSecrets(); }, []);

  const handleAdd = async () => {
    if (!name.trim() || !value.trim()) return;
    try {
      await connectorApi.createSecret({
        name: name.trim(),
        value: value.trim(),
        provider: 'project',
        projectId: MOCK_PROJECT_ID,
      });
      setName('');
      setValue('');
      setShowAddModal(false);
      fetchSecrets();
    } catch {
      // toast
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this secret?')) return;
    try {
      await connectorApi.deleteSecret(id);
      fetchSecrets();
    } catch {
      // toast
    }
  };

  const toggleVisible = (id: string) => {
    setVisibleIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Secrets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage all secrets for the project.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Secret
        </button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading secrets...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && secrets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Key className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No secrets yet. Add one to get started.</p>
        </div>
      )}

      {!loading && !error && secrets.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {secrets.map((secret) => (
                <tr key={secret.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-medium">{secret.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs">
                        {visibleIds.has(secret.id) ? 'secret_value_here' : secret.maskedValue}
                      </code>
                      <button
                        onClick={() => toggleVisible(secret.id)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {visibleIds.has(secret.id) ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{secret.provider}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(secret.id)}
                      className="inline-flex items-center gap-1 text-destructive hover:underline"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">Add Secret</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. STRIPE_API_KEY"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Value</label>
                <input
                  type="password"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Secret value"
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => { setShowAddModal(false); setName(''); setValue(''); }}
                className="rounded-md border px-4 py-2 text-sm transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
