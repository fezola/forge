import { Injectable } from '@nestjs/common';
import { INodeRegistry } from '../domain/node-registry.interface';
import { NodeTemplate } from '@forge/workflow-types';

@Injectable()
export class NodeRegistryService implements INodeRegistry {
  private nodes: Map<string, NodeTemplate> = new Map();

  register(template: NodeTemplate): void {
    this.nodes.set(template.type, template);
  }

  registerMany(templates: NodeTemplate[]): void {
    for (const t of templates) {
      this.nodes.set(t.type, t);
    }
  }

  unregister(nodeType: string): void {
    this.nodes.delete(nodeType);
  }

  get(nodeType: string): NodeTemplate | undefined {
    return this.nodes.get(nodeType);
  }

  getAll(): NodeTemplate[] {
    return Array.from(this.nodes.values());
  }

  getByCategory(category: string): NodeTemplate[] {
    return this.getAll().filter(n => n.category === category);
  }

  getConnectorNodes(): NodeTemplate[] {
    return this.getAll().filter(n => n.category === 'connectors');
  }
}
