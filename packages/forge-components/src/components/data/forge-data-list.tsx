import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeCard } from '../ui/forge-card';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeDataListProps extends ForgeComponentConfig {
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  template?: 'card' | 'simple' | 'compact' | 'list';
  maxItems?: number;
  className?: string;
}

export function ForgeDataList({
  sourceType = 'connector.action',
  sourceConfig = {},
  template = 'card',
  maxItems = 20,
  className,
  ...forgeConfig
}: ForgeDataListProps) {
  const { data, loading, error } = useForgeData(forgeConfig, { sourceType, sourceConfig });

  if (loading) return <ForgeLoading {...forgeConfig} />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  const items = Array.isArray(data) ? data.slice(0, maxItems) : [];

  if (template === 'list') {
    return (
      <ul className={cn('space-y-2', className)}>
        {items.map((item: any, idx) => (
          <li key={idx} className="flex items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/50">
            {Object.entries(item as Record<string, unknown>).slice(0, 3).map(([key, val]) => (
              <span key={key} className="truncate">
                <span className="text-muted-foreground">{key}: </span>
                <span className="font-medium">{String(val)}</span>
              </span>
            ))}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {items.map((item: any, idx) => (
        <ForgeCard key={idx} {...forgeConfig}>
          {Object.entries(item as Record<string, unknown>).slice(0, 4).map(([key, val]) => (
            <div key={key} className="flex justify-between text-sm py-0.5">
              <span className="text-muted-foreground">{key}</span>
              <span className="font-medium truncate ml-2">{String(val)}</span>
            </div>
          ))}
        </ForgeCard>
      ))}
    </div>
  );
}
