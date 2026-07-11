import { NodeDefinition, EdgeDefinition } from './node.types';

export interface EditorState {
  workflowId: string;
  graph: {
    nodes: NodeDefinition[];
    edges: EdgeDefinition[];
  };
  selectedNodeId?: string;
  selectedEdgeId?: string;
  isDirty: boolean;
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export interface EditorAction {
  type: 'ADD_NODE' | 'UPDATE_NODE' | 'REMOVE_NODE' | 'ADD_EDGE' | 'UPDATE_EDGE' | 'REMOVE_EDGE' | 'MOVE_NODE' | 'SELECT' | 'UNDO' | 'REDO';
  payload: unknown;
}

export interface DragPayload {
  nodeType: string;
  template?: Record<string, unknown>;
}
