'use client';

import { useState } from 'react';
import { useProjects, useCreateProject } from '../../../hooks/use-projects';

export default function ProjectsPage() {
  const { data: projects, loading, error, mutate } = useProjects();
  const { create, loading: creating } = useCreateProject();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await create(name.trim(), description.trim() || undefined);
    setName('');
    setDescription('');
    setShowCreate(false);
    mutate();
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your BaaS projects.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {showCreate ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 rounded-lg border p-4">
          <div className="mb-3">
            <label className="text-xs font-medium text-muted-foreground">Project Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="My Project" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" required />
          </div>
          <div className="mb-4">
            <label className="text-xs font-medium text-muted-foreground">Description (optional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project for?" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
            <button type="submit" disabled={creating || !name.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Create</button>
          </div>
        </form>
      )}

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {projects && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {(projects as any[]).map((p: any) => (
                <tr key={p.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.description || p.data?.description || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No projects yet. Create your first one above.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}