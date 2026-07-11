import React, { useState, useRef } from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { ForgeButton } from '../ui/forge-button';

export interface ForgeFileUploadProps extends ForgeComponentConfig {
  accept?: string;
  maxSize?: number;
  multiple?: boolean;
  bucketId?: string;
  label?: string;
  className?: string;
}

export function ForgeFileUpload({
  accept = '*',
  maxSize = 10485760,
  multiple = false,
  bucketId,
  label = 'Upload File',
  className,
  ...forgeConfig
}: ForgeFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = Array.from(e.dataTransfer.files);
    setFiles(prev => multiple ? [...prev, ...dropped] : dropped);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    try {
      if (forgeConfig) forgeConfig.onEvent?.('file_uploaded', { count: files.length, bucketId });
    } catch (e: any) {
      if (forgeConfig) forgeConfig.onEvent?.('error', e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 hover:bg-muted/30 transition-colors"
      >
        <svg className="mb-2 h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">or drag and drop</p>
        <input ref={inputRef} type="file" accept={accept} multiple={multiple} className="hidden" onChange={e => setFiles(Array.from(e.target.files || []))} />
      </div>
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</span>
            </div>
          ))}
          <ForgeButton {...forgeConfig} loading={uploading} onClick={handleUpload} className="w-full">
            Upload {files.length > 1 ? `(${files.length} files)` : ''}
          </ForgeButton>
        </div>
      )}
    </div>
  );
}
