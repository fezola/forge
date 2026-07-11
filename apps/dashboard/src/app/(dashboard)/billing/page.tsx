'use client';

import { useState, useEffect, useCallback } from 'react';
import { billingApi } from '../../../../lib/billing-api';

export default function BillingPage() {
  const [tab, setTab] = useState<'plans' | 'invoices'>('plans');
  const [search, setSearch] = useState('');

  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);
  const [plansError, setPlansError] = useState('');

  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);

  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [invoicesError, setInvoicesError] = useState('');

  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', price: '', interval: 'monthly', description: '' });
  const [saving, setSaving] = useState(false);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansError('');
    try {
      const data = await billingApi.getPlans();
      setPlans(Array.isArray(data) ? data : data?.plans ?? []);
    } catch {
      setPlansError('Failed to load plans');
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchSubscriptions = useCallback(async () => {
    setSubsLoading(true);
    try {
      const data = await billingApi.getSubscriptions();
      setSubscriptions(Array.isArray(data) ? data : data?.subscriptions ?? []);
    } catch {
      setSubscriptions([]);
    } finally {
      setSubsLoading(false);
    }
  }, []);

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError('');
    try {
      const data = await billingApi.getInvoices();
      setInvoices(Array.isArray(data) ? data : data?.invoices ?? []);
    } catch {
      setInvoicesError('Failed to load invoices');
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  useEffect(() => { fetchPlans(); fetchSubscriptions(); }, [fetchPlans, fetchSubscriptions]);
  useEffect(() => { if (tab === 'invoices') fetchInvoices(); }, [tab, fetchInvoices]);

  const totalRevenue = invoices.reduce((sum: number, inv: any) => sum + (inv.amountPaid ?? inv.amount ?? 0), 0);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlan.name.trim() || !newPlan.price.trim()) return;
    setSaving(true);
    try {
      await billingApi.createPlan({
        name: newPlan.name.trim(),
        price: parseFloat(newPlan.price),
        interval: newPlan.interval,
        description: newPlan.description.trim() || undefined,
      });
      setNewPlan({ name: '', price: '', interval: 'monthly', description: '' });
      setShowAddPlan(false);
      fetchPlans();
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (id: string) => {
    try {
      await billingApi.deletePlan(id);
      fetchPlans();
    } catch {
      //
    }
  };

  const filteredInvoices = invoices.filter((inv: any) =>
    !search ||
    String(inv.invoiceNumber ?? inv.id).toLowerCase().includes(search.toLowerCase()) ||
    String(inv.amount ?? '').includes(search) ||
    (inv.status ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const cls =
      status === 'paid' ? 'bg-green-100 text-green-700' :
      status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
      status === 'overdue' ? 'bg-red-100 text-red-700' :
      status === 'canceled' ? 'bg-gray-100 text-gray-700' :
      'bg-blue-100 text-blue-700';
    return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Billing & Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage plans, subscriptions, and invoices.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Plans</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{plansLoading ? '...' : plans.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Active Subscriptions</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">{subsLoading ? '...' : subscriptions.filter((s: any) => s.status === 'active' || !s.status).length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{invoicesLoading ? '...' : `$${totalRevenue.toLocaleString()}`}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b">
        <button onClick={() => setTab('plans')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'plans' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Plans
        </button>
        <button onClick={() => setTab('invoices')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'invoices' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Invoices
        </button>
      </div>

      {tab === 'plans' && (
        <div>
          <div className="mb-4 flex justify-end">
            <button onClick={() => setShowAddPlan(!showAddPlan)} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              {showAddPlan ? 'Cancel' : 'Add Plan'}
            </button>
          </div>

          {showAddPlan && (
            <form onSubmit={handleCreatePlan} className="mb-6 rounded-lg border p-4">
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Name</label>
                  <input value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} placeholder="Pro Plan" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Price</label>
                  <input value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} type="number" step="0.01" placeholder="29.99" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" required />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Interval</label>
                  <select value={newPlan.interval} onChange={e => setNewPlan({ ...newPlan, interval: e.target.value })} className="mt-1 w-full rounded-md border px-3 py-2 text-sm">
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="one-time">One-time</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Description</label>
                  <input value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} placeholder="Optional description..." className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddPlan(false)} className="rounded-lg border px-4 py-2 text-sm hover:bg-muted">Cancel</button>
                <button type="submit" disabled={saving || !newPlan.name.trim() || !newPlan.price.trim()} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving ? 'Saving...' : 'Create Plan'}
                </button>
              </div>
            </form>
          )}

          {plansLoading && <p className="text-muted-foreground">Loading...</p>}
          {plansError && <p className="text-red-500">{plansError}</p>}

          {!plansLoading && !plansError && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan: any) => (
                <div key={plan.id} className="rounded-lg border bg-card p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <p className="mt-1 text-2xl font-bold text-primary">
                        ${plan.price ?? 0}
                        <span className="text-sm font-normal text-muted-foreground">/{plan.interval ?? 'mo'}</span>
                      </p>
                    </div>
                  </div>
                  {plan.description && <p className="mb-3 text-sm text-muted-foreground">{plan.description}</p>}
                  {plan.features && plan.features.length > 0 && (
                    <ul className="mb-4 space-y-1">
                      {plan.features.map((f: any, i: number) => (
                        <li key={f.key ?? i} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500">✓</span>
                          <span className={f.highlight ? 'font-semibold' : ''}>{f.name || f.value}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <button className="rounded-md border px-3 py-1.5 text-xs hover:bg-muted">Edit</button>
                    <button onClick={() => handleDeletePlan(plan.id)} className="rounded-md border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              ))}
              {plans.length === 0 && (
                <div className="col-span-full rounded-lg border p-8 text-center text-muted-foreground">No plans found. Create your first plan above.</div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === 'invoices' && (
        <div>
          <div className="mb-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by invoice #, amount, or status..."
              className="w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>

          {invoicesLoading && <p className="text-muted-foreground">Loading...</p>}
          {invoicesError && <p className="text-red-500">{invoicesError}</p>}

          {!invoicesLoading && !invoicesError && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Invoice #</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Paid At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{inv.invoiceNumber ?? inv.id?.slice(0, 8)}</td>
                      <td className="px-4 py-3">${(inv.amount ?? 0).toLocaleString()}</td>
                      <td className="px-4 py-3">{statusBadge(inv.status ?? 'pending')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredInvoices.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No invoices found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
