export type PermissionAction = 'create' | 'read' | 'write' | 'delete' | 'publish' | 'invite' | 'manage' | 'install' | 'export' | '*';

export type PermissionResource =
  | 'project'
  | 'identity'
  | 'organization'
  | 'workflow'
  | 'connector'
  | 'binding'
  | 'component'
  | 'api_key'
  | 'billing'
  | 'storage'
  | 'database'
  | 'setting'
  | 'audit_log';

export type PermissionString = `${PermissionResource}:${PermissionAction}`;

export const ALL_PERMISSIONS = '*:*' as const;

export function parsePermission(perm: string): { resource: string; action: string } | null {
  if (perm === '*:*' || perm === '*') return { resource: '*', action: '*' };
  const parts = perm.split(':');
  if (parts.length !== 2) return null;
  return { resource: parts[0], action: parts[1] };
}

export function hasPermission(userPermissions: string[], requiredPermission: PermissionString): boolean {
  if (userPermissions.includes('*:*') || userPermissions.includes('*')) return true;
  const required = parsePermission(requiredPermission);
  if (!required) return false;
  return userPermissions.some(p => {
    const user = parsePermission(p);
    if (!user) return false;
    if (user.resource === '*' && user.action === '*') return true;
    if (user.resource === '*' && user.action === required.action) return true;
    if (user.resource === required.resource && user.action === '*') return true;
    return user.resource === required.resource && user.action === required.action;
  });
}

export function hasAnyPermission(userPermissions: string[], requiredPermissions: PermissionString[]): boolean {
  return requiredPermissions.some(p => hasPermission(userPermissions, p));
}

export function hasAllPermissions(userPermissions: string[], requiredPermissions: PermissionString[]): boolean {
  return requiredPermissions.every(p => hasPermission(userPermissions, p));
}