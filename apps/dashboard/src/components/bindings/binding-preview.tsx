'use client';

import { cn } from '../../lib/utils';
import { useBindingPreview } from '../../hooks/use-bindings';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

function formatValue(value: unknown, depth = 0): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[] (empty)';
    return `Array[${value.length}]`;
  }
  if (typeof value === 'object') {
    if (depth > 2) return '{...}';
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

interface BindingPreviewProps {
  source: Record<string, unknown>;
  className?: string;
}

export function BindingPreview({ source, className }: BindingPreviewProps) {
  const { data, loading, error } = useBindingPreview(source);

  const hasConfig = Object.keys(source).length > 0 && source.type;

  if (!hasConfig) {
    return (
      <div className={cn('flex items-center justify-center rounded-md border border-dashed py-8 text-sm text-muted-foreground', className)}>
        Configure a source above to see a live preview
      </div>
    );
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center gap-2 rounded-md border bg-card py-8 text-sm text-muted-foreground', className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Resolving...
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('rounded-md border border-destructive/30 bg-destructive/5 p-4', className)}>
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">Resolution Error</p>
            <p className="mt-1 text-xs text-muted-foreground">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={cn('rounded-md border bg-card p-4', className)}>
        <p className="text-sm text-muted-foreground">No result</p>
      </div>
    );
  }

  const value = data.value ?? data;
  const isArray = Array.isArray(value);
  const isObject = !isArray && typeof value === 'object' && value !== null;

  return (
    <div className={cn('rounded-md border bg-card', className)}>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Resolved</span>
        {data.resolvedAt && (
          <span className="ml-auto text-[10px] text-muted-foreground">
            {new Date(data.resolvedAt).toLocaleTimeString()}
          </span>
        )}
      </div>
      <div className="p-3">
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
        {isArray ? (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Array ({ (value as unknown[]).length } items)</p>
            <div className="max-h-32 overflow-y-auto space-y-0.5">
              {(value as unknown[]).slice(0, 5).map((item, i) => (
                <div key={i} className="rounded bg-muted/50 px-2 py-1 font-mono text-xs">
                  {formatValue(item, 1)}
                </div>
              ))}
              {(value as unknown[]).length > 5 && (
                <p className="text-[10px] text-muted-foreground">...and {(value as unknown[]).length - 5} more</p>
              )}
            </div>
          </div>
        ) : isObject ? (
          <div className="space-y-1">
            {(Object.entries(value as Record<string, unknown>)).slice(0, 10).map(([key, val]) => (
              <div key={key} className="flex items-start gap-2 text-xs">
                <span className="shrink-0 font-medium text-muted-foreground">{key}:</span>
                <span className="font-mono text-foreground">{formatValue(val, 1)}</span>
              </div>
            ))}
            {Object.keys(value as Record<string, unknown>).length > 10 && (
              <p className="text-[10px] text-muted-foreground">
                ...and {Object.keys(value as Record<string, unknown>).length - 10} more keys
              </p>
            )}
          </div>
        ) : (
          <div className="rounded bg-muted/50 px-3 py-2 font-mono text-sm">
            {formatValue(value)}
          </div>
        )}
      </div>
    </div>
  );
}
