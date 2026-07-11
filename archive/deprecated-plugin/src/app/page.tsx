'use client';

import React, { useEffect, useState } from 'react';
import { PluginProvider, usePlugin } from '../plugin/plugin-provider';
import { ComponentBrowser } from '../plugin/component-browser';
import { PropertyPanel } from '../plugin/property-panel';
import { loadComponentLibrary } from '../lib/component-loader';
import { getComponent } from '../plugin/component-registry';
import { DevTools } from '../plugin/dev-tools';

function PluginContent() {
  const { state, connect, selectComponent } = usePlugin();
  const [componentValues, setComponentValues] = useState<Record<string, unknown>>({});
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [projectInput, setProjectInput] = useState('');

  useEffect(() => {
    loadComponentLibrary();
  }, []);

  const selectedEntry = state.selectedComponent ? getComponent(state.selectedComponent) : null;

  if (!state.connected) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="text-xl font-bold">Forge Plugin</h1>
          <p className="text-sm text-muted-foreground">Connect your Forge project to start using components.</p>
          <input
            type="text"
            placeholder="API Key"
            className="w-full rounded border bg-background px-3 py-2 text-sm"
            value={apiKeyInput}
            onChange={e => setApiKeyInput(e.target.value)}
          />
          <input
            type="text"
            placeholder="Project ID"
            className="w-full rounded border bg-background px-3 py-2 text-sm"
            value={projectInput}
            onChange={e => setProjectInput(e.target.value)}
          />
          <button
            onClick={() => connect(apiKeyInput, projectInput)}
            className="w-full rounded bg-primary px-4 py-2 text-sm text-white font-medium"
          >
            Connect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-card overflow-y-auto">
        <div className="p-3 border-b">
          <p className="text-xs font-medium text-muted-foreground">COMPONENTS</p>
          <p className="text-xs text-muted-foreground">Drag into your Framer canvas</p>
        </div>
        <ComponentBrowser />
      </div>
      <div className="flex-1 flex">
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedEntry ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{selectedEntry.schema.name}</h2>
              <div className="rounded-lg border bg-card p-6 min-h-[200px] flex items-center justify-center">
                <selectedEntry.component projectId={state.projectId!} apiKey={state.apiKey!} config={componentValues} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p className="text-sm">Select a component from the sidebar to preview it</p>
            </div>
          )}
        </div>
        {selectedEntry && (
          <div className="w-72 border-l bg-card overflow-y-auto">
            <PropertyPanel
              componentId={selectedEntry.id}
              schema={selectedEntry.schema}
              values={componentValues}
              onChange={(prop, value) => setComponentValues(prev => ({ ...prev, [prop]: value }))}
            />
          </div>
        )}
      </div>
      <DevTools />
    </div>
  );
}

export default function PluginPage() {
  return (
    <PluginProvider>
      <PluginContent />
    </PluginProvider>
  );
}
