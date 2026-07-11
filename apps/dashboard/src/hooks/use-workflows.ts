'use client';

import { useState, useEffect, useCallback } from 'react';
import { workflowApi } from '../lib/workflow-api';

export function useWorkflows(projectId: string) {
  const [data, setData] = useState<WorkflowSummary[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const res = await workflowApi.list(projectId);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch workflows');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useWorkflow(id: string) {
  const [data, setData] = useState<WorkflowDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await workflowApi.get(id);
      setData(res.data ?? res);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch workflow');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, mutate: fetch };
}

export function useWorkflowExecution(workflowId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (input?: Record<string, unknown>): Promise<WorkflowRunResult> => {
    if (!workflowId) throw new Error('No workflow ID');
    setLoading(true);
    setError(null);
    try {
      const res = await workflowApi.execute(workflowId, input);
      return res.data ?? res;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Execution failed';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  return { execute, loading, error };
}

export interface WorkflowSummary {
  id: string;
  name: string;
  description?: string;
  version: string;
  status: 'draft' | 'published' | 'archived';
  triggerType: string;
  nodeCount: number;
  edgeCount: number;
  lastRun?: string;
  updatedAt: string;
  createdAt: string;
}

export interface WorkflowDefinition extends WorkflowSummary {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  executionHistory?: WorkflowExecution[];
}

export interface WorkflowNode {
  id: string;
  type: string;
  label: string;
  position: { x: number; y: number };
  config: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface WorkflowExecution {
  id: string;
  status: 'success' | 'failed' | 'running' | 'pending';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  trigger?: string;
  logs?: ExecutionLogEntry[];
}

export interface ExecutionLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  nodeId: string;
  message: string;
}

export interface WorkflowRunResult {
  executionId: string;
  status: 'success' | 'failed' | 'running';
  output?: Record<string, unknown>;
  logs?: ExecutionLogEntry[];
}