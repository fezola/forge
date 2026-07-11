import React from 'react';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeAvatar } from '../ui/forge-avatar';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeUserAvatarProps extends ForgeComponentConfig {
  sourceField?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  fallback?: string;
  className?: string;
}

export function ForgeUserAvatar({
  size = 'md',
  showStatus = false,
  fallback = 'U',
  className,
  ...forgeConfig
}: ForgeUserAvatarProps) {
  const { data: userData, loading } = useForgeData(forgeConfig, {
    sourceType: 'user.current',
    sourceConfig: {},
  });
  const user = userData as Record<string, unknown> | null;

  if (loading) return <ForgeLoading size={size} />;

  return (
    <ForgeAvatar
      {...forgeConfig}
      src={user?.avatar as string}
      fallback={fallback}
      size={size}
      status={showStatus ? 'online' : undefined}
      className={className}
    />
  );
}
