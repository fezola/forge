'use client';

import React, { useState } from 'react';

export function DevTools() {
  const [mode, setMode] = useState<'preview' | 'edit' | 'debug'>('preview');

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-2">
      <div className="flex items-center gap-4">
        <select
          className="rounded border px-2 py-1 text-xs"
          value={mode}
          onChange={e => setMode(e.target.value as any)}
        >
          <option value="preview">Preview</option>
          <option value="edit">Edit</option>
          <option value="debug">Debug</option>
        </select>
        <span className="text-xs text-muted-foreground">Dev Mode</span>
      </div>
    </div>
  );
}
