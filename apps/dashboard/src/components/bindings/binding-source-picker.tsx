'use client';

import { useState } from 'react';
import { cn } from '../../lib/utils';
import {
  User,
  Puzzle,
  Database,
  Workflow,
  FunctionSquare,
  Braces,
} from 'lucide-react';
import { Input } from '@forge/ui';

type SourceType = 'user' | 'connector' | 'database' | 'workflow' | 'computed' | 'static';

interface BindingSourcePickerProps {
  value: {
    type: SourceType;
    config: Record<string, unknown>;
  };
  onChange: (value: { type: SourceType; config: Record<string, unknown> }) => void;
  className?: string;
}

const tabs: { type: SourceType; label: string; icon: React.ReactNode }[] = [
  { type: 'user', label: 'User', icon: <User className="h-4 w-4" /> },
  { type: 'connector', label: 'Connector', icon: <Puzzle className="h-4 w-4" /> },
  { type: 'database', label: 'Database', icon: <Database className="h-4 w-4" /> },
  { type: 'workflow', label: 'Workflow', icon: <Workflow className="h-4 w-4" /> },
  { type: 'computed', label: 'Computed', icon: <FunctionSquare className="h-4 w-4" /> },
  { type: 'static', label: 'Static', icon: <Braces className="h-4 w-4" /> },
];

const userFields = ['id', 'email', 'name', 'profile.avatar', 'profile.bio', 'createdAt'];

const mockConnectors = [
  {
    id: 'stripe',
    name: 'Stripe',
    actions: ['listCustomers', 'createPayment', 'createCheckoutSession'],
  },
  {
    id: 'resend',
    name: 'Resend',
    actions: ['sendEmail', 'sendBatch'],
  },
];

const mockWorkflows = [
  {
    id: 'onboarding',
    name: 'Onboarding Flow',
    variables: ['user', 'status', 'startedAt'],
  },
  {
    id: 'invoice-flow',
    name: 'Invoice Flow',
    variables: ['invoice', 'customer', 'amount'],
  },
];

function UserPicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">User Field</label>
      <select
        value={String(config.field ?? '')}
        onChange={(e) => onChange({ ...config, field: e.target.value })}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <option value="">Select a field...</option>
        {userFields.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
    </div>
  );
}

function ConnectorPicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const selectedConnector = String(config.connectorId ?? '');
  const connector = mockConnectors.find((c) => c.id === selectedConnector);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Connector</label>
        <select
          value={selectedConnector}
          onChange={(e) => onChange({ ...config, connectorId: e.target.value, actionId: '' })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a connector...</option>
          {mockConnectors.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {connector && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <select
            value={String(config.actionId ?? '')}
            onChange={(e) => onChange({ ...config, actionId: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select an action...</option>
            {connector.actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>
      )}
      {connector && config.actionId && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Input (JSON)</label>
          <textarea
            value={String(config.input ?? '')}
            onChange={(e) => onChange({ ...config, input: e.target.value })}
            placeholder='{"limit": 10}'
            rows={3}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

function DatabasePicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Query</label>
      <textarea
        value={String(config.query ?? '')}
        onChange={(e) => onChange({ ...config, query: e.target.value })}
        placeholder="SELECT * FROM users WHERE id = {{user.id}}"
        rows={3}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

function WorkflowPicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  const selectedWorkflow = String(config.workflowId ?? '');
  const workflow = mockWorkflows.find((w) => w.id === selectedWorkflow);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground">Workflow</label>
        <select
          value={selectedWorkflow}
          onChange={(e) => onChange({ ...config, workflowId: e.target.value, variable: '' })}
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select a workflow...</option>
          {mockWorkflows.map((w) => (
            <option key={w.id} value={w.id}>{w.name}</option>
          ))}
        </select>
      </div>
      {workflow && (
        <div>
          <label className="text-xs font-medium text-muted-foreground">Variable</label>
          <select
            value={String(config.variable ?? '')}
            onChange={(e) => onChange({ ...config, variable: e.target.value })}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select a variable...</option>
            {workflow.variables.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

function ComputedPicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Formula</label>
      <Input
        value={String(config.formula ?? '')}
        onChange={(e) => onChange({ ...config, formula: e.target.value })}
        placeholder="e.g. {{user.name | uppercase}} + ' - ' + {{user.email}}"
        className="font-mono"
      />
      <p className="text-[10px] text-muted-foreground">
        Use {'{{variable.path}}'} syntax. Supports filters like | uppercase, | lowercase, | json.
      </p>
    </div>
  );
}

function StaticPicker({
  config,
  onChange,
}: {
  config: Record<string, unknown>;
  onChange: (c: Record<string, unknown>) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-muted-foreground">Value (JSON)</label>
      <textarea
        value={String(config.value ?? '')}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange({ ...config, value: e.target.value, parsedValue: parsed });
          } catch {
            onChange({ ...config, value: e.target.value });
          }
        }}
        placeholder='{"hello": "world"}'
        rows={5}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}

export function BindingSourcePicker({ value, onChange, className }: BindingSourcePickerProps) {
  const [activeTab, setActiveTab] = useState<SourceType>(value.type);

  const handleTabChange = (type: SourceType) => {
    setActiveTab(type);
    onChange({ type, config: {} });
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => handleTabChange(tab.type)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              activeTab === tab.type
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="rounded-md border bg-card p-4">
        {activeTab === 'user' && (
          <UserPicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
        {activeTab === 'connector' && (
          <ConnectorPicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
        {activeTab === 'database' && (
          <DatabasePicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
        {activeTab === 'workflow' && (
          <WorkflowPicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
        {activeTab === 'computed' && (
          <ComputedPicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
        {activeTab === 'static' && (
          <StaticPicker config={value.config} onChange={(c) => onChange({ type: activeTab, config: c })} />
        )}
      </div>
    </div>
  );
}
