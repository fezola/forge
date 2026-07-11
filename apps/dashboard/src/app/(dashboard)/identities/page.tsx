'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useIdentities } from '../../../hooks/use-identities';

export default function IdentitiesPage() {
  const { data: identities, loading, error } = useIdentities();
  const [search, setSearch] = useState('');

  const filtered = (identities ?? []).filter((i: any) =>
    !search || i.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    i.primaryEmail?.toLowerCase().includes(search.toLowerCase()) ||
    i.id?.toLowerCase().includes(search.toLowerCase())
  );

  const total = identities?.length ?? 0;
  const active = (identities ?? []).filter((i: any) => i.status === 'active').length;
  const withWallets = (identities ?? []).filter((i: any) => (i.wallets?.length ?? 0) > 0).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Identities</h1>
        <p className="text-muted-foreground mt-1">Manage user identities, linked providers, and wallets.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Users</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : total}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{loading ? '...' : active}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">With Wallets</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : withWallets}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, email, or ID..."
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {identities && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Providers</th>
                <th className="px-4 py-3 font-medium">Wallets</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((i: any) => (
                <tr key={i.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <Link href={`/identities/${i.id}`} className="font-medium text-primary hover:underline">{i.displayName || i.id?.slice(0, 8)}</Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{i.primaryEmail || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      i.status === 'active' ? 'bg-green-100 text-green-700' :
                      i.status === 'disabled' ? 'bg-red-100 text-red-700' :
                      i.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{i.status}</span>
                  </td>
                  <td className="px-4 py-3">{i.providers?.length ?? 0}</td>
                  <td className="px-4 py-3">{i.wallets?.length ?? 0}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.lastLoginAt ? new Date(i.lastLoginAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No identities found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}