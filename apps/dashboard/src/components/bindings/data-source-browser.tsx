'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  ChevronRight,
  ChevronDown,
  User,
  Puzzle,
  Workflow,
  Database,
  FunctionSquare,
  GripVertical,
} from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  icon?: React.ReactNode;
  children?: TreeNode[];
  leaf?: boolean;
  path?: string;
}

const mockTree: TreeNode[] = [
  {
    id: 'user',
    label: 'User',
    icon: <User className="h-4 w-4" />,
    children: [
      { id: 'user-id', label: 'ID', leaf: true, path: '{{user.id}}' },
      { id: 'user-email', label: 'Email', leaf: true, path: '{{user.email}}' },
      { id: 'user-name', label: 'Name', leaf: true, path: '{{user.name}}' },
      {
        id: 'user-profile',
        label: 'Profile',
        children: [
          { id: 'user-profile-avatar', label: 'Avatar URL', leaf: true, path: '{{user.profile.avatar}}' },
          { id: 'user-profile-bio', label: 'Bio', leaf: true, path: '{{user.profile.bio}}' },
        ],
      },
    ],
  },
  {
    id: 'connectors',
    label: 'Connectors',
    icon: <Puzzle className="h-4 w-4" />,
    children: [
      {
        id: 'connector-stripe',
        label: 'Stripe',
        children: [
          { id: 'stripe-list-customers', label: 'List Customers', leaf: true, path: '{{connector.stripe.listCustomers}}' },
          { id: 'stripe-create-payment', label: 'Create Payment', leaf: true, path: '{{connector.stripe.createPayment}}' },
        ],
      },
      {
        id: 'connector-resend',
        label: 'Resend',
        children: [
          { id: 'resend-send-email', label: 'Send Email', leaf: true, path: '{{connector.resend.sendEmail}}' },
        ],
      },
    ],
  },
  {
    id: 'workflows',
    label: 'Workflows',
    icon: <Workflow className="h-4 w-4" />,
    children: [
      {
        id: 'wf-onboard',
        label: 'Onboarding Flow',
        children: [
          { id: 'wf-onboard-user', label: 'User Variable', leaf: true, path: '{{workflow.onboarding.user}}' },
          { id: 'wf-onboard-status', label: 'Status', leaf: true, path: '{{workflow.onboarding.status}}' },
        ],
      },
    ],
  },
  {
    id: 'database',
    label: 'Database',
    icon: <Database className="h-4 w-4" />,
    children: [
      { id: 'db-placeholder', label: 'Tables will appear here', leaf: true },
    ],
  },
  {
    id: 'computed',
    label: 'Computed',
    icon: <FunctionSquare className="h-4 w-4" />,
    children: [
      { id: 'comp-full-name', label: 'Full Name', leaf: true, path: '{{computed.fullName}}' },
      { id: 'comp-welcome', label: 'Welcome Message', leaf: true, path: '{{computed.welcomeMessage}}' },
    ],
  },
];

function TreeNodeItem({
  node,
  depth = 0,
  onSelect,
}: {
  node: TreeNode;
  depth?: number;
  onSelect?: (path: string) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <button
        onClick={() => {
          if (hasChildren) {
            setExpanded(!expanded);
          } else if (node.leaf && node.path && onSelect) {
            onSelect(node.path);
          }
        }}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-muted',
          depth > 0 && 'ml-4',
          node.leaf ? 'cursor-pointer' : 'cursor-default',
        )}
      >
        {hasChildren ? (
          expanded ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        {node.icon && <span className="shrink-0">{node.icon}</span>}
        {node.leaf && (
          <GripVertical className="h-3 w-3 shrink-0 text-muted-foreground/50" />
        )}
        <span className={cn('truncate', node.leaf && 'font-mono text-xs')}>
          {node.label}
        </span>
        {node.path && (
          <span className="ml-auto truncate text-[10px] text-muted-foreground/60">
            {node.path}
          </span>
        )}
      </button>
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNodeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DataSourceBrowserProps {
  onSelect?: (path: string) => void;
  className?: string;
}

export function DataSourceBrowser({ onSelect, className }: DataSourceBrowserProps) {
  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      <div className="border-b px-3 py-2">
        <h3 className="text-sm font-semibold">Data Sources</h3>
      </div>
      <div className="p-2">
        {mockTree.map((node) => (
          <TreeNodeItem key={node.id} node={node} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
