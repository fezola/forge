'use client';

import { useState } from 'react';
import { useConfigPage } from '../../../hooks/use-config-page';
import { configApi } from '../../../lib/config-api';

export default function ConfigPage() {
  const { configs, loading, error, mutate } = useConfigPage();
  const [showCreate, setShowCreate] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState('string');

  const handleCreate = async () => {
    await configApi.create({ key: newKey, type: newType, projectId: 'default' });
    setShowCreate(false);
    setNewKey('');
    setNewType('string');
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this config?')) {
      await configApi.delete(id);
      mutate();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuration</h1>
          <p className="text-muted-foreground mt-1">Manage all platform configuration in one place.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add Config
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">New Configuration</h3>
          <div className="flex gap-3">
            <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="Key (e.g. openai.api_key)" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <select value={newType} onChange={e => setNewType(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
              <option value="string">String</option>
              <option value="secret">Secret</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
              <option value="json">JSON</option>
              <option value="url">URL</option>
            </select>
            <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm text-muted-foreground">
              <th className="px-4 py-3 font-medium">Key</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Visibility</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {configs.map(config => (
              <tr key={config.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                <td className="px-4 py-3 font-medium">{config.key}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-muted px-2 py-0.5 text-xs">{config.type}</span></td>
                <td className="px-4 py-3">{config.visibility}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs ${config.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{config.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(config.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDelete(config.id)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
            {configs.length === 0 && !loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No configurations yet. Add one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}