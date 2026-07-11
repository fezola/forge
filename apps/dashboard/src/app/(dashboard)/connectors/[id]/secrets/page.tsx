'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Plus, Trash2, Key } from 'lucide-react';
import { connectorApi } from '../../../../lib/connector-api';
import type { SecretDTO } from '@forge/types';

const MOCK_PROJECT_ID = 'proj_1';

export default function ConnectorSecretsPage() {
  const params = useParams();
  const router = useRouter();
  const connectorId = params.id as string;

  const [secrets, setSecrets] = useState<SecretDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [visibleIds, setVisibleIds] = useState<Set<string>>(new Set());

  const fetchSecrets = async () => {
    setLoading(true);
    try {
      const res = await connectorApi.listSecrets(MOCK_PROJECT_ID);
      const data = res.data ?? res ?? [];
      setSecrets(Array.isArray(data) ? data.filter((s: SecretDTO) => s.provider === 'connector') : []);
    } catch {
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
        provider: 'connector',
        projectId: MOCK_PROJECT_ID,
        connectorId,
      });
      setName('');
      setValue('');
      setShowAddForm(false);
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/connectors/${connectorId}`)}
            className="rounded-md border p-1.5 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Secrets</h1>
            <p className="text-sm text-muted-foreground">Manage connector secrets</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Add Secret
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 rounded-lg border bg-card p-5">
          <h3 className="mb-4 text-sm font-semibold">New Secret</h3>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="API_KEY"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex-[2]">
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Value</label>
              <input
                type="password"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Secret value"
                className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <button
              onClick={handleAdd}
              className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="rounded-md border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <p className="text-sm text-muted-foreground">Loading secrets...</p>}

      {!loading && secrets.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Key className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No secrets yet.</p>
        </div>
      )}

      {!loading && secrets.length > 0 && (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Value</th>
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
                      <button onClick={() => toggleVisible(secret.id)} className="text-muted-foreground hover:text-foreground">
                        {visibleIds.has(secret.id) ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(secret.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(secret.id)}
                      className="text-destructive hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


