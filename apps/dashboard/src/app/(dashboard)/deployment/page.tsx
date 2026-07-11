'use client';

import { useState, useEffect, useCallback } from 'react';
import { deploymentApi } from '../../../lib/deployment-api';

export default function DeploymentPage() {
  const [tab, setTab] = useState<'environments' | 'deployments' | 'domains'>('environments');
  const [environments, setEnvironments] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [envs, deps, doms, st] = await Promise.all([
        deploymentApi.listEnvironments(),
        deploymentApi.listDeployments(),
        deploymentApi.getDomains(),
        deploymentApi.getStats(),
      ]);
      if (Array.isArray(envs)) setEnvironments(envs);
      if (Array.isArray(deps)) setDeployments(deps);
      if (Array.isArray(doms)) setDomains(doms);
      if (st && typeof st === 'object') setStats(st);
    } catch { setError('Failed to load deployment data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { key: 'environments' as const, label: 'Environments', count: environments.length },
    { key: 'deployments' as const, label: 'Deployments', count: deployments.length },
    { key: 'domains' as const, label: 'Domains', count: domains.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Deployment</h1>
        <p className="text-muted-foreground mt-1">Manage environments, deployments, domains, and build configuration.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Environments</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.totalEnvironments ?? environments.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Deployments</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.totalDeployments ?? deployments.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{loading ? '...' : stats?.activeDeployments ?? 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Failed</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">{loading ? '...' : stats?.failedDeployments ?? 0}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
              tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label} <span className="text-xs ml-1">({t.count})</span>
          </button>
        ))}
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && tab === 'environments' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Auto Deploy</th>
                <th className="px-4 py-3 font-medium">Deployments</th>
                <th className="px-4 py-3 font-medium">Domains</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {environments.map(e => (
                <tr key={e.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <div className="font-medium">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      e.type === 'production' ? 'bg-red-100 text-red-700' :
                      e.type === 'staging' ? 'bg-yellow-100 text-yellow-700' :
                      e.type === 'preview' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{e.type}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{e.branch || '—'}</td>
                  <td className="px-4 py-3">{e.autoDeploy ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{e._count?.deployments ?? 0}</td>
                  <td className="px-4 py-3">{e._count?.domains ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      e.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
              {environments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No environments</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'deployments' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Version</th>
                <th className="px-4 py-3 font-medium">Environment</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Branch</th>
                <th className="px-4 py-3 font-medium">Commit</th>
                <th className="px-4 py-3 font-medium">Deployed By</th>
                <th className="px-4 py-3 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {deployments.map(d => (
                <tr key={d.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-mono text-xs">{d.version}</td>
                  <td className="px-4 py-3">{d.environment?.name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      d.status === 'active' ? 'bg-green-100 text-green-700' :
                      d.status === 'building' || d.status === 'deploying' ? 'bg-blue-100 text-blue-700' :
                      d.status === 'failed' ? 'bg-red-100 text-red-700' :
                      d.status === 'rolled_back' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono">{d.branch || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono max-w-[120px] truncate">{d.commitSha?.slice(0, 7) || '—'}</td>
                  <td className="px-4 py-3 text-xs">{d.deployedBy}</td>
                  <td className="px-4 py-3 text-xs">{d.durationMs ? `${(d.durationMs / 1000).toFixed(1)}s` : '—'}</td>
                </tr>
              ))}
              {deployments.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No deployments</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'domains' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Domain</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">SSL</th>
                <th className="px-4 py-3 font-medium">Primary</th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium">Redirect</th>
              </tr>
            </thead>
            <tbody>
              {domains.map(d => (
                <tr key={d.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{d.domain}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      d.status === 'active' ? 'bg-green-100 text-green-700' :
                      d.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{d.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      d.sslStatus === 'issued' ? 'bg-green-100 text-green-700' :
                      d.sslStatus === 'pending' || d.sslStatus === 'issuing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>{d.sslStatus}</span>
                  </td>
                  <td className="px-4 py-3">{d.isPrimary ? '⭐' : '—'}</td>
                  <td className="px-4 py-3">{d.verified ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-xs">{d.redirectTo || '—'}</td>
                </tr>
              ))}
              {domains.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No domains configured</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
