import { NodeTemplate } from '@forge/workflow-types';

export interface INodeRegistry {
  register(template: NodeTemplate): void;
  registerMany(templates: NodeTemplate[]): void;
  unregister(nodeType: string): void;
  get(nodeType: string): NodeTemplate | undefined;
  getAll(): NodeTemplate[];
  getByCategory(category: string): NodeTemplate[];
  getConnectorNodes(): NodeTemplate[];
}
