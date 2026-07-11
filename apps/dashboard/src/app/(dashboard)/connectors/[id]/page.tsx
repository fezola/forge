'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useConnector } from '../../../hooks/use-connectors';
import { ConnectorStatusBadge } from '../../../components/connectors/connector-status-badge';
import { connectorApi } from '../../../lib/connector-api';
import { cn } from '../../../lib/utils';

export default function ConnectorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, loading, error, mutate } = useConnector(id);
  const [expandedAction, setExpandedAction] = useState<string | null>(null);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  const handleSaveConfig = async () => {
    try {
      await connectorApi.toggle(id, data?.installation.enabled ?? true);
      mutate();
    } catch {
      // toast
    }
  };

  const handleUninstall = async () => {
    if (!confirm('Are you sure? This will remove the connector and all its data.')) return;
    try {
      await connectorApi.uninstall(id);
      router.push('/connectors');
    } catch {
      // toast
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading connector...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!data) return <p className="text-sm text-muted-foreground">Connector not found.</p>;

  const { installation, actions, triggers } = data;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/connectors')}
            className="rounded-md border p-1.5 transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{installation.name}</h1>
              <ConnectorStatusBadge status={installation.status} />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">v{installation.version}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/connectors/${id}/secrets`}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <Key className="h-4 w-4" />
            Secrets
          </Link>
          <button
            onClick={handleUninstall}
            className="inline-flex items-center gap-2 rounded-md border border-destructive/30 px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            Uninstall
          </button>
        </div>
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Configuration</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Enabled</span>
              <label className="relative inline-flex h-5 w-9 cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={installation.enabled}
                  onChange={async (e) => {
                    await connectorApi.toggle(id, e.target.checked);
                    mutate();
                  }}
                  className="peer sr-only"
                />
                <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
            {Object.entries(installation.config ?? {}).map(([key, value]) => (
              <div key={key}>
                <label className="mb-1 block text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="text"
                  value={configForm[key] ?? String(value ?? '')}
                  onChange={(e) =>
                    setConfigForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            ))}
            {Object.keys(installation.config ?? {}).length === 0 && (
              <p className="text-sm text-muted-foreground">No configuration options.</p>
            )}
          </div>
          {Object.keys(installation.config ?? {}).length > 0 && (
            <button
              onClick={handleSaveConfig}
              className="mt-4 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Save Config
            </button>
          )}
        </div>

        <div className="rounded-lg border bg-card p-5">
          <h2 className="mb-4 text-lg font-semibold">Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Category</dt>
              <dd className="font-medium capitalize">{installation.category}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Status</dt>
              <dd>
                <ConnectorStatusBadge status={installation.status} />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{new Date(installation.createdAt).toLocaleDateString()}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Updated</dt>
              <dd className="font-medium">{new Date(installation.updatedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Actions ({actions.length})</h2>
        {actions.length === 0 && (
          <p className="text-sm text-muted-foreground">No actions defined.</p>
        )}
        <div className="space-y-3">
          {actions.map((action) => {
            const isExpanded = expandedAction === action.id;
            return (
              <div key={action.id} className="rounded-lg border bg-card">
                <button
                  onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left"
                >
                  <span
                    className={cn(
                      'inline-block min-w-14 rounded px-2 py-0.5 text-center text-xs font-semibold',
                      action.method === 'GET'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : action.method === 'POST'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : action.method === 'PUT'
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                            : action.method === 'PATCH'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                    )}
                  >
                    {action.method}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{action.name}</p>
                    <p className="text-xs text-muted-foreground">{action.path}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>
                {isExpanded && (
                  <div className="border-t px-5 py-4">
                    {action.description && (
                      <p className="mb-4 text-sm text-muted-foreground">{action.description}</p>
                    )}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Input
                        </h4>
                        {action.input.length === 0 && (
                          <p className="text-xs text-muted-foreground">None</p>
                        )}
                        <ul className="space-y-1">
                          {action.input.map((field) => (
                            <li key={field.key} className="flex items-center gap-2 text-xs">
                              <span className="font-medium">{field.label}</span>
                              <span className="text-muted-foreground">({field.type})</span>
                              {field.required && (
                                <span className="text-destructive">*</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                          Output
                        </h4>
                        {action.output.length === 0 && (
                          <p className="text-xs text-muted-foreground">None</p>
                        )}
                        <ul className="space-y-1">
                          {action.output.map((field) => (
                            <li key={field.key} className="flex items-center gap-2 text-xs">
                              <span className="font-medium">{field.label}</span>
                              <span className="text-muted-foreground">({field.type})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {triggers.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Triggers ({triggers.length})</h2>
          <div className="space-y-3">
            {triggers.map((trigger) => (
              <div key={trigger.id} className="rounded-lg border bg-card p-4">
                <div className="mb-1 flex items-center gap-2">
                  <h3 className="text-sm font-medium">{trigger.name}</h3>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {trigger.type}
                  </span>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">{trigger.description}</p>
                {trigger.pollingInterval && (
                  <p className="text-xs text-muted-foreground">
                    Polls every {trigger.pollingInterval}ms
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
