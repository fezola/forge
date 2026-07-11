'use client';

import { useState } from 'react';
import { useEnvironmentsPage } from '../../../../hooks/use-config-page';
import { configApi } from '../../../../lib/config-api';

const TYPE_COLORS: Record<string, string> = {
  development: 'bg-gray-100 text-gray-700',
  staging: 'bg-yellow-100 text-yellow-700',
  production: 'bg-green-100 text-green-700',
  preview: 'bg-blue-100 text-blue-700',
  sandbox: 'bg-purple-100 text-purple-700',
};

export default function EnvironmentsPage() {
  const { environments, loading, mutate } = useEnvironmentsPage();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('development');

  const handleCreate = async () => {
    await configApi.environments.create({ projectId: 'default', name, type });
    setShowCreate(false);
    setName('');
    setType('development');
    mutate();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Environments</h1>
          <p className="text-muted-foreground mt-1">Each environment can have different config values. Values cascade from parent to child.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Add Environment
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 rounded-lg border p-4">
          <h3 className="mb-3 font-medium">New Environment</h3>
          <div className="flex gap-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Environment name" className="flex-1 rounded-md border px-3 py-2 text-sm" />
            <select value={type} onChange={e => setType(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="preview">Preview</option>
              <option value="sandbox">Sandbox</option>
            </select>
            <button onClick={handleCreate} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Create</button>
            <button onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}

      <div className="space-y-3">
        {environments.map(env => (
          <div key={env.id} className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_COLORS[env.type] || 'bg-gray-100 text-gray-700'}`}>{env.type}</span>
              <div>
                <span className="font-medium">{env.name}</span>
                {env.isDefault && <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">default</span>}
                {env.protected && <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">protected</span>}
              </div>
            </div>
            <span className="text-sm text-muted-foreground">/{env.slug}</span>
          </div>
        ))}
        {environments.length === 0 && !loading && (
          <p className="py-8 text-center text-muted-foreground">No environments defined. Create one to start organizing config values.</p>
        )}
      </div>
    </div>
  );
}