import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeCard } from '../ui/forge-card';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeDataCardProps extends ForgeComponentConfig {
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  fields?: Array<{ key: string; label: string }>;
  className?: string;
}

export function ForgeDataCard({
  sourceType = 'connector.action',
  sourceConfig = {},
  fields,
  className,
  ...forgeConfig
}: ForgeDataCardProps) {
  const { data, loading, error } = useForgeData(forgeConfig, { sourceType, sourceConfig });

  if (loading) return <ForgeLoading {...forgeConfig} />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  const record = data as Record<string, unknown> | null;
  if (!record) return <p className="text-sm text-muted-foreground">No data</p>;

  const displayFields = fields || Object.entries(record).map(([key, _]) => ({ key, label: key }));

  return (
    <ForgeCard {...forgeConfig} className={cn('space-y-2', className)}>
      {displayFields.map(field => (
        <div key={field.key} className="flex justify-between text-sm">
          <span className="text-muted-foreground">{field.label}</span>
          <span className="font-medium">{String(record[field.key] ?? '')}</span>
        </div>
      ))}
    </ForgeCard>
  );
}
