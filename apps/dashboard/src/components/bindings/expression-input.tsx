'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';

const mockSuggestions = [
  { label: 'user.id', path: '{{user.id}}' },
  { label: 'user.email', path: '{{user.email}}' },
  { label: 'user.name', path: '{{user.name}}' },
  { label: 'user.profile.avatar', path: '{{user.profile.avatar}}' },
  { label: 'user.profile.bio', path: '{{user.profile.bio}}' },
  { label: 'workflow.onboarding.user', path: '{{workflow.onboarding.user}}' },
  { label: 'workflow.onboarding.status', path: '{{workflow.onboarding.status}}' },
  { label: 'connector.stripe.listCustomers', path: '{{connector.stripe.listCustomers}}' },
];

interface ExpressionInputProps {
  value: string;
  onChange: (value: string) => void;
  onValidate?: (valid: boolean) => void;
  className?: string;
  placeholder?: string;
}

export function ExpressionInput({
  value,
  onChange,
  onValidate,
  className,
  placeholder = 'Enter expression...',
}: ExpressionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filtered, setFiltered] = useState(mockSuggestions);
  const [cursorPos, setCursorPos] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const isValid = value.trim().length > 0 && /{{\s*[\w.]+(\s*\|\s*\w+)?\s*}}/.test(value);

  useEffect(() => {
    onValidate?.(isValid);
  }, [isValid, onValidate]);

  useEffect(() => {
    if (!value) {
      setFiltered(mockSuggestions);
      return;
    }
    const lastToken = value.split('{{').pop()?.split('}}')[0]?.trim().toLowerCase() ?? '';
    if (lastToken) {
      setFiltered(
        mockSuggestions.filter((s) => s.label.toLowerCase().includes(lastToken)),
      );
    } else {
      setFiltered(mockSuggestions);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const insertSuggestion = (path: string) => {
    const before = value.slice(0, cursorPos);
    const after = value.slice(cursorPos);
    const newValue = before + path + after;
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapperRef} className={cn('relative', className)}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setCursorPos(e.target.selectionStart ?? 0);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowSuggestions(false);
          }}
          placeholder={placeholder}
          className={cn(
            'w-full rounded-md border bg-background px-3 py-2 pr-8 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            isValid
              ? 'border-emerald-500/50 focus-visible:ring-emerald-500/30'
              : value
                ? 'border-destructive/50 focus-visible:ring-destructive/30'
                : 'border-input',
          )}
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
          {value ? (
            isValid ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive" />
            )
          ) : null}
        </span>
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-card shadow-lg">
          <div className="border-b px-3 py-1.5 text-[10px] font-medium text-muted-foreground">
            Variables
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filtered.map((s) => (
              <button
                key={s.path}
                onClick={() => insertSuggestion(s.path)}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-muted"
              >
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                <span className="font-mono text-foreground">{s.path}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{s.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {value && !isValid && (
        <p className="mt-1 text-[11px] text-destructive">
          Use {'{{variable.path}}'} syntax (e.g., {'{{user.name}}'})
        </p>
      )}
    </div>
  );
}
