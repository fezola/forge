'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Search, Workflow, List, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Badge } from '@forge/ui';
import { cn } from '../../../lib/utils';
import { useWorkflows } from '../../../hooks/use-workflows';
import { workflowApi } from '../../../lib/workflow-api';
import { WorkflowListCard } from '../../../components/workflow/workflow-list-card';

const MOCK_PROJECT_ID = 'proj_1';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

export default function WorkflowsPage() {
  const router = useRouter();
  const { data: workflows, loading, error, mutate } = useWorkflows(MOCK_PROJECT_ID);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  const filtered = workflows?.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handlePublish = async (id: string) => {
    try {
      await workflowApi.publish(id);
      toast.success('Workflow published');
      mutate();
    } catch {
      toast.error('Failed to publish workflow');
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await workflowApi.duplicate(id);
      toast.success('Workflow duplicated');
      mutate();
      router.push(`/workflows/${res.data?.id ?? res.id}`);
    } catch {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowApi.delete(id);
      toast.success('Workflow deleted');
      mutate();
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {workflows ? `${workflows.length} workflows` : 'Automate your processes'}
          </p>
        </div>
        <Link
          href="/workflows/new"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Workflow
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search workflows..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div className="flex items-center gap-1 rounded-lg border p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'rounded-md p-1.5 transition-colors',
              viewMode === 'table' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading workflows...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {filtered && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Workflow className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search ? 'No workflows match your search.' : 'No workflows yet.'}
          </p>
          {!search && (
            <Link
              href="/workflows/new"
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Create your first workflow
            </Link>
          )}
        </div>
      )}

      {viewMode === 'grid' && filtered && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((workflow) => (
            <WorkflowListCard
              key={workflow.id}
              workflow={workflow}
              onPublish={handlePublish}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {viewMode === 'table' && filtered && filtered.length > 0 && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="border-b">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Version</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Trigger</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nodes</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Updated</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((workflow) => (
                <tr key={workflow.id} className="border-b transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/workflows/${workflow.id}`}
                      className="font-medium hover:underline"
                    >
                      {workflow.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">v{workflow.version}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[workflow.status] ?? 'secondary'} className="text-[10px] capitalize">
                      {workflow.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{workflow.triggerType}</td>
                  <td className="px-4 py-3 text-muted-foreground">{workflow.nodeCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(workflow.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/workflows/${workflow.id}/editor`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handlePublish(workflow.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleDuplicate(workflow.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                      >
                        Duplicate
                      </button>
                      <button
                        onClick={() => handleDelete(workflow.id)}
                        className="rounded-md px-2 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}