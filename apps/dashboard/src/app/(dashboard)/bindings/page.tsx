'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Link2, User, Puzzle, Database, Workflow, FunctionSquare, Braces } from 'lucide-react';
import { Badge } from '@forge/ui';
import { cn } from '../../../lib/utils';
import { useBindings } from '../../../hooks/use-bindings';
import { DataSourceBrowser } from '../../../components/bindings/data-source-browser';
import { BindingListCard } from '../../../components/bindings/binding-list-card';

const MOCK_PROJECT_ID = 'proj_1';

const sourceTypeIcons: Record<string, React.ReactNode> = {
  user: <User className="h-3.5 w-3.5" />,
  connector: <Puzzle className="h-3.5 w-3.5" />,
  database: <Database className="h-3.5 w-3.5" />,
  workflow: <Workflow className="h-3.5 w-3.5" />,
  computed: <FunctionSquare className="h-3.5 w-3.5" />,
  static: <Braces className="h-3.5 w-3.5" />,
};

const sourceTypeLabels: Record<string, string> = {
  user: 'User',
  connector: 'Connector',
  database: 'Database',
  workflow: 'Workflow',
  computed: 'Computed',
  static: 'Static',
};

export default function BindingsPage() {
  const { data: bindings, loading, error } = useBindings(MOCK_PROJECT_ID);
  const [search, setSearch] = useState('');

  const filtered = bindings?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Bindings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bindings ? `${bindings.length} bindings` : 'Connect data to your components'}
          </p>
        </div>
        <Link
          href="/bindings/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create Binding
        </Link>
      </div>

      <div className="flex gap-6">
        <div className="hidden w-72 shrink-0 lg:block">
          <DataSourceBrowser className="sticky top-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bindings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {loading && <p className="text-sm text-muted-foreground">Loading bindings...</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}

          {filtered && filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <Link2 className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {search ? 'No bindings match your search.' : 'No bindings yet.'}
              </p>
              {!search && (
                <Link
                  href="/bindings/new"
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  Create your first binding
                </Link>
              )}
            </div>
          )}

          {filtered && filtered.length > 0 && (
            <div className="overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Source Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Target</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((binding) => (
                    <tr
                      key={binding.id}
                      className="border-b transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/bindings/${binding.id}`}
                          className="font-medium hover:underline"
                        >
                          {binding.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="inline-flex items-center gap-1 text-[10px] capitalize">
                          {sourceTypeIcons[binding.sourceType]}
                          {sourceTypeLabels[binding.sourceType] ?? binding.sourceType}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {binding.targetComponentId ? (
                          <span className="font-mono text-xs">
                            {binding.targetComponentId}
                            {binding.targetProperty ? `.${binding.targetProperty}` : ''}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 text-xs',
                            binding.status === 'active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                          )}
                        >
                          <span
                            className={cn(
                              'inline-block h-1.5 w-1.5 rounded-full',
                              binding.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                            )}
                          />
                          {binding.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-muted-foreground">
                        {new Date(binding.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
