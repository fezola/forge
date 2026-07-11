export function deepResolve(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc: unknown, part) => {
    if (acc === null || acc === undefined) return undefined;
    if (typeof acc === 'object') return (acc as Record<string, unknown>)[part];
    return undefined;
  }, obj);
}

export function resolveBindings(
  template: string,
  context: Record<string, unknown>,
  pattern: RegExp = /\{\{([^}]+)\}\}/g,
): string {
  return template.replace(pattern, (_, path) => {
    const value = deepResolve(context, path.trim());
    return value !== undefined ? String(value) : `{{${path}}}`;
  });
}

export function resolveBindingsInObject(
  obj: Record<string, unknown>,
  context: Record<string, unknown>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = resolveBindings(value, context);
    } else if (typeof value === 'object' && value !== null) {
      result[key] = resolveBindingsInObject(value as Record<string, unknown>, context);
    } else {
      result[key] = value;
    }
  }
  return result;
}
