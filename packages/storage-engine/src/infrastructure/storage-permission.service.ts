import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import type {
  AccessCheckInput, AccessCheckResult, GrantPermissionInput, StoragePermission,
  StoragePermissionAction, StoragePermissionLevel,
} from '@forge/storage-types';
import type { IPermissionService } from '../domain/storage-interfaces';

@Injectable()
export class StoragePermissionService implements IPermissionService {

  // level -> implied actions
  private levelActions: Record<StoragePermissionLevel, StoragePermissionAction[]> = {
    owner: ['bucket:create', 'bucket:read', 'bucket:update', 'bucket:delete', 'bucket:list',
      'file:upload', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:share',
      'file:version:read', 'file:version:restore', 'folder:create', 'folder:read', 'folder:update', 'folder:delete',
      'permission:manage', 'signed_url:generate', 'lifecycle:manage'],
    admin: ['bucket:read', 'bucket:update', 'bucket:list',
      'file:upload', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:share',
      'file:version:read', 'file:version:restore', 'folder:create', 'folder:read', 'folder:update', 'folder:delete',
      'permission:manage', 'signed_url:generate', 'lifecycle:manage'],
    editor: ['bucket:read', 'bucket:list',
      'file:upload', 'file:read', 'file:update', 'file:delete', 'file:download', 'file:share',
      'file:version:read', 'folder:create', 'folder:read', 'folder:update', 'folder:delete', 'signed_url:generate'],
    viewer: ['bucket:read', 'bucket:list',
      'file:read', 'file:download', 'folder:read'],
  };

  constructor(
    @Inject('IStoragePermissionStore')
    private readonly permissionStore: StoragePermissionStore,
  ) {}

  async checkAccess(input: AccessCheckInput): Promise<AccessCheckResult> {
    const { identityId, bucketId, action } = input;

    const permissions = await this.getEffectivePermissions(identityId, bucketId);
    if (permissions.length === 0) {
      return { granted: false, reason: 'No permissions found' };
    }

    const highest = permissions[0];
    const allowedActions = this.levelActions[highest.permissionLevel];
    if (allowedActions.includes(action)) {
      return { granted: true, permissionLevel: highest.permissionLevel };
    }

    for (const perm of permissions) {
      if (perm.grantedActions.includes(action)) {
        return { granted: true, permissionLevel: perm.permissionLevel };
      }
    }

    return { granted: false, permissionLevel: highest.permissionLevel, reason: `Action '${action}' not allowed` };
  }

  async grantPermission(input: GrantPermissionInput, grantedBy: string): Promise<StoragePermission> {
    const permission: StoragePermission = {
      id: uuid(),
      bucketId: input.bucketId,
      identityId: input.identityId,
      organizationId: input.organizationId,
      roleId: input.roleId,
      permissionLevel: input.permissionLevel,
      grantedActions: input.customActions || this.levelActions[input.permissionLevel],
      grantedBy,
      createdAt: new Date().toISOString(),
      expiresAt: input.expiresAt,
    };

    await this.permissionStore.save(permission);
    return permission;
  }

  async revokePermission(id: string): Promise<void> {
    await this.permissionStore.delete(id);
  }

  async listPermissions(bucketId: string): Promise<StoragePermission[]> {
    return this.permissionStore.findByBucket(bucketId);
  }

  async getEffectivePermissions(identityId: string, bucketId: string): Promise<StoragePermission[]> {
    const all = await this.permissionStore.findByBucket(bucketId);
    const now = new Date();

    return all
      .filter((p: StoragePermission) => {
        if (p.expiresAt && new Date(p.expiresAt) < now) return false;
        if (p.identityId && p.identityId === identityId) return true;
        return false;
      })
      .sort((a: StoragePermission, b: StoragePermission) => {
        const order = ['owner', 'admin', 'editor', 'viewer'];
        return order.indexOf(a.permissionLevel) - order.indexOf(b.permissionLevel);
      });
  }
}

export interface StoragePermissionStore {
  save(permission: StoragePermission): Promise<void>;
  delete(id: string): Promise<void>;
  findByBucket(bucketId: string): Promise<StoragePermission[]>;
}