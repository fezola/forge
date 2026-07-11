'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { Badge, Card, CardContent } from '@forge/ui';
import {
  Edit3,
  Upload,
  Copy,
  Trash2,
  MousePointerClick,
  Webhook,
  Clock,
  Zap,
} from 'lucide-react';
import type { WorkflowSummary } from '../../hooks/use-workflows';

const triggerIcons: Record<string, React.ReactNode> = {
  manual: <MousePointerClick className="h-3.5 w-3.5" />,
  webhook: <Webhook className="h-3.5 w-3.5" />,
  schedule: <Clock className="h-3.5 w-3.5" />,
};

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

interface WorkflowListCardProps {
  workflow: WorkflowSummary;
  onPublish?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function WorkflowListCard({
  workflow,
  onPublish,
  onDuplicate,
  onDelete,
}: WorkflowListCardProps) {
  const [showActions, setShowActions] = useState(false);

  return (
    <Card
      className="relative transition-shadow hover:shadow-md"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Link
                href={`/workflows/${workflow.id}`}
                className="truncate text-sm font-semibold hover:underline"
              >
                {workflow.name}
              </Link>
              <Badge variant={statusVariant[workflow.status] ?? 'secondary'} className="text-[10px] capitalize shrink-0">
                {workflow.status}
              </Badge>
            </div>
            {workflow.description && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {workflow.description}
              </p>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            {triggerIcons[workflow.triggerType] ?? <Zap className="h-3.5 w-3.5" />}
            {workflow.triggerType}
          </span>
          <span>v{workflow.version}</span>
          <span>{workflow.nodeCount} nodes</span>
          <span className="ml-auto">
            {new Date(workflow.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {showActions && (
          <div className="mt-3 flex items-center gap-1 border-t pt-2">
            <Link
              href={`/workflows/${workflow.id}`}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Edit3 className="h-3 w-3" />
              Edit
            </Link>
            <button
              onClick={() => onPublish?.(workflow.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Upload className="h-3 w-3" />
              Publish
            </button>
            <button
              onClick={() => onDuplicate?.(workflow.id)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
            >
              <Copy className="h-3 w-3" />
              Duplicate
            </button>
            <button
              onClick={() => onDelete?.(workflow.id)}
              className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}