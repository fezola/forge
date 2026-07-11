'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ConnectorWizard } from '../../../components/connectors/connector-wizard';
import { EndpointList } from '../../../components/connectors/endpoint-list';
import { connectorApi } from '../../../lib/connector-api';
import type { ActionDefinition } from '@forge/types';

const STEPS = [
  { title: 'Info', description: 'Name and description' },
  { title: 'Auth', description: 'Authentication config' },
  { title: 'Base URL', description: 'API base URL' },
  { title: 'Endpoints', description: 'Add API endpoints' },
  { title: 'Mapping', description: 'Response mappings' },
];

export default function CustomConnectorPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [authType, setAuthType] = useState('none');
  const [authFields, setAuthFields] = useState<Record<string, string>>({});
  const [baseUrl, setBaseUrl] = useState('');
  const [endpoints, setEndpoints] = useState<ActionDefinition[]>([]);
  const [mappings, setMappings] = useState<{ fieldName: string; jsonPath: string; type: string }[]>([]);

  const [mappingFieldName, setMappingFieldName] = useState('');
  const [mappingJsonPath, setMappingJsonPath] = useState('');
  const [mappingType, setMappingType] = useState('string');

  const [testResult, setTestResult] = useState<string | null>(null);

  const handleAddEndpoint = (ep: { name: string; method: string; path: string }) => {
    const newEndpoint: ActionDefinition = {
      id: `temp_${Date.now()}`,
      connectorId: '',
      name: ep.name,
      description: '',
      method: ep.method as ActionDefinition['method'],
      path: ep.path,
      input: [],
      output: [],
    };
    setEndpoints((prev) => [...prev, newEndpoint]);
  };

  const handleRemoveEndpoint = (id: string) => {
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddMapping = () => {
    if (!mappingFieldName.trim() || !mappingJsonPath.trim()) return;
    setMappings((prev) => [
      ...prev,
      { fieldName: mappingFieldName.trim(), jsonPath: mappingJsonPath.trim(), type: mappingType },
    ]);
    setMappingFieldName('');
    setMappingJsonPath('');
    setMappingType('string');
  };

  const handleRemoveMapping = (index: number) => {
    setMappings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTest = async () => {
    try {
      const res = await connectorApi.testEndpoint({
        baseUrl,
        endpoints: endpoints.map((e) => ({ method: e.method, path: e.path })),
      });
      setTestResult(JSON.stringify(res, null, 2));
    } catch {
      setTestResult('Test failed');
    }
  };

  const handleFinish = async () => {
    try {
      await connectorApi.createCustom({
        name,
        description,
        auth: { type: authType, ...authFields },
        baseUrl,
        endpoints: endpoints.map((e) => ({
          name: e.name,
          method: e.method,
          path: e.path,
        })),
        responseMappings: mappings,
        projectId: 'proj_1',
      });
      router.push('/connectors');
    } catch {
      // toast error
    }
  };

  const authFieldsForType = (type: string) => {
    switch (type) {
      case 'bearer':
        return [{ key: 'token', label: 'Bearer Token', placeholder: 'sk-...' }];
      case 'api-key':
        return [
          { key: 'key', label: 'API Key', placeholder: 'Your API key' },
          { key: 'headerName', label: 'Header Name', placeholder: 'X-API-Key' },
        ];
      case 'basic':
        return [
          { key: 'username', label: 'Username', placeholder: 'user' },
          { key: 'password', label: 'Password', placeholder: '••••••••' },
        ];
      case 'oauth2':
        return [
          { key: 'clientId', label: 'Client ID', placeholder: 'client-id' },
          { key: 'clientSecret', label: 'Client Secret', placeholder: '••••••••' },
          { key: 'tokenUrl', label: 'Token URL', placeholder: 'https://...' },
        ];
      default:
        return [];
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="rounded-md border p-1.5 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Custom Connector</h1>
          <p className="text-sm text-muted-foreground">Build a custom API connector</p>
        </div>
      </div>

      <ConnectorWizard
        steps={STEPS}
        currentStep={step}
        onNext={() => setStep((s) => Math.min(s + 1, STEPS.length - 1))}
        onBack={() => setStep((s) => Math.max(s - 1, 0))}
        onFinish={handleFinish}
        isLastStep={step === STEPS.length - 1}
      >
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Connector"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this connector does..."
                rows={4}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">Select the authentication method for your API.</p>
            <div className="flex flex-wrap gap-3">
              {[
                { value: 'none', label: 'None' },
                { value: 'bearer', label: 'Bearer Token' },
                { value: 'api-key', label: 'API Key' },
                { value: 'basic', label: 'Basic Auth' },
                { value: 'oauth2', label: 'OAuth2' },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    authType === opt.value
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-muted'
                  }`}
                >
                  <input
                    type="radio"
                    name="authType"
                    value={opt.value}
                    checked={authType === opt.value}
                    onChange={(e) => setAuthType(e.target.value)}
                    className="accent-primary"
                  />
                  {opt.label}
                </label>
              ))}
            </div>

            {authType !== 'none' && (
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                {authFieldsForType(authType).map((field) => (
                  <div key={field.key}>
                    <label className="mb-1 block text-sm font-medium">{field.label}</label>
                    <input
                      type="text"
                      value={authFields[field.key] ?? ''}
                      onChange={(e) =>
                        setAuthFields((prev) => ({ ...prev, [field.key]: e.target.value }))
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium">Base URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                onClick={handleTest}
                className="rounded-md border px-4 py-1.5 text-sm transition-colors hover:bg-muted"
              >
                Test Endpoint
              </button>
              {testResult && (
                <pre className="max-h-32 overflow-auto rounded bg-muted p-2 text-xs">
                  {testResult}
                </pre>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <EndpointList
            endpoints={endpoints}
            onAdd={handleAddEndpoint}
            onRemove={handleRemoveEndpoint}
          />
        )}

        {step === 4 && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-muted/30 p-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Field Name</label>
                <input
                  type="text"
                  value={mappingFieldName}
                  onChange={(e) => setMappingFieldName(e.target.value)}
                  placeholder="e.g. userEmail"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-muted-foreground">JSON Path</label>
                <input
                  type="text"
                  value={mappingJsonPath}
                  onChange={(e) => setMappingJsonPath(e.target.value)}
                  placeholder="e.g. $.data.email"
                  className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Type</label>
                <select
                  value={mappingType}
                  onChange={(e) => setMappingType(e.target.value)}
                  className="rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="string">string</option>
                  <option value="number">number</option>
                  <option value="boolean">boolean</option>
                  <option value="json">json</option>
                </select>
              </div>
              <button
                onClick={handleAddMapping}
                className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Add
              </button>
            </div>

            {mappings.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No mappings added yet.</p>
            )}

            <ul className="space-y-2">
              {mappings.map((m, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm"
                >
                  <code className="font-semibold">{m.fieldName}</code>
                  <span className="text-muted-foreground">→</span>
                  <code className="text-muted-foreground">{m.jsonPath}</code>
                  <span className="ml-auto rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {m.type}
                  </span>
                  <button
                    onClick={() => handleRemoveMapping(i)}
                    className="text-xs text-destructive hover:underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </ConnectorWizard>
    </div>
  );
}
