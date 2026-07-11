'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  MousePointerClick,
  Webhook,
  Clock,
  GitBranch,
  ArrowLeftRight,
  Repeat,
  Timer,
  Combine,
  Columns3,
  Variable,
  Api,
  Database,
  Puzzle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface NodeTemplate {
  icon: React.ReactNode;
  name: string;
  description: string;
  type: string;
}

interface NodeCategory {
  name: string;
  nodes: NodeTemplate[];
}

const categories: NodeCategory[] = [
  {
    name: 'Triggers',
    nodes: [
      { icon: <MousePointerClick className="h-4 w-4" />, name: 'Manual', description: 'Run manually from dashboard', type: 'trigger.manual' },
      { icon: <Webhook className="h-4 w-4" />, name: 'Webhook', description: 'HTTP request trigger', type: 'trigger.webhook' },
      { icon: <Clock className="h-4 w-4" />, name: 'Schedule', description: 'Cron-based schedule', type: 'trigger.schedule' },
    ],
  },
  {
    name: 'Logic',
    nodes: [
      { icon: <GitBranch className="h-4 w-4" />, name: 'Condition', description: 'If/else branching', type: 'logic.condition' },
      { icon: <ArrowLeftRight className="h-4 w-4" />, name: 'Switch', description: 'Multi-branch switch', type: 'logic.switch' },
      { icon: <Repeat className="h-4 w-4" />, name: 'Loop', description: 'Iterate over items', type: 'logic.loop' },
      { icon: <Timer className="h-4 w-4" />, name: 'Delay', description: 'Wait before proceeding', type: 'logic.delay' },
      { icon: <Combine className="h-4 w-4" />, name: 'Merge', description: 'Merge parallel branches', type: 'logic.merge' },
      { icon: <Columns3 className="h-4 w-4" />, name: 'Parallel', description: 'Run branches in parallel', type: 'logic.parallel' },
    ],
  },
  {
    name: 'Data',
    nodes: [
      { icon: <Variable className="h-4 w-4" />, name: 'Variable', description: 'Set or get variables', type: 'data.variable' },
      { icon: <Api className="h-4 w-4" />, name: 'API Call', description: 'Make an HTTP request', type: 'data.api-call' },
      { icon: <Database className="h-4 w-4" />, name: 'Database', description: 'Database query/mutation', type: 'data.database' },
    ],
  },
  {
    name: 'Connectors',
    nodes: [],
  },
];

export function NodePalette({ className }: { className?: string }) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCategory = (name: string) => {
    setCollapsed((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleDragStart = (e: React.DragEvent, node: NodeTemplate) => {
    e.dataTransfer.setData('application/json', JSON.stringify(node));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className={cn('flex h-full flex-col border-r bg-card', className)}>
      <div className="border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Nodes</h3>
        <p className="text-xs text-muted-foreground">Drag nodes onto the canvas</p>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {categories.map((category) => (
          <div key={category.name} className="mb-1">
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium hover:bg-muted"
            >
              {collapsed[category.name] ? (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              {category.name}
            </button>
            {!collapsed[category.name] && (
              <div className="ml-1 space-y-0.5">
                {category.nodes.length === 0 ? (
                  <div className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground">
                    <Puzzle className="h-3.5 w-3.5" />
                    Install connectors to see nodes here
                  </div>
                ) : (
                  category.nodes.map((node) => (
                    <div
                      key={node.type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node)}
                      className="flex cursor-grab items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors hover:bg-muted active:cursor-grabbing"
                    >
                      <span className="text-muted-foreground">{node.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium">{node.name}</p>
                        <p className="text-[10px] text-muted-foreground">{node.description}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

