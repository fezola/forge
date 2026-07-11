'use client';

import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi } from '../../../lib/marketplace-api';

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [l, s] = await Promise.all([marketplaceApi.list(), marketplaceApi.getStats()]);
      if (Array.isArray(l)) setListings(l);
      if (s && typeof s === 'object') setStats(s);
    } catch { setError('Failed to load marketplace data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = listings.filter(l =>
    !search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.tagline?.toLowerCase().includes(search.toLowerCase()) || l.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="text-muted-foreground mt-1">Discover and manage plugins, connectors, and packages.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Listings</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.totalListings ?? listings.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Installs</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{loading ? '...' : stats?.totalInstalls ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Reviews</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.totalReviews ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Categories</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.topCategories?.length ?? 0}</p>
        </div>
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search listings by name, tagline, or tag..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium">Installs</th>
                <th className="px-4 py-3 font-medium">Featured</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">{l.tagline}</div>
                  </td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{l.category}</span></td>
                  <td className="px-4 py-3 text-xs">{l.type}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      l.status === 'published' ? 'bg-green-100 text-green-700' :
                      l.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      l.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      l.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{l.status}</span>
                  </td>
                  <td className="px-4 py-3">{l.rating ? `${l.rating}/5` : '—'}</td>
                  <td className="px-4 py-3">{l._count?.installations ?? l.installCount}</td>
                  <td className="px-4 py-3">{l.featured ? '⭐' : '—'}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No listings found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
