'use client';

import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function ConnectorWizard({
  steps,
  currentStep,
  onNext,
  onBack,
  onFinish,
  isLastStep,
  children,
}: {
  steps: { title: string; description?: string }[];
  currentStep: number;
  onNext?: () => void;
  onBack?: () => void;
  onFinish?: () => void;
  isLastStep?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-0">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  i < currentStep
                    ? 'bg-primary text-primary-foreground'
                    : i === currentStep
                      ? 'border-2 border-primary text-primary'
                      : 'border-2 border-muted-foreground/30 text-muted-foreground',
                )}
              >
                {i < currentStep ? '✓' : i + 1}
              </div>
              <span
                className={cn(
                  'mt-1 text-xs',
                  i <= currentStep ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.title}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  'mx-2 h-0.5 w-12 sm:w-20',
                  i < currentStep ? 'bg-primary' : 'bg-muted',
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="rounded-lg border bg-card p-6">{children}</div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={currentStep === 0}
          className="rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
        >
          Back
        </button>
        {isLastStep ? (
          <button
            onClick={onFinish}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Finish
          </button>
        ) : (
          <button
            onClick={onNext}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
