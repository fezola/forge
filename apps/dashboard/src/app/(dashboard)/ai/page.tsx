'use client';

import { useState, useEffect, useCallback } from 'react';
import { aiApi } from '../../../../lib/ai-api';

type Tab = 'models' | 'prompts' | 'completions' | 'agents';

export default function AiPage() {
  const [tab, setTab] = useState<Tab>('models');
  const [search, setSearch] = useState('');

  const [models, setModels] = useState<any[]>([]);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelsError, setModelsError] = useState('');

  const [prompts, setPrompts] = useState<any[]>([]);
  const [promptsLoading, setPromptsLoading] = useState(true);
  const [promptsError, setPromptsError] = useState('');

  const [completions, setCompletions] = useState<any[]>([]);
  const [completionsLoading, setCompletionsLoading] = useState(true);
  const [completionsError, setCompletionsError] = useState('');

  const [agents, setAgents] = useState<any[]>([]);
  const [agentsLoading, setAgentsLoading] = useState(true);
  const [agentsError, setAgentsError] = useState('');

  const fetchModels = useCallback(async () => {
    setModelsLoading(true);
    setModelsError('');
    try {
      const data = await aiApi.getModels();
      setModels(Array.isArray(data) ? data : data?.models ?? []);
    } catch {
      setModelsError('Failed to load models');
    } finally {
      setModelsLoading(false);
    }
  }, []);

  const fetchPrompts = useCallback(async () => {
    setPromptsLoading(true);
    setPromptsError('');
    try {
      const data = await aiApi.getPrompts();
      setPrompts(Array.isArray(data) ? data : data?.prompts ?? []);
    } catch {
      setPromptsError('Failed to load prompts');
    } finally {
      setPromptsLoading(false);
    }
  }, []);

  const fetchCompletions = useCallback(async () => {
    setCompletionsLoading(true);
    setCompletionsError('');
    try {
      const data = await aiApi.getCompletions();
      setCompletions(Array.isArray(data) ? data : data?.completions ?? []);
    } catch {
      setCompletionsError('Failed to load completions');
    } finally {
      setCompletionsLoading(false);
    }
  }, []);

  const fetchAgents = useCallback(async () => {
    setAgentsLoading(true);
    setAgentsError('');
    try {
      const data = await aiApi.getAgents();
      setAgents(Array.isArray(data) ? data : data?.agents ?? []);
    } catch {
      setAgentsError('Failed to load agents');
    } finally {
      setAgentsLoading(false);
    }
  }, []);

  useEffect(() => { fetchModels(); fetchPrompts(); fetchCompletions(); fetchAgents(); }, [fetchModels, fetchPrompts, fetchCompletions, fetchAgents]);

  const filteredModels = models.filter((m: any) =>
    !search ||
    (m.provider ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (m.modelId ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredPrompts = prompts.filter((p: any) =>
    !search ||
    (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.slug ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (p.model ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredCompletions = completions.filter((c: any) =>
    !search ||
    (c.model ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.prompt ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (c.response ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredAgents = agents.filter((a: any) =>
    !search ||
    (a.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.slug ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (a.model ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: string) => {
    const cls =
      status === 'active' ? 'bg-green-100 text-green-700' :
      status === 'inactive' ? 'bg-gray-100 text-gray-700' :
      status === 'error' ? 'bg-red-100 text-red-700' :
      'bg-blue-100 text-blue-700';
    return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{status}</span>;
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'models', label: 'Models' },
    { key: 'prompts', label: 'Prompts' },
    { key: 'completions', label: 'Completions' },
    { key: 'agents', label: 'Agents' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">AI Engine</h1>
        <p className="text-muted-foreground mt-1">Manage AI models, prompts, completions, and agents.</p>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Models</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{modelsLoading ? '...' : models.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Prompts</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{promptsLoading ? '...' : prompts.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Completions</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{completionsLoading ? '...' : completions.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold text-sm text-muted-foreground">Agents</h3>
          <p className="mt-2 text-3xl font-bold text-primary">{agentsLoading ? '...' : agents.length}</p>
        </div>
      </div>

      <div className="mb-4 flex gap-2 border-b">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}...`}
          className="w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>

      {tab === 'models' && (
        <div>
          {modelsLoading && <p className="text-muted-foreground">Loading...</p>}
          {modelsError && <p className="text-red-500">{modelsError}</p>}
          {!modelsLoading && !modelsError && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Provider</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Model ID</th>
                    <th className="px-4 py-3 font-medium">Capabilities</th>
                    <th className="px-4 py-3 font-medium">Context Length</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map((m: any) => (
                    <tr key={m.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">{m.provider}</td>
                      <td className="px-4 py-3 font-medium">{m.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{m.modelId}</td>
                      <td className="px-4 py-3">
                        {Array.isArray(m.capabilities) ? m.capabilities.join(', ') : m.capabilities ?? '—'}
                      </td>
                      <td className="px-4 py-3">{m.contextLength?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-3">{statusBadge(m.status ?? 'active')}</td>
                    </tr>
                  ))}
                  {filteredModels.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No models found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'prompts' && (
        <div>
          {promptsLoading && <p className="text-muted-foreground">Loading...</p>}
          {promptsError && <p className="text-red-500">{promptsError}</p>}
          {!promptsLoading && !promptsError && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Variables</th>
                    <th className="px-4 py-3 font-medium">Tags</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrompts.map((p: any) => (
                    <tr key={p.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.slug}</td>
                      <td className="px-4 py-3">{p.model}</td>
                      <td className="px-4 py-3">{Array.isArray(p.variables) ? p.variables.join(', ') : p.variables ?? '—'}</td>
                      <td className="px-4 py-3">{Array.isArray(p.tags) ? p.tags.join(', ') : p.tags ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredPrompts.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No prompts found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'completions' && (
        <div>
          {completionsLoading && <p className="text-muted-foreground">Loading...</p>}
          {completionsError && <p className="text-red-500">{completionsError}</p>}
          {!completionsLoading && !completionsError && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Prompt</th>
                    <th className="px-4 py-3 font-medium">Response</th>
                    <th className="px-4 py-3 font-medium">Tokens</th>
                    <th className="px-4 py-3 font-medium">Latency</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompletions.map((c: any) => (
                    <tr key={c.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3">{c.model}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{c.prompt}</td>
                      <td className="px-4 py-3 max-w-[200px] truncate text-muted-foreground">{c.response}</td>
                      <td className="px-4 py-3">{c.tokens?.toLocaleString() ?? '—'}</td>
                      <td className="px-4 py-3">{c.latencyMs != null ? `${c.latencyMs}ms` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredCompletions.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No completions found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'agents' && (
        <div>
          {agentsLoading && <p className="text-muted-foreground">Loading...</p>}
          {agentsError && <p className="text-red-500">{agentsError}</p>}
          {!agentsLoading && !agentsError && (
            <div className="rounded-lg border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Slug</th>
                    <th className="px-4 py-3 font-medium">Model</th>
                    <th className="px-4 py-3 font-medium">Tools</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAgents.map((a: any) => (
                    <tr key={a.id} className="border-b text-sm last:border-0 hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{a.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.slug}</td>
                      <td className="px-4 py-3">{a.model}</td>
                      <td className="px-4 py-3">{Array.isArray(a.tools) ? a.tools.join(', ') : a.tools ?? '—'}</td>
                      <td className="px-4 py-3">{statusBadge(a.status ?? 'active')}</td>
                      <td className="px-4 py-3 text-muted-foreground">{a.updatedAt ? new Date(a.updatedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                  {filteredAgents.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No agents found</td></tr>
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
