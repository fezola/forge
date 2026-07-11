'use client';

import { cn } from '../../lib/utils';
import type { WorkflowNode, WorkflowEdge } from '../../hooks/use-workflows';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  className?: string;
  onNodeSelect?: (nodeId: string | null) => void;
  selectedNodeId?: string | null;
}

export function WorkflowCanvas({
  nodes,
  edges,
  className,
  onNodeSelect,
  selectedNodeId,
}: WorkflowCanvasProps) {
  return (
    <div
      className={cn(
        'relative flex-1 overflow-hidden',
        'bg-[image:radial-gradient(hsl(var(--muted-foreground)/0.15)_1px,transparent_1px)]',
        'bg-[size:20px_20px]',
        className,
      )}
    >
      <div className="flex h-full flex-col items-center justify-center">
        <p className="text-lg text-muted-foreground">Workflow Editor Canvas</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}, {edges.length} edge
          {edges.length !== 1 ? 's' : ''}
        </p>
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-wrap gap-1 p-4">
        {nodes.map((node) => (
          <div
            key={node.id}
            onClick={() => onNodeSelect?.(node.id)}
            className={cn(
              'pointer-events-auto cursor-pointer rounded-md border bg-card px-3 py-2 text-xs shadow-sm transition-colors',
              selectedNodeId === node.id
                ? 'border-primary ring-2 ring-ring'
                : 'hover:border-muted-foreground/30',
            )}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
            }}
          >
            <span className="font-medium">{node.label}</span>
            <span className="ml-2 text-muted-foreground">({node.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
}