import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeDataChartProps extends ForgeComponentConfig {
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  chartType?: 'bar' | 'line' | 'pie';
  xField?: string;
  yField?: string;
  height?: number;
  className?: string;
}

export function ForgeDataChart({
  sourceType = 'connector.action',
  sourceConfig = {},
  chartType = 'bar',
  xField = 'label',
  yField = 'value',
  height = 200,
  className,
  ...forgeConfig
}: ForgeDataChartProps) {
  const { data, loading, error } = useForgeData(forgeConfig, { sourceType, sourceConfig });

  if (loading) return <ForgeLoading {...forgeConfig} />;
  if (error) return <p className="text-sm text-destructive">{error}</p>;

  const items = Array.isArray(data) ? data : [];

  const maxValue = Math.max(...items.map((item: any) => Number(item[yField] || 0)), 1);

  return (
    <div className={cn('w-full', className)} style={{ height }}>
      {items.length === 0 && <p className="text-sm text-muted-foreground">No chart data</p>}
      <div className="flex items-end gap-1 h-full">
        {items.map((item: any, idx) => {
          const value = Number(item[yField] || 0);
          const percent = (value / maxValue) * 100;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
              <span className="text-[10px] text-muted-foreground">{value}</span>
              <div
                className="w-full rounded-t bg-primary/80 hover:bg-primary transition-colors"
                style={{ height: `${percent}%`, minHeight: 4 }}
                title={`${item[xField]}: ${value}`}
              />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{String(item[xField]).slice(0, 6)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
