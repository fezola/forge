'use client';

import { useState, useEffect, useCallback } from 'react';
import { componentApi } from '../../../lib/component-api';

export default function ComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [installs, setInstalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'components' | 'categories' | 'installs'>('components');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [c, cats, inst] = await Promise.all([
        componentApi.list(), componentApi.getCategories(), componentApi.getInstalls(),
      ]);
      if (Array.isArray(c)) setComponents(c);
      if (Array.isArray(cats)) setCategories(cats);
      if (Array.isArray(inst)) setInstalls(inst);
    } catch { setError('Failed to load component data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = components.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.slug?.toLowerCase().includes(search.toLowerCase()) || c.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Component Registry</h1>
        <p className="text-muted-foreground mt-1">Manage the component library, categories, and project installations.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Components</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : components.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Categories</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{loading ? '...' : categories.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Installations</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : installs.length}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(['components', 'categories', 'installs'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, slug, or tag..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && tab === 'components' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Versions</th>
                <th className="px-4 py-3 font-medium">Installs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{c.type}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.category?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === 'published' ? 'bg-green-100 text-green-700' :
                      c.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                      c.status === 'deprecated' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3">{c._count?.versions ?? 0}</td>
                  <td className="px-4 py-3">{c._count?.installations ?? 0}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No components found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'categories' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">Icon</th>
                <th className="px-4 py-3 font-medium">Sort Order</th>
                <th className="px-4 py-3 font-medium">Parent</th>
              </tr>
            </thead>
            <tbody>
              {categories.map(cat => (
                <tr key={cat.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                  <td className="px-4 py-3">{cat.icon || '—'}</td>
                  <td className="px-4 py-3">{cat.sortOrder}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cat.parent?.name || '—'}</td>
                </tr>
              ))}
              {categories.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No categories</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'installs' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Component</th>
                <th className="px-4 py-3 font-medium">Project</th>
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Installed</th>
              </tr>
            </thead>
            <tbody>
              {installs.map(inst => (
                <tr key={inst.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{inst.component?.name || inst.componentId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.projectId.slice(0, 12)}...</td>
                  <td className="px-4 py-3 font-mono text-xs">{inst.version}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      inst.status === 'installed' ? 'bg-green-100 text-green-700' :
                      inst.status === 'updating' ? 'bg-yellow-100 text-yellow-700' :
                      inst.status === 'error' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{inst.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inst.installedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {installs.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No installations</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
