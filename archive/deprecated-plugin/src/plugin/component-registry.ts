import { ComponentConfigSchema } from '@forge/forge-components';

export interface RegistryEntry {
  id: string;
  schema: ComponentConfigSchema;
  component: React.ComponentType<any>;
}

const registry = new Map<string, RegistryEntry>();

export function registerComponent(id: string, schema: ComponentConfigSchema, component: React.ComponentType<any>) {
  registry.set(id, { id, schema, component });
}

export function getComponent(id: string): RegistryEntry | undefined {
  return registry.get(id);
}

export function getAllComponents(): RegistryEntry[] {
  return Array.from(registry.values());
}

export function getComponentsByCategory(category: string): RegistryEntry[] {
  return getAllComponents().filter(c => c.schema.category === category);
}
