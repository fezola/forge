'use client';

import Link from 'next/link';
import type { ConnectorInstallationDTO } from '@forge/types';
import { ConnectorStatusBadge } from './connector-status-badge';
import { cn } from '../../lib/utils';

const categoryColors: Record<string, string> = {
  payments: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  blockchain: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  ai: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  email: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  kyc: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  authentication: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  storage: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  messaging: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  analytics: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200',
  custom: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

export function ConnectorCard({
  connector,
  onToggle,
  onUninstall,
}: {
  connector: ConnectorInstallationDTO;
  onToggle?: (id: string, enabled: boolean) => void;
  onUninstall?: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <Link
            href={`/connectors/${connector.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {connector.name}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">v{connector.version}</p>
        </div>
        <ConnectorStatusBadge status={connector.status} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            'inline-block rounded px-2 py-0.5 text-xs font-medium capitalize',
            categoryColors[connector.category] ?? categoryColors.custom,
          )}
        >
          {connector.category}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle?.(connector.id, !connector.enabled)}
          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
            connector.enabled ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
              connector.enabled ? 'translate-x-[18px]' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-xs text-muted-foreground">
          {connector.enabled ? 'Enabled' : 'Disabled'}
        </span>

        <div className="ml-auto flex gap-2">
          <Link
            href={`/connectors/${connector.id}`}
            className="rounded-md border px-3 py-1 text-xs font-medium transition-colors hover:bg-muted"
          >
            Configure
          </Link>
          <button
            onClick={() => onUninstall?.(connector.id)}
            className="rounded-md border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Uninstall
          </button>
        </div>
      </div>
    </div>
  );
}
