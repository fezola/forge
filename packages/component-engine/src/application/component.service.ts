import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IComponentRepository } from '../domain/repository-interfaces';
import type { Component, CreateComponentRequest } from '@forge/component-types';

@Injectable()
export class ComponentService {
  constructor(@Inject('IComponentRepository') private readonly componentRepo: IComponentRepository) {}

  async findAll(filters?: { type?: string; categoryId?: string; status?: string; isPublic?: boolean }): Promise<Component[]> {
    return this.componentRepo.findAll(filters);
  }

  async search(query: string): Promise<Component[]> {
    return this.componentRepo.search(query);
  }

  async findById(id: string): Promise<Component> {
    const component = await this.componentRepo.findById(id);
    if (!component) throw new NotFoundException('Component not found');
    return component;
  }

  async create(data: CreateComponentRequest & { authorId: string; authorName?: string }): Promise<Component> {
    return this.componentRepo.create(data as any);
  }

  async update(id: string, data: Partial<Component>): Promise<Component> {
    await this.findById(id);
    return this.componentRepo.update(id, data);
  }

  async publish(id: string): Promise<void> {
    await this.findById(id);
    await this.componentRepo.publish(id);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.componentRepo.delete(id);
  }
}
