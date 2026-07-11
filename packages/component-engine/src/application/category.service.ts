import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { ICategoryRepository } from '../domain/repository-interfaces';
import type { ComponentCategory } from '@forge/component-types';

@Injectable()
export class CategoryService {
  constructor(@Inject('ICategoryRepository') private readonly categoryRepo: ICategoryRepository) {}

  async findAll(): Promise<ComponentCategory[]> {
    return this.categoryRepo.findAll();
  }

  async findById(id: string): Promise<ComponentCategory> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(data: { name: string; slug: string; description?: string; icon?: string; sortOrder?: number; parentId?: string }): Promise<ComponentCategory> {
    return this.categoryRepo.create(data);
  }

  async update(id: string, data: Partial<ComponentCategory>): Promise<ComponentCategory> {
    await this.findById(id);
    return this.categoryRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.categoryRepo.delete(id);
  }
}
