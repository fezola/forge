import type { DataFilter } from './query.types';

export type DataPermissionAction = 'create' | 'read' | 'update' | 'delete' | 'all';

export interface TablePermission {
  tableId: string;
  roleId: string;
  actions: DataPermissionAction[];
  fieldRestrictions: FieldRestriction[];
  rowFilter: RowLevelFilter | null;
}

export interface FieldRestriction {
  fieldId: string;
  deniedActions: DataPermissionAction[];
  mask: string | null;
}

export interface RowLevelFilter {
  fieldId: string;
  operator: 'eq' | 'neq' | 'in' | 'contains';
  valueType: 'static' | 'current_user' | 'current_user_field' | 'current_role' | 'expression';
  value: unknown;
}

export interface ColumnPermission {
  tableId: string;
  fieldId: string;
  roleIds: string[];
  readable: boolean;
  writable: boolean;
}

export interface IDataPermissionEngine {
  getTablePermissions(tableId: string, identityId: string, roles: string[]): Promise<TablePermission>;
  canCreate(tableId: string, identityId: string, roles: string[]): Promise<boolean>;
  canRead(tableId: string, recordId: string, identityId: string, roles: string[]): Promise<boolean>;
  canUpdate(tableId: string, recordId: string, identityId: string, roles: string[]): Promise<boolean>;
  canDelete(tableId: string, recordId: string, identityId: string, roles: string[]): Promise<boolean>;
  applyRowFilter(tableId: string, roles: string[], baseFilter?: DataFilter): Promise<DataFilter | null>;
  filterFields(tableId: string, roles: string[], fields: string[]): Promise<string[]>;
  setTablePermissions(tableId: string, roleId: string, actions: DataPermissionAction[]): Promise<void>;
  setRowLevelFilter(tableId: string, roleId: string, filter: RowLevelFilter): Promise<void>;
  setFieldRestriction(tableId: string, fieldId: string, restriction: FieldRestriction): Promise<void>;
}