import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeDataTableProps extends ForgeComponentConfig {
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  columns?: Array<{ key: string; label: string }>;
  pageSize?: number;
  sortable?: boolean;
  className?: string;
}

export function ForgeDataTable({
  sourceType = 'connector.action',
  sourceConfig = {},
  columns,
  pageSize = 10,
  sortable = false,
  className,
  ...forgeConfig
}: ForgeDataTableProps) {
  const { data, loading, error } = useForgeData(forgeConfig, {
    sourceType,
    sourceConfig,
  });

  if (loading) return <ForgeLoading {...forgeConfig} />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  const items = Array.isArray(data) ? data : [];
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No data</p>;

  const autoColumns = columns || (items[0] ? Object.keys(items[0] as Record<string, unknown>).map(k => ({ key: k, label: k })) : []);

  return (
    <div className={cn('overflow-x-auto rounded-md border', className)}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {autoColumns.map(col => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-muted-foreground">
                {col.label}
                {sortable && <span className="ml-1 cursor-pointer select-none">↕</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.slice(0, pageSize).map((item: any, idx) => (
            <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
              {autoColumns.map(col => (
                <td key={col.key} className="px-4 py-2.5">{String(item[col.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {items.length > pageSize && (
        <p className="px-4 py-2 text-xs text-muted-foreground border-t">
          Showing {pageSize} of {items.length} items
        </p>
      )}
    </div>
  );
}
