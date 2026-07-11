'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Input, Card, CardContent } from '@forge/ui';
import { cn } from '../../../../lib/utils';
import { bindingApi } from '../../../../lib/binding-api';
import { BindingSourcePicker } from '../../../../components/bindings/binding-source-picker';
import { BindingPreview } from '../../../../components/bindings/binding-preview';
import { ExpressionInput } from '../../../../components/bindings/expression-input';

const MOCK_PROJECT_ID = 'proj_1';

type SourceType = 'user' | 'connector' | 'database' | 'workflow' | 'computed' | 'static';

const steps = [
  { id: 1, label: 'Source Type' },
  { id: 2, label: 'Configure' },
  { id: 3, label: 'Name & Target' },
  { id: 4, label: 'Preview' },
];

export default function NewBindingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [targetComponentId, setTargetComponentId] = useState('');
  const [targetProperty, setTargetProperty] = useState('');
  const [sourceType, setSourceType] = useState<SourceType>('user');
  const [sourceConfig, setSourceConfig] = useState<Record<string, unknown>>({});
  const [submitting, setSubmitting] = useState(false);

  const canProceed = () => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return Object.keys(sourceConfig).length > 0;
      case 3:
        return name.trim().length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!canProceed()) {
      toast.error('Please complete the current step first');
      return;
    }
    setStep((s) => Math.min(s + 1, 4));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Binding name is required');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        projectId: MOCK_PROJECT_ID,
        name: name.trim(),
        sourceType,
        sourceConfig,
      };
      if (targetComponentId.trim()) body.targetComponentId = targetComponentId.trim();
      if (targetProperty.trim()) body.targetProperty = targetProperty.trim();

      const res = await bindingApi.create(body as Parameters<typeof bindingApi.create>[0]);
      const id = res.data?.id ?? res.id;
      toast.success('Binding created');
      router.push(`/bindings/${id}`);
    } catch {
      toast.error('Failed to create binding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <Link
        href="/bindings"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to bindings
      </Link>

      <h1 className="mb-1 text-2xl font-bold">Create Binding</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Connect a data source to your components in 4 simple steps.
      </p>

      <div className="mb-6 flex items-center">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium',
                  step > s.id
                    ? 'bg-primary text-primary-foreground'
                    : step === s.id
                      ? 'border-2 border-primary text-primary'
                      : 'border bg-muted text-muted-foreground',
                )}
              >
                {step > s.id ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span
                className={cn(
                  'text-xs font-medium',
                  step >= s.id ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-px w-12',
                  step > s.id ? 'bg-primary' : 'bg-border',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Select Source Type</h2>
              <p className="text-xs text-muted-foreground">
                Choose the type of data source you want to bind.
              </p>
              <BindingSourcePicker
                value={{ type: sourceType, config: sourceConfig }}
                onChange={({ type, config }) => {
                  setSourceType(type);
                  setSourceConfig(config);
                }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Configure Source</h2>
              <p className="text-xs text-muted-foreground">
                Configure the details for {sourceType} source.
              </p>
              <BindingSourcePicker
                value={{ type: sourceType, config: sourceConfig }}
                onChange={({ config }) => setSourceConfig(config)}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Name &amp; Target</h2>
              <p className="text-xs text-muted-foreground">
                Give your binding a name and optionally link it to a component.
              </p>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Name</label>
                <Input
                  placeholder="My Binding"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Target Component ID (optional)</label>
                <Input
                  placeholder="e.g. cmp_header_title"
                  value={targetComponentId}
                  onChange={(e) => setTargetComponentId(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Target Property (optional)</label>
                <Input
                  placeholder="e.g. text, src, color"
                  value={targetProperty}
                  onChange={(e) => setTargetProperty(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-sm font-semibold">Preview</h2>
              <p className="text-xs text-muted-foreground">
                Verify the resolved value before creating the binding.
              </p>

              {sourceType === 'computed' && (
                <div className="mb-4">
                  <label className="mb-1.5 block text-sm font-medium">Expression</label>
                  <ExpressionInput
                    value={String(sourceConfig.formula ?? '')}
                    onChange={(v) => setSourceConfig({ ...sourceConfig, formula: v })}
                    placeholder="Enter formula..."
                  />
                </div>
              )}

              <div className="rounded-md border bg-muted/30 p-3">
                <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-medium">Source:</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{sourceType}</Badge>
                  <span className="font-mono text-[10px]">{JSON.stringify(sourceConfig)}</span>
                </div>
              </div>

              <BindingPreview
                source={{ type: sourceType, ...sourceConfig }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex items-center justify-between">
        <div>
          {step > 1 && (
            <Button variant="outline" onClick={prevStep}>
              Back
            </Button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 4 ? (
            <Button onClick={nextStep}>
              Continue
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Binding'}
            </Button>
          )}
          <Button variant="ghost" asChild>
            <Link href="/bindings">Cancel</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
