'use client';

import { useRoles } from '../../../hooks/use-organizations';

export default function RolesPage() {
  const { data: roles, loading } = useRoles();

  const systemRoles = (roles ?? []).filter((r: any) => r.isSystem);
  const customRoles = (roles ?? []).filter((r: any) => !r.isSystem);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Roles &amp; Permissions</h1>
        <p className="text-muted-foreground mt-1">System roles and custom role management.</p>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      <h2 className="mb-3 text-lg font-semibold">System Roles</h2>
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {systemRoles.length > 0 ? systemRoles.map((role: any) => (
          <div key={role.id} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{role.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{role.description || '—'}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {role.permissions?.slice(0, 4).map((p: string) => (
                <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p}</span>
              ))}
              {(role.permissions?.length ?? 0) > 4 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{role.permissions.length - 4} more</span>
              )}
            </div>
            <span className="mt-2 inline-block rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Priority {role.priority}
            </span>
          </div>
        )) : (
          <div className="col-span-full rounded-lg border p-6 text-center text-sm text-muted-foreground">
            Loading system roles...
          </div>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold">Custom Roles</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {customRoles.length > 0 ? customRoles.map((role: any) => (
          <div key={role.id} className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold">{role.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{role.description || 'No description'}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {role.permissions?.slice(0, 4).map((p: string) => (
                <span key={p} className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{p}</span>
              ))}
              {(role.permissions?.length ?? 0) > 4 && (
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">+{role.permissions.length - 4} more</span>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full rounded-lg border p-6 text-center text-sm text-muted-foreground">
            No custom roles defined yet
          </div>
        )}
      </div>
    </div>
  );
}