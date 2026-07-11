'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import { Badge } from '@forge/ui';
import {
  Save,
  Upload,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Play,
} from 'lucide-react';

interface WorkflowToolbarProps {
  workflowName: string;
  onNameChange?: (name: string) => void;
  status?: 'draft' | 'published' | 'archived';
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onRun?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

export function WorkflowToolbar({
  workflowName,
  onNameChange,
  status = 'draft',
  onSaveDraft,
  onPublish,
  onUndo,
  onRedo,
  onZoomIn,
  onZoomOut,
  onRun,
  canUndo = false,
  canRedo = false,
  className,
}: WorkflowToolbarProps) {
  const [editing, setEditing] = useState(false);
  const [localName, setLocalName] = useState(workflowName);

  const handleNameBlur = () => {
    setEditing(false);
    if (localName.trim() && localName !== workflowName) {
      onNameChange?.(localName.trim());
    } else {
      setLocalName(workflowName);
    }
  };

  return (
    <div className={cn('flex items-center justify-between border-b bg-card px-4 py-2', className)}>
      <div className="flex items-center gap-3">
        {editing ? (
          <input
            autoFocus
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleNameBlur()}
            className="rounded border border-input bg-background px-2 py-1 text-sm font-medium outline-none focus:ring-2 focus:ring-ring"
          />
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="max-w-[160px] truncate text-sm font-medium hover:underline"
            title="Click to rename"
          >
            {localName}
          </button>
        )}
        <Badge variant={statusVariant[status] ?? 'secondary'} className="text-[10px] capitalize">
          {status}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onSaveDraft}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
          title="Save Draft"
        >
          <Save className="h-3.5 w-3.5" />
          Save Draft
        </button>
        <button
          onClick={onPublish}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
          title="Publish"
        >
          <Upload className="h-3.5 w-3.5" />
          Publish
        </button>

        <div className="mx-2 h-5 w-px bg-border" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          title="Undo"
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted disabled:opacity-30"
          title="Redo"
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="mx-2 h-5 w-px bg-border" />

        <button
          onClick={onZoomOut}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          title="Zoom Out"
        >
          <ZoomOut className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onZoomIn}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted"
          title="Zoom In"
        >
          <ZoomIn className="h-3.5 w-3.5" />
        </button>

        <div className="mx-2 h-5 w-px bg-border" />

        <button
          onClick={onRun}
          className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          title="Run Workflow"
        >
          <Play className="h-3.5 w-3.5" />
          Run
        </button>
      </div>
    </div>
  );
}

