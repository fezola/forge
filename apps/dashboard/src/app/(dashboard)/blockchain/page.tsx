'use client';

import { useState, useEffect, useCallback } from 'react';
import { blockchainApi } from '../../../lib/blockchain-api';

export default function BlockchainPage() {
  const [chains, setChains] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'chains' | 'contracts' | 'transactions'>('chains');
  const [search, setSearch] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [c, ct, tx] = await Promise.all([
        blockchainApi.getChains(),
        blockchainApi.getContracts(),
        blockchainApi.getTransactions(),
      ]);
      if (Array.isArray(c)) setChains(c);
      if (Array.isArray(ct)) setContracts(ct);
      if (Array.isArray(tx)) setTransactions(tx);
    } catch {
      setError('Failed to load blockchain data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredContracts = contracts.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.address?.toLowerCase().includes(search.toLowerCase())
  );
  const filteredTx = transactions.filter(tx =>
    !search || tx.hash?.toLowerCase().includes(search.toLowerCase()) || tx.fromAddress?.toLowerCase().includes(search.toLowerCase())
  );

  const totalChains = chains.length;
  const enabledChains = chains.filter(c => c.enabled).length;
  const totalContracts = contracts.length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Blockchain</h1>
        <p className="text-muted-foreground mt-1">Manage blockchain networks, smart contracts, and transactions.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Networks</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : totalChains}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Enabled</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{loading ? '...' : enabledChains}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Contracts</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : totalContracts}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        {(['chains', 'contracts', 'transactions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted hover:bg-muted/80'}`}
          >{t.charAt(0).toUpperCase() + t.slice(1)}</button>
        ))}
      </div>

      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && tab === 'chains' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Chain ID</th>
                <th className="px-4 py-3 font-medium">Network</th>
                <th className="px-4 py-3 font-medium">Symbol</th>
                <th className="px-4 py-3 font-medium">RPC URL</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {chains.map(c => (
                <tr key={c.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.chainId}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{c.network}</span></td>
                  <td className="px-4 py-3">{c.symbol}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground max-w-[200px] truncate">{c.rpcUrl || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </td>
                </tr>
              ))}
              {chains.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No chains configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'contracts' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Address</th>
                <th className="px-4 py-3 font-medium">Chain</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Deployed</th>
              </tr>
            </thead>
            <tbody>
              {filteredContracts.map(c => (
                <tr key={c.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{c.type}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.address.slice(0, 20)}...</td>
                  <td className="px-4 py-3">{c.chain?.name || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${c.verified ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {c.verified ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.deployedAt ? new Date(c.deployedAt).toLocaleDateString() : '—'}</td>
                </tr>
              ))}
              {filteredContracts.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No contracts found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'transactions' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Hash</th>
                <th className="px-4 py-3 font-medium">From</th>
                <th className="px-4 py-3 font-medium">To</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Block</th>
              </tr>
            </thead>
            <tbody>
              {filteredTx.map(tx => (
                <tr key={tx.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.hash.slice(0, 16)}...</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.fromAddress.slice(0, 12)}...</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.toAddress.slice(0, 12)}...</td>
                  <td className="px-4 py-3">{tx.value ? `${(Number(tx.value) / 1e18).toFixed(4)} ETH` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      tx.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{tx.status}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tx.blockNumber ?? '—'}</td>
                </tr>
              ))}
              {filteredTx.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No transactions found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
