'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground mt-1">Configure global platform settings.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">General</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Platform Name</label>
              <input defaultValue="Forge" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Support Email</label>
              <input defaultValue="support@forge.dev" type="email" className="mt-1 w-full rounded-md border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Base URL</label>
              <input defaultValue="http://localhost:4000" className="mt-1 w-full rounded-md border px-3 py-2 text-sm font-mono" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="mb-4 font-semibold">Security</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Require MFA on all accounts</p>
                <p className="text-xs text-muted-foreground">Force multi-factor authentication for all users</p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Session timeout (minutes)</p>
              </div>
              <input type="number" defaultValue={60} className="w-20 rounded-md border px-2 py-1 text-sm" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          {saved && <span className="rounded bg-green-100 px-3 py-2 text-sm text-green-700">Saved</span>}
          <button type="submit" disabled={saving} className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}