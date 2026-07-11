'use client';

import { useState, useEffect, useCallback } from 'react';
import { enterpriseApi } from '../../../lib/enterprise-api';

export default function EnterprisePage() {
  const [tab, setTab] = useState<'sso' | 'rbac' | 'audit' | 'compliance'>('sso');
  const [ssoProviders, setSsoProviders] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [auditEvents, setAuditEvents] = useState<any[]>([]);
  const [compliance, setCompliance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setError('');
      const [sso, r, a, c, st] = await Promise.all([
        enterpriseApi.listSso(),
        enterpriseApi.listRoles(),
        enterpriseApi.listAudit({ limit: 100 }),
        enterpriseApi.listCompliance(),
        enterpriseApi.getStats(),
      ]);
      if (Array.isArray(sso)) setSsoProviders(sso);
      if (Array.isArray(r)) setRoles(r);
      if (a?.events && Array.isArray(a.events)) setAuditEvents(a.events);
      if (Array.isArray(c)) setCompliance(c);
      if (st && typeof st === 'object') setStats(st);
    } catch { setError('Failed to load enterprise data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const tabs = [
    { key: 'sso' as const, label: 'SSO Providers', count: ssoProviders.length },
    { key: 'rbac' as const, label: 'Roles & Permissions', count: roles.length },
    { key: 'audit' as const, label: 'Audit Trail', count: auditEvents.length },
    { key: 'compliance' as const, label: 'Compliance', count: compliance.length },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Enterprise</h1>
        <p className="text-muted-foreground mt-1">SSO, RBAC, audit trails, compliance, and enterprise settings.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">SSO Providers</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.ssoProviders ?? ssoProviders.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Roles</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.roles ?? roles.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Audit Events</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.auditEvents ?? auditEvents.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Compliance Reports</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{loading ? '...' : stats?.complianceReports ?? compliance.length}</p>
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

      {!loading && !error && tab === 'sso' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Provider</th>
                <th className="px-4 py-3 font-medium">Enabled</th>
                <th className="px-4 py-3 font-medium">Auto-Provision</th>
                <th className="px-4 py-3 font-medium">Domains</th>
                <th className="px-4 py-3 font-medium">SAML</th>
                <th className="px-4 py-3 font-medium">OIDC</th>
              </tr>
            </thead>
            <tbody>
              {ssoProviders.map(p => (
                <tr key={p.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">{p.provider}</span>
                  </td>
                  <td className="px-4 py-3">{p.enabled ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{p.autoProvision ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{p._count?.domains ?? 0}</td>
                  <td className="px-4 py-3">{p.samlConfig ? 'Yes' : '—'}</td>
                  <td className="px-4 py-3">{p.oidcConfig ? 'Yes' : '—'}</td>
                </tr>
              ))}
              {ssoProviders.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No SSO providers</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'rbac' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Slug</th>
                <th className="px-4 py-3 font-medium">System</th>
                <th className="px-4 py-3 font-medium">Permissions</th>
                <th className="px-4 py-3 font-medium">Members</th>
              </tr>
            </thead>
            <tbody>
              {roles.map(r => (
                <tr key={r.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-xs font-mono">{r.slug}</td>
                  <td className="px-4 py-3">{r.isSystem ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">{r._count?.permissions ?? 0}</td>
                  <td className="px-4 py-3">{r._count?.members ?? 0}</td>
                </tr>
              ))}
              {roles.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No roles defined</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'audit' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Timestamp</th>
                <th className="px-4 py-3 font-medium">Action</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Severity</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditEvents.map(e => (
                <tr key={e.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 text-xs">{new Date(e.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.action}</td>
                  <td className="px-4 py-3 text-xs">{e.resourceType}{e.resourceName ? `: ${e.resourceName}` : ''}</td>
                  <td className="px-4 py-3 text-xs">{e.actorName || e.actorId.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      e.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      e.severity === 'error' ? 'bg-orange-100 text-orange-700' :
                      e.severity === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>{e.severity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      e.status === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{e.status}</span>
                  </td>
                </tr>
              ))}
              {auditEvents.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No audit events</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && tab === 'compliance' && (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Period</th>
                <th className="px-4 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {compliance.map(c => (
                <tr key={c.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">{c.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      c.status === 'completed' ? 'bg-green-100 text-green-700' :
                      c.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      c.status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">{new Date(c.periodStart).toLocaleDateString()} — {new Date(c.periodEnd).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{c.score != null ? `${c.score}%` : '—'}</td>
                </tr>
              ))}
              {compliance.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No compliance reports</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
