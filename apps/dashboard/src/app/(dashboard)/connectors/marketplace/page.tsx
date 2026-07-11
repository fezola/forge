'use client';

import { useState } from 'react';
import { Search, Download, Star } from 'lucide-react';
import { useMarketplace } from '../../../hooks/use-connectors';
import { connectorApi } from '../../../lib/connector-api';
import { cn } from '../../../lib/utils';
import type { ConnectorCategory } from '@forge/types';

const categories: { label: string; value: ConnectorCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Payments', value: 'payments' },
  { label: 'Blockchain', value: 'blockchain' },
  { label: 'AI', value: 'ai' },
  { label: 'Email', value: 'email' },
  { label: 'KYC', value: 'kyc' },
  { label: 'Authentication', value: 'authentication' },
  { label: 'Custom', value: 'custom' },
];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 12;

  const categoryParam = category === 'all' ? undefined : category;
  const { data, loading, error, mutate } = useMarketplace(query, categoryParam, page, limit);

  const handleInstall = async (manifestId: string) => {
    try {
      await connectorApi.install('proj_1', manifestId);
      mutate();
    } catch {
      // toast error
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Marketplace</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Discover and install connectors for your projects.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search marketplace..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setCategory(cat.value); setPage(1); }}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              category === cat.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted hover:bg-muted/80',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading listings...</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}

      {data && data.listings.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <Search className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No connectors found.</p>
        </div>
      )}

      {data && data.listings.length > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.listings.map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col rounded-lg border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                    {listing.icon ? (
                      <img
                        src={listing.icon}
                        alt=""
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      listing.name.charAt(0)
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{listing.name}</h3>
                    <p className="text-xs text-muted-foreground">v{listing.version}</p>
                  </div>
                </div>

                <p className="mb-4 line-clamp-2 flex-1 text-xs text-muted-foreground">
                  {listing.description}
                </p>

                <div className="mb-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {listing.downloads}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {listing.rating}
                  </span>
                  <span>{listing.author}</span>
                </div>

                <button
                  onClick={() => handleInstall(listing.manifestId)}
                  className="w-full rounded-md bg-primary py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Install
                </button>
              </div>
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
              >
                Previous
              </button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    p === page
                      ? 'bg-primary text-primary-foreground'
                      : 'border hover:bg-muted',
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                disabled={page >= data.totalPages}
                className="rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
