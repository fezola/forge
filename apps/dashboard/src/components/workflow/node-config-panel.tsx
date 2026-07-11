'use client';

import { cn } from '../../lib/utils';
import { X } from 'lucide-react';
import type { WorkflowNode } from '../../hooks/use-workflows';

interface NodeConfigPanelProps {
  node: WorkflowNode | null;
  onClose?: () => void;
  className?: string;
}

export function NodeConfigPanel({ node, onClose, className }: NodeConfigPanelProps) {
  if (!node) {
    return (
      <div className={cn('flex h-full flex-col border-l bg-card', className)}>
        <div className="flex items-center justify-center flex-1 px-4 text-center">
          <p className="text-sm text-muted-foreground">
            Select a node on the canvas to see its configuration
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex h-full flex-col border-l bg-card', className)}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Node Config</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Node Type</label>
            <p className="mt-0.5 text-sm">{node.type}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Node ID</label>
            <p className="mt-0.5 text-sm font-mono text-muted-foreground">{node.id}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Label</label>
            <p className="mt-0.5 text-sm">{node.label}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground">Position</label>
            <p className="mt-0.5 text-sm font-mono text-muted-foreground">
              x: {node.position.x}, y: {node.position.y}
            </p>
          </div>
          <div className="border-t pt-4">
            <label className="text-xs font-medium text-muted-foreground">Configuration</label>
            <div className="mt-2 rounded-md border border-dashed p-4 text-center">
              <p className="text-xs text-muted-foreground">
                Config form for <span className="font-medium">{node.type}</span> nodes
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Will render dynamically based on node type schema
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}