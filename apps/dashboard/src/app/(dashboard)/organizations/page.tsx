'use client';

import { useState } from 'react';
import { useOrganizations, useCreateOrganization } from '../../../hooks/use-organizations';

export default function OrganizationsPage() {
  const { data: orgs, loading, error, mutate } = useOrganizations();
  const { create, loading: creating } = useCreateOrganization();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    await create(name.trim(), slug.trim());
    setName('');
    setSlug('');
    setShowCreate(false);
    mutate();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground mt-1">Manage organizations, teams, and member roles.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {showCreate ? 'Cancel' : 'New Organization'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border p-4">
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground">Organization Name</label>
            <input value={name} onChange={e => { setName(e.target.value); setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} placeholder="My Org" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" required />
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground">Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} placeholder="my-org" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" required />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={creating || !name.trim() || !slug.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Create</button>
          </div>
        </form>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {orgs && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Members</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(orgs as any[]).map((o: any) => (
                <tr key={o.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{o.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{o.slug}</td>
                  <td className="px-4 py-3">{o.memberCount ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.ownerId?.slice(0, 8) || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No organizations yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}