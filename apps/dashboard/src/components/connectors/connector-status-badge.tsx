import type { ConnectorStatus } from '@forge/types';
import { cn } from '../../lib/utils';

const statusConfig: Record<ConnectorStatus, { dot: string; label: string }> = {
  active: { dot: 'bg-green-500', label: 'Active' },
  inactive: { dot: 'bg-gray-400', label: 'Inactive' },
  error: { dot: 'bg-red-500', label: 'Error' },
  updating: { dot: 'bg-yellow-500', label: 'Updating' },
};

export function ConnectorStatusBadge({
  status,
  className,
}: {
  status: ConnectorStatus;
  className?: string;
}) {
  const config = statusConfig[status] ?? statusConfig.inactive;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        className,
      )}
    >
      <span className={cn('h-2 w-2 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
