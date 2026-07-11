'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useIdentity } from '../../../../hooks/use-identities';

export default function IdentityDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: identity, loading } = useIdentity(id);

  if (loading) return <p className="text-muted-foreground">Loading...</p>;
  if (!identity) return <p className="text-red-500">Identity not found</p>;

  return (
    <div>
      <div className="mb-6">
        <Link href="/identities" className="text-sm text-muted-foreground hover:text-primary">&larr; Back to Identities</Link>
        <h1 className="mt-2 text-2xl font-bold">{identity.displayName || identity.id?.slice(0, 8)}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Profile</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-mono text-xs">{identity.id}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Status</span>
              <span className={`rounded-full px-2 py-0.5 text-xs ${
                identity.status === 'active' ? 'bg-green-100 text-green-700' :
                identity.status === 'disabled' ? 'bg-red-100 text-red-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>{identity.status}</span>
            </div>
            <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{identity.primaryEmail || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{identity.primaryPhone || '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Last Login</span><span>{identity.lastLoginAt ? new Date(identity.lastLoginAt).toLocaleString() : '—'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{identity.createdAt ? new Date(identity.createdAt).toLocaleString() : '—'}</span></div>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Linked Providers</h3>
          {identity.providers?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(identity.providers as string[]).map((p: string) => (
                <span key={p} className="rounded-full bg-muted px-2 py-0.5 text-xs">{p}</span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No providers linked</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Wallets</h3>
          {identity.wallets?.length > 0 ? (
            <div className="space-y-2">
              {(identity.wallets as string[]).map((w: string) => (
                <div key={w} className="rounded bg-muted/30 px-2 py-1 font-mono text-xs">{w}</div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No wallets linked</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Organizations</h3>
          {identity.organizations?.length > 0 ? (
            <div className="space-y-1">
              {(identity.organizations as string[]).map((o: string) => (
                <p key={o} className="text-sm">{o}</p>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No organizations</p>
          )}
        </div>
      </div>

      {identity.metadata && Object.keys(identity.metadata).length > 0 && (
        <div className="mt-6 rounded-lg border bg-card p-4">
          <h3 className="mb-3 font-semibold">Metadata</h3>
          <pre className="overflow-auto rounded bg-muted p-3 text-xs">{JSON.stringify(identity.metadata, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}