'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useWorkflow } from '../../../../../hooks/use-workflows';
import { workflowApi } from '../../../../../lib/workflow-api';
import { WorkflowToolbar } from '../../../../../components/workflow/workflow-toolbar';
import { WorkflowCanvas } from '../../../../../components/workflow/workflow-canvas';
import { NodePalette } from '../../../../../components/workflow/node-palette';
import { NodeConfigPanel } from '../../../../../components/workflow/node-config-panel';

export default function WorkflowEditorPage() {
  const params = useParams<{ id: string }>();
  const { data: workflow, loading, error, mutate } = useWorkflow(params.id);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [workflowName, setWorkflowName] = useState('');

  const selectedNode = workflow?.nodes?.find((n) => n.id === selectedNodeId) ?? null;

  const handleSaveDraft = useCallback(async () => {
    if (!workflow) return;
    try {
      await workflowApi.update(params.id, {
        name: workflowName || workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
      });
      toast.success('Draft saved');
      mutate();
    } catch {
      toast.error('Failed to save draft');
    }
  }, [workflow, workflowName, params.id, mutate]);

  const handlePublish = useCallback(async () => {
    try {
      await workflowApi.publish(params.id);
      toast.success('Workflow published');
      mutate();
    } catch {
      toast.error('Failed to publish workflow');
    }
  }, [params.id, mutate]);

  const handleRun = useCallback(async () => {
    try {
      await workflowApi.execute(params.id);
      toast.success('Workflow execution started');
    } catch {
      toast.error('Failed to execute workflow');
    }
  }, [params.id]);

  if (loading) return <p className="p-6 text-sm text-muted-foreground">Loading editor...</p>;
  if (error) return <p className="p-6 text-sm text-destructive">{error}</p>;
  if (!workflow) return <p className="p-6 text-sm text-muted-foreground">Workflow not found</p>;

  const currentName = workflowName || workflow.name;

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <div className="flex items-center gap-2 border-b bg-card px-4 py-1.5">
        <Link
          href={`/workflows/${params.id}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <span className="text-xs text-muted-foreground">/</span>
        <span className="text-xs text-muted-foreground">Editor</span>
      </div>

      <WorkflowToolbar
        workflowName={currentName}
        onNameChange={setWorkflowName}
        status={workflow.status}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUndo={() => toast.info('Undo (not yet implemented)')}
        onRedo={() => toast.info('Redo (not yet implemented)')}
        onZoomIn={() => toast.info('Zoom in (not yet implemented)')}
        onZoomOut={() => toast.info('Zoom out (not yet implemented)')}
        onRun={handleRun}
      />

      <div className="flex flex-1 overflow-hidden">
        <NodePalette className="w-56 shrink-0" />

        <WorkflowCanvas
          nodes={workflow.nodes ?? []}
          edges={workflow.edges ?? []}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
        />

        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          className="w-72 shrink-0"
        />
      </div>
    </div>
  );
}