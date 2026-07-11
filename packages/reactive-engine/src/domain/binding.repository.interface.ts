import { BindingEntity } from './binding.entity';

export interface IBindingRepository {
  findById(id: string): Promise<BindingEntity | null>;
  findByProject(projectId: string): Promise<BindingEntity[]>;
  findByComponent(projectId: string, componentId: string): Promise<BindingEntity[]>;
  create(entity: BindingEntity): Promise<BindingEntity>;
  update(entity: BindingEntity): Promise<BindingEntity>;
  delete(id: string): Promise<void>;
}
