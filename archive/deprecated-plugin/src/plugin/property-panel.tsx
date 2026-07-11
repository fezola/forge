'use client';

import React from 'react';
import { ComponentConfigSchema } from '@forge/forge-components';

interface PropertyPanelProps {
  componentId: string;
  schema: ComponentConfigSchema;
  values: Record<string, unknown>;
  onChange: (prop: string, value: unknown) => void;
}

export function PropertyPanel({ componentId, schema, values, onChange }: PropertyPanelProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="border-b pb-2">
        <h3 className="text-sm font-medium">{schema.name}</h3>
        <p className="text-xs text-muted-foreground">{schema.description}</p>
      </div>
      <div className="space-y-3">
        {Object.entries(schema.props).map(([propKey, propConfig]) => (
          <div key={propKey}>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">{propConfig.label}</label>
            {propConfig.type === 'select' && (
              <select
                className="w-full rounded border bg-background px-3 py-1.5 text-sm"
                value={(values[propKey] as string) || (propConfig.defaultValue as string) || ''}
                onChange={e => onChange(propKey, e.target.value)}
              >
                {propConfig.options?.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
            {propConfig.type === 'boolean' && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="rounded"
                  checked={(values[propKey] as boolean) || false}
                  onChange={e => onChange(propKey, e.target.checked)}
                />
                <span className="text-xs text-muted-foreground">{propConfig.label}</span>
              </label>
            )}
            {(propConfig.type === 'string' || propConfig.type === 'number') && (
              <input
                type={propConfig.type === 'number' ? 'number' : 'text'}
                className="w-full rounded border bg-background px-3 py-1.5 text-xs"
                placeholder={propConfig.placeholder}
                value={(values[propKey] as string) || ''}
                onChange={e => onChange(propKey, propConfig.type === 'number' ? Number(e.target.value) : e.target.value)}
              />
            )}
            {propConfig.type === 'color' && (
              <input
                type="color"
                className="h-8 w-full rounded border"
                value={(values[propKey] as string) || '#000000'}
                onChange={e => onChange(propKey, e.target.value)}
              />
            )}
            {propConfig.description && (
              <p className="mt-0.5 text-[10px] text-muted-foreground">{propConfig.description}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
