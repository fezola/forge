'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input } from '@forge/ui';
import Link from 'next/link';
import { workflowApi } from '../../../../lib/workflow-api';

const MOCK_PROJECT_ID = 'proj_1';

export default function NewWorkflowPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Workflow name is required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await workflowApi.create({
        projectId: MOCK_PROJECT_ID,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      const id = res.data?.id ?? res.id;
      toast.success('Workflow created');
      router.push(`/workflows/${id}/editor`);
    } catch {
      toast.error('Failed to create workflow');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <Link
        href="/workflows"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to workflows
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Create Workflow</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Give your workflow a name and optional description to get started.
      </p>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <Input
            placeholder="My Workflow"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Description (optional)</label>
          <textarea
            placeholder="Describe what this workflow does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        <div className="flex items-center gap-3 pt-2">
          <Button onClick={handleCreate} disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Workflow'}
          </Button>
          <Button variant="outline" asChild>
            <Link href="/workflows">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}