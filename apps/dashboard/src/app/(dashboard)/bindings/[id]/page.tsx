'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  User,
  Puzzle,
  Database,
  Workflow,
  FunctionSquare,
  Braces,
  RefreshCw,
} from 'lucide-react';
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from '@forge/ui';
import { cn } from '../../../../lib/utils';
import { useBinding, useBindingPreview } from '../../../../hooks/use-bindings';
import { bindingApi } from '../../../../lib/binding-api';
import { ExpressionInput } from '../../../../components/bindings/expression-input';

const sourceTypeIcons: Record<string, React.ReactNode> = {
  user: <User className="h-4 w-4" />,
  connector: <Puzzle className="h-4 w-4" />,
  database: <Database className="h-4 w-4" />,
  workflow: <Workflow className="h-4 w-4" />,
  computed: <FunctionSquare className="h-4 w-4" />,
  static: <Braces className="h-4 w-4" />,
};

const sourceTypeLabels: Record<string, string> = {
  user: 'User',
  connector: 'Connector',
  database: 'Database',
  workflow: 'Workflow',
  computed: 'Computed',
  static: 'Static',
};

function SourceConfigSummary({ sourceType, sourceConfig }: { sourceType: string; sourceConfig: Record<string, unknown> }) {
  const items: { label: string; value: string }[] = [];

  switch (sourceType) {
    case 'user':
      items.push({ label: 'Field', value: String(sourceConfig.field ?? '') });
      break;
    case 'connector':
      items.push({ label: 'Connector', value: String(sourceConfig.connectorId ?? '') });
      items.push({ label: 'Action', value: String(sourceConfig.actionId ?? '') });
      if (sourceConfig.input) items.push({ label: 'Input', value: String(sourceConfig.input) });
      break;
    case 'database':
      items.push({ label: 'Query', value: String(sourceConfig.query ?? '') });
      break;
    case 'workflow':
      items.push({ label: 'Workflow', value: String(sourceConfig.workflowId ?? '') });
      items.push({ label: 'Variable', value: String(sourceConfig.variable ?? '') });
      break;
    case 'computed':
      items.push({ label: 'Formula', value: String(sourceConfig.formula ?? '') });
      break;
    case 'static':
      items.push({ label: 'Value', value: String(sourceConfig.value ?? '') });
      break;
  }

  return (
    <div className="space-y-1.5">
      {items.map((item) => (
        <div key={item.label} className="flex items-start gap-2 text-sm">
          <span className="shrink-0 text-muted-foreground">{item.label}:</span>
          <span className="font-mono text-xs text-foreground break-all">{item.value || '—'}</span>
        </div>
      ))}
    </div>
  );
}

export default function BindingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: binding, loading, error, mutate } = useBinding(params.id);

  const previewSource = binding
    ? { type: binding.sourceType, ...binding.sourceConfig }
    : {};
  const { data: preview, loading: previewLoading, error: previewError, refresh } = useBindingPreview(previewSource);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this binding?')) return;
    try {
      await bindingApi.delete(params.id);
      toast.success('Binding deleted');
      router.push('/bindings');
    } catch {
      toast.error('Failed to delete binding');
    }
  };

  const handleFormulaUpdate = async (formula: string) => {
    try {
      await bindingApi.update(params.id, { sourceConfig: { ...binding!.sourceConfig, formula } });
      toast.success('Formula updated');
      mutate();
    } catch {
      toast.error('Failed to update formula');
    }
  };

  if (loading) return <p className="text-sm text-muted-foreground">Loading binding...</p>;
  if (error) return <p className="text-sm text-destructive">{error}</p>;
  if (!binding) return <p className="text-sm text-muted-foreground">Binding not found</p>;

  return (
    <div>
      <Link
        href="/bindings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bindings
      </Link>

      <div className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{binding.name}</h1>
              <Badge
                variant={binding.status === 'active' ? 'default' : 'secondary'}
                className={cn(
                  'capitalize',
                  binding.status === 'active' && 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
                )}
              >
                <span className={cn(
                  'mr-1 inline-block h-1.5 w-1.5 rounded-full',
                  binding.status === 'active' ? 'bg-emerald-500' : 'bg-muted-foreground/40',
                )} />
                {binding.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Created {new Date(binding.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Edit3 className="mr-1.5 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="mr-1.5 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {sourceTypeIcons[binding.sourceType]}
                <CardTitle className="text-sm">Source Configuration</CardTitle>
                <Badge variant="outline" className="ml-auto text-[10px] capitalize">
                  {sourceTypeLabels[binding.sourceType] ?? binding.sourceType}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <SourceConfigSummary
                sourceType={binding.sourceType}
                sourceConfig={binding.sourceConfig}
              />
            </CardContent>
          </Card>

          {binding.sourceType === 'computed' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Expression Formula</CardTitle>
              </CardHeader>
              <CardContent>
                <ExpressionInput
                  value={String(binding.sourceConfig.formula ?? '')}
                  onChange={handleFormulaUpdate}
                  placeholder="Enter formula..."
                />
              </CardContent>
            </Card>
          )}

          {binding.targetComponentId && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Target Component</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-muted-foreground">Component:</span>
                    <span className="font-mono text-xs">{binding.targetComponentId}</span>
                  </div>
                  {binding.targetProperty && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground">Property:</span>
                      <span className="font-mono text-xs">{binding.targetProperty}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm">Live Preview</CardTitle>
                <button
                  onClick={() => refresh()}
                  className="ml-auto rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted"
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', previewLoading && 'animate-spin')} />
                </button>
              </div>
            </CardHeader>
            <CardContent>
              {previewLoading && (
                <p className="text-sm text-muted-foreground">Resolving...</p>
              )}
              {previewError && (
                <p className="text-sm text-destructive">{previewError}</p>
              )}
              {!previewLoading && !previewError && preview && (
                <div>
                  {(() => {
                    const value = preview.value ?? preview;
                    if (value === null || value === undefined) {
                      return <p className="text-sm text-muted-foreground">null</p>;
                    }
                    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                      return (
                        <div className="rounded bg-muted/50 px-3 py-2 font-mono text-sm">
                          {String(value)}
                        </div>
                      );
                    }
                    if (Array.isArray(value)) {
                      return (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">
                            Array ({value.length} items)
                          </p>
                          <div className="max-h-40 overflow-y-auto rounded bg-muted/50 p-2 font-mono text-xs">
                            {value.slice(0, 10).map((item: unknown, i: number) => (
                              <div key={i} className="py-0.5">
                                [{i}] {JSON.stringify(item)}
                              </div>
                            ))}
                            {value.length > 10 && (
                              <p className="pt-1 text-[10px] text-muted-foreground">
                                ...and {value.length - 10} more
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (typeof value === 'object') {
                      return (
                        <div className="max-h-60 overflow-y-auto rounded bg-muted/50 p-2 font-mono text-xs">
                          {JSON.stringify(value, null, 2)}
                        </div>
                      );
                    }
                    return (
                      <div className="rounded bg-muted/50 px-3 py-2 font-mono text-sm">
                        {String(value)}
                      </div>
                    );
                  })()}
                  {preview.resolvedAt && (
                    <p className="mt-2 text-[10px] text-muted-foreground">
                          Last resolved: {new Date(preview.resolvedAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}
                  {!previewLoading && !previewError && !preview && (
                    <p className="text-sm text-muted-foreground">No data resolved yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      );
    }
