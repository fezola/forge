import type { ReactNode } from 'react';

export type PropConfigType = 'string' | 'number' | 'boolean' | 'select' | 'multi-select' | 'color' | 'image' | 'slot';

export interface PropConfig {
  type: PropConfigType;
  label: string;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
  group?: string;
}

export interface DataBindingConfig {
  type: 'connector' | 'user' | 'workflow' | 'database' | 'static';
  config: Record<string, unknown>;
  path?: string;
}

export interface EventConfig {
  label: string;
  description?: string;
  outputs?: Array<{ name: string; type: string }>;
}

export interface ComponentConfigSchema {
  name: string;
  description: string;
  category: 'auth' | 'data' | 'payment' | 'blockchain' | 'ai' | 'storage' | 'ui' | 'deployment' | 'enterprise' | 'marketplace' | 'connector';
  props: Record<string, PropConfig>;
  events?: Record<string, EventConfig>;
  dataBinding?: DataBindingConfig;
  supportsChildren: boolean;
  defaultProps?: Record<string, unknown>;
}

export interface ForgeComponent {
  id: string;
  config: ComponentConfigSchema;
  render: (props: Record<string, unknown>) => ReactNode;
}

export interface ForgeComponentConfig {
  projectId: string;
  apiKey: string;
  config?: Record<string, unknown>;
  onEvent?: (event: string, data?: unknown) => void;
}
