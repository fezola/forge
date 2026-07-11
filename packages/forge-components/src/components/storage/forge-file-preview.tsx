import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeFilePreviewProps extends ForgeComponentConfig {
  fileId?: string;
  sourceType?: string;
  sourceConfig?: Record<string, unknown>;
  fallback?: string;
  className?: string;
}

export function ForgeFilePreview({
  fileId,
  sourceType = 'connector.action',
  sourceConfig = {},
  fallback = 'No file',
  className,
  ...forgeConfig
}: ForgeFilePreviewProps) {
  const { data, loading } = useForgeData(forgeConfig, { sourceType, sourceConfig: { ...sourceConfig, fileId } });

  if (loading) return <ForgeLoading {...forgeConfig} />;

  const file = data as Record<string, unknown> | null;
  if (!file) return <p className="text-sm text-muted-foreground">{fallback}</p>;

  return (
    <div className={cn('rounded-md border overflow-hidden', className)}>
      {file.type === 'image' ? (
        <img src={file.url as string} alt={(file.name as string) || 'File'} className="w-full h-48 object-cover" />
      ) : file.type === 'video' ? (
        <video src={file.url as string} className="w-full" controls />
      ) : (
        <div className="flex items-center gap-3 p-4">
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium">{file.name as string}</p>
            <p className="text-xs text-muted-foreground">{file.size as string}</p>
          </div>
        </div>
      )}
    </div>
  );
}
