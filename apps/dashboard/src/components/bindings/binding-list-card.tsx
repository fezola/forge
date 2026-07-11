'use client';

import Link from 'next/link';
import { cn } from '../../lib/utils';
import { Badge, Card, CardContent } from '@forge/ui';
import {
  User,
  Puzzle,
  Database,
  Workflow,
  FunctionSquare,
  Braces,
} from 'lucide-react';
import type { BindingDefinition } from '../../hooks/use-bindings';

const sourceTypeIcons: Record<string, React.ReactNode> = {
  user: <User className="h-3.5 w-3.5" />,
  connector: <Puzzle className="h-3.5 w-3.5" />,
  database: <Database className="h-3.5 w-3.5" />,
  workflow: <Workflow className="h-3.5 w-3.5" />,
  computed: <FunctionSquare className="h-3.5 w-3.5" />,
  static: <Braces className="h-3.5 w-3.5" />,
};

const sourceTypeLabels: Record<string, string> = {
  user: 'User',
  connector: 'Connector',
  database: 'Database',
  workflow: 'Workflow',
  computed: 'Computed',
  static: 'Static',
};

function getSourcePath(binding: BindingDefinition): string {
  const cfg = binding.sourceConfig;
  switch (binding.sourceType) {
    case 'user':
      return `{{user.${String(cfg.field ?? '')}}}`;
    case 'connector':
      return `{{connector.${String(cfg.connectorId ?? '')}.${String(cfg.actionId ?? '')}}}`;
    case 'workflow':
      return `{{workflow.${String(cfg.workflowId ?? '')}.${String(cfg.variable ?? '')}}}`;
    case 'computed':
      return String(cfg.formula ?? '');
    case 'static':
      return 'Static value';
    default:
      return '';
  }
}

interface BindingListCardProps {
  binding: BindingDefinition;
}

export function BindingListCard({ binding }: BindingListCardProps) {
  const path = getSourcePath(binding);
  const isResolved = binding.status === 'active';

  return (
    <Link href={`/bindings/${binding.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0">
                  {sourceTypeIcons[binding.sourceType] ?? <Braces className="h-3.5 w-3.5" />}
                </span>
                <h3 className="truncate text-sm font-semibold">{binding.name}</h3>
                <Badge variant="outline" className="shrink-0 text-[10px] capitalize">
                  {sourceTypeLabels[binding.sourceType] ?? binding.sourceType}
                </Badge>
              </div>
              {path && (
                <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                  {path}
                </p>
              )}
              {binding.targetComponentId && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  → {binding.targetComponentId}{binding.targetProperty ? `.${binding.targetProperty}` : ''}
                </p>
              )}
            </div>
            <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
              <span
                className={cn(
                  'inline-block h-2 w-2 rounded-full',
                  isResolved ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                )}
              />
              <span className="text-[10px] text-muted-foreground">
                {new Date(binding.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
