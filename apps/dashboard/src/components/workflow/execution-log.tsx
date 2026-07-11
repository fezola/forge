'use client';

import { cn } from '../../lib/utils';
import { Info, AlertTriangle, AlertCircle } from 'lucide-react';
import type { ExecutionLogEntry } from '../../hooks/use-workflows';

const levelIcon: Record<string, React.ReactNode> = {
  info: <Info className="h-3.5 w-3.5 text-blue-500" />,
  warn: <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />,
  error: <AlertCircle className="h-3.5 w-3.5 text-red-500" />,
};

const levelBg: Record<string, string> = {
  info: 'border-l-blue-500/30 bg-blue-500/5',
  warn: 'border-l-yellow-500/30 bg-yellow-500/5',
  error: 'border-l-red-500/30 bg-red-500/5',
};

interface ExecutionLogProps {
  entries: ExecutionLogEntry[];
  className?: string;
}

export function ExecutionLog({ entries, className }: ExecutionLogProps) {
  if (entries.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <p className="text-sm text-muted-foreground">No execution logs yet</p>
      </div>
    );
  }

  return (
    <div className={cn('overflow-y-auto', className)}>
      <div className="space-y-0.5 p-2">
        {entries.map((entry, idx) => (
          <div
            key={`${entry.timestamp}-${idx}`}
            className={cn(
              'flex items-start gap-2 rounded-md border-l-2 px-3 py-2 text-xs',
              levelBg[entry.level] ?? levelBg.info,
            )}
          >
            <span className="mt-0.5 shrink-0">{levelIcon[entry.level] ?? levelIcon.info}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="truncate font-mono text-[10px] text-muted-foreground">
                  [{entry.nodeId}]
                </span>
              </div>
              <p className="mt-0.5 leading-snug">{entry.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}