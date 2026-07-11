'use client';

import { useState, useEffect } from 'react';
import { useBrandPage } from '../../../../hooks/use-config-page';
import { configApi } from '../../../../lib/config-api';

const PROJECT_ID = 'default';

export default function BrandingPage() {
  const { brand, loading, mutate } = useBrandPage();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    appName: '',
    primaryColor: '#000000',
    fontFamily: '',
    logoUrl: '',
    companyName: '',
    footerText: '',
  });

  useEffect(() => {
    if (brand) {
      setForm({
        appName: brand.appName || '',
        primaryColor: brand.primaryColor || '#000000',
        fontFamily: brand.fontFamily || '',
        logoUrl: brand.logoUrl || '',
        companyName: brand.companyName || '',
        footerText: brand.footerText || '',
      });
    }
  }, [brand]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await configApi.brand.upsert(PROJECT_ID, {
        appName: form.appName,
        primaryColor: form.primaryColor,
        fontFamily: form.fontFamily,
        logoUrl: form.logoUrl,
        companyName: form.companyName,
        footerText: form.footerText,
      });
      setSaved(true);
      mutate();
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    setSaving(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Branding</h1>
        <p className="text-muted-foreground mt-1">Configure project branding for auth screens, emails, invoices, and the dashboard.</p>
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      <form onSubmit={handleSave}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-medium">Appearance</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">App Name</label>
                <input value={form.appName} onChange={e => setForm(f => ({ ...f, appName: e.target.value }))} placeholder="My App" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Primary Color</label>
                <div className="mt-1 flex gap-2">
                  <input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} type="color" className="h-9 w-9 rounded-md border" />
                  <input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} placeholder="#000000" className="flex-1 rounded-md border px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Font Family</label>
                <input value={form.fontFamily} onChange={e => setForm(f => ({ ...f, fontFamily: e.target.value }))} placeholder="Inter" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-medium">Auth Screen</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Logo URL</label>
                <input value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} placeholder="https://..." className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-3 font-medium">Email</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                <input value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Acme Inc." className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Footer Text</label>
                <input value={form.footerText} onChange={e => setForm(f => ({ ...f, footerText: e.target.value }))} placeholder="© 2024 Acme Inc." className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          {saved && <span className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">Saved</span>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}