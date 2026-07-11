'use client';

import Link from 'next/link';
import { ArrowLeft, Workflow, UserPlus, CreditCard, ShieldCheck, Download } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@forge/ui';

const templates = [
  {
    name: 'User Onboarding',
    description: 'Trigger on user signup, create a wallet, then send a welcome email.',
    icon: UserPlus,
    nodeCount: 3,
    trigger: 'Webhook',
    nodes: ['User Signup (trigger)', 'Create Wallet', 'Send Welcome Email'],
  },
  {
    name: 'Payment Flow',
    description: 'Button click triggers payment processing, database update, and receipt email.',
    icon: CreditCard,
    nodeCount: 4,
    trigger: 'Manual',
    nodes: ['Button Click (trigger)', 'Process Payment', 'Update Database', 'Send Receipt'],
  },
  {
    name: 'KYC Verification',
    description: 'Document upload triggers verification, approval/review decision, and notification.',
    icon: ShieldCheck,
    nodeCount: 4,
    trigger: 'Webhook',
    nodes: ['Document Upload (trigger)', 'Verify Identity', 'Approve/Reject', 'Notify User'],
  },
  {
    name: 'Data Sync',
    description: 'Scheduled sync between external API and local database with error handling.',
    icon: Download,
    nodeCount: 5,
    trigger: 'Schedule',
    nodes: ['Cron Trigger', 'Fetch External Data', 'Transform Data', 'Upsert Database', 'Log Result'],
  },
];

const triggerColors: Record<string, string> = {
  Webhook: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
  Manual: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
  Schedule: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200',
};

export default function TemplatesPage() {
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
        <h1 className="text-2xl font-bold">Workflow Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Start with a pre-built template and customize it to fit your needs.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {templates.map((template) => (
          <Card key={template.name} className="flex flex-col transition-shadow hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <template.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-xs">{template.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block rounded px-2 py-0.5 text-[10px] font-medium capitalize"
                >
                  {template.trigger}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {template.nodeCount} nodes
                </span>
              </div>
              <ul className="mt-2 space-y-0.5">
                {template.nodes.map((node) => (
                  <li key={node} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {node}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="pt-0">
              <Link
                href={`/workflows/new?template=${template.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="w-full rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Use Template
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}