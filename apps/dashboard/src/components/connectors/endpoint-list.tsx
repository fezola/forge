'use client';

import { useState } from 'react';
import type { ActionDefinition } from '@forge/types';
import { cn } from '../../lib/utils';

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  PUT: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  PATCH: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function EndpointList({
  endpoints,
  onAdd,
  onRemove,
  onTest,
}: {
  endpoints: ActionDefinition[];
  onAdd?: (endpoint: { name: string; method: string; path: string }) => void;
  onRemove?: (id: string) => void;
  onTest?: (endpoint: ActionDefinition) => void;
}) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');

  const handleAdd = () => {
    if (!name.trim() || !path.trim()) return;
    onAdd?.({ name: name.trim(), method, path: path.trim() });
    setName('');
    setMethod('GET');
    setPath('');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Create User"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>
        <div className="flex-[2]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Path</label>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g. /api/users"
            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={handleAdd}
          className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Add
        </button>
      </div>

      {endpoints.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No endpoints added yet.</p>
      )}

      <ul className="space-y-2">
        {endpoints.map((ep) => (
          <li
            key={ep.id}
            className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3"
          >
            <span
              className={cn(
                'inline-block min-w-16 rounded px-2 py-0.5 text-center text-xs font-semibold',
                methodColors[ep.method] ?? methodColors.GET,
              )}
            >
              {ep.method}
            </span>
            <code className="flex-1 text-sm font-mono">{ep.path}</code>
            <span className="text-sm text-muted-foreground">{ep.name}</span>
            <button
              onClick={() => onTest?.(ep)}
              className="rounded-md border px-2.5 py-1 text-xs transition-colors hover:bg-muted"
            >
              Test
            </button>
            <button
              onClick={() => onRemove?.(ep.id)}
              className="text-xs text-destructive hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
