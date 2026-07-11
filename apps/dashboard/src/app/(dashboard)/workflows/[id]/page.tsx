'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Upload, RotateCcw, Copy, Trash2, Play } from 'lucide-react';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@forge/ui';
import { cn } from '../../../../lib/utils';
import { useWorkflow } from '../../../../hooks/use-workflows';
import { workflowApi } from '../../../../lib/workflow-api';
import { ExecutionLog } from '../../../../components/workflow/execution-log';

const statusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'secondary',
  published: 'default',
  archived: 'outline',
};

const executionStatusVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  success: 'default',
  failed: 'destructive',
  running: 'secondary',
  pending: 'outline',
};

export default function WorkflowDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: workflow, loading, error, mutate } = useWorkflow(params.id);

  const handlePublish = async () => {
    try {
      await workflowApi.publish(params.id);
      toast.success('Workflow published');
      mutate();
    } catch {
      toast.error('Failed to publish workflow');
    }
  };

  const handleRollback = async () => {
    try {
      await workflowApi.rollback(params.id);
      toast.success('Workflow rolled back');
      mutate();
    } catch {
      toast.error('Failed to rollback workflow');
    }
  };

  const handleDuplicate = async () => {
    try {
      const res = await workflowApi.duplicate(params.id);
      const newId = res.data?.id ?? res.id;
      toast.success('Workflow duplicated');
      router.push(`/workflows/${newId}`);
    } catch {
      toast.error('Failed to duplicate workflow');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;
    try {
      await workflowApi.delete(params.id);
      toast.success('Workflow deleted');
      router.push('/workflows');
    } catch {
      toast.error('Failed to delete workflow');
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading workflow...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!workflow) return <p className="text-sm text-muted-foreground">Workflow not found</p>;

  return (
    <div>
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workflows
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{workflow.name}</h1>
              <Badge variant={statusVariant[workflow.status] ?? 'secondary'} className="capitalize">
                {workflow.status}
              </Badge>
            </div>
            {workflow.description && (
              <p className="mt-1 text-sm text-muted-foreground">{workflow.description}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">Version v{workflow.version} &middot; Trigger: {workflow.triggerType}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/workflows/${params.id}/editor`}>
                <Edit className="mr-1.5 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="default" size="sm" onClick={handlePublish}>
              <Upload className="mr-1.5 h-4 w-4" />
              Publish
            </Button>
            <Button variant="outline" size="sm" onClick={handleRollback}>
              <RotateCcw className="mr-1.5 h-4 w-4" />
              Rollback
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="mr-1.5 h-4 w-4" />
              Duplicate
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Nodes</p>
            <p className="mt-1 text-2xl font-bold">{workflow.nodeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Edges</p>
            <p className="mt-1 text-2xl font-bold">{workflow.edgeCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Last Run</p>
            <p className="mt-1 text-2xl font-bold">
              {workflow.lastRun ? (
                <span className="text-base font-normal">{new Date(workflow.lastRun).toLocaleString()}</span>
              ) : (
                <span className="text-base font-normal text-muted-foreground">Never</span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {workflow.executionHistory && workflow.executionHistory.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Execution History</h3>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Started</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Duration</th>
                    <th className="px-4 py-2.5 text-left font-medium text-muted-foreground">Trigger</th>
                    <th className="px-4 py-2.5 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflow.executionHistory.map((exec) => (
                    <tr key={exec.id} className="border-b transition-colors hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <Badge variant={executionStatusVariant[exec.status] ?? 'outline'} className="text-[10px] capitalize">
                          {exec.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {new Date(exec.startedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {exec.duration ? `${exec.duration}ms` : '-'}
                      </td>
                      <td className="px-4 py-2.5 capitalize text-muted-foreground">
                        {exec.trigger ?? '-'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {exec.logs && exec.logs.length > 0 && (
                          <button
                            onClick={() => {/* open log panel */}}
                            className="rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
                          >
                            View Logs
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {workflow.executionHistory && workflow.executionHistory.length > 0 && workflow.executionHistory[0].logs && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <h3 className="text-sm font-semibold">Latest Execution Log</h3>
          </CardHeader>
          <CardContent className="p-0">
            <ExecutionLog entries={workflow.executionHistory[0].logs} className="max-h-64" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}