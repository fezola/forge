'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Puzzle, Plus } from 'lucide-react';
import { useConnectors } from '../../hooks/use-connectors';
import { ConnectorCard } from '../../components/connectors/connector-card';
import { connectorApi } from '../../lib/connector-api';

// In real app, driven by auth context
const MOCK_PROJECT_ID = 'proj_1';

export default function ConnectorsPage() {
  const { data: connectors, loading, error, mutate } = useConnectors(MOCK_PROJECT_ID);
  const [search, setSearch] = useState('');

  const filtered = connectors?.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      await connectorApi.toggle(id, enabled);
      mutate();
    } catch {
      // toast error — omitted for brevity
    }
  };

  const handleUninstall = async (id: string) => {
    if (!confirm('Are you sure you want to uninstall this connector?')) return;
    try {
      await connectorApi.uninstall(id);
      mutate();
    } catch {
      // toast error
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Connectors</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {connectors ? `${connectors.length} installed` : 'Manage your connectors'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/connectors/custom"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
            Custom
          </Link>
          <Link
            href="/connectors/marketplace"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Puzzle className="h-4 w-4" />
            Browse Marketplace
          </Link>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search connectors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading connectors...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {filtered && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Puzzle className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No connectors match your search.' : 'No connectors installed.'}
          </p>
          {!search && (
            <Link
              href="/connectors/marketplace"
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Browse the marketplace
            </Link>
          )}
        </div>
      )}

      {filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((connector) => (
            <ConnectorCard
              key={connector.id}
              connector={connector}
              onToggle={handleToggle}
              onUninstall={handleUninstall}
            />
          ))}
        </div>
      )}
    </div>
  );
}
