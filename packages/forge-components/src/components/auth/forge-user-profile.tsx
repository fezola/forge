import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeAvatar } from '../ui/forge-avatar';
import { ForgeLoading } from '../ui/forge-loading';
import { ForgeCard } from '../ui/forge-card';

export interface ForgeUserProfileProps extends ForgeComponentConfig {
  showAvatar?: boolean;
  showName?: boolean;
  showEmail?: boolean;
  layout?: 'row' | 'column';
  variant?: 'default' | 'card' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ForgeUserProfile({
  showAvatar = true,
  showName = true,
  showEmail = true,
  layout = 'row',
  variant = 'default',
  size = 'md',
  className,
  ...forgeConfig
}: ForgeUserProfileProps) {
  const { data: userData, loading } = useForgeData(forgeConfig, {
    sourceType: 'user.current',
    sourceConfig: {},
  });

  const user = userData as Record<string, unknown> | null;

  if (loading) return <ForgeLoading {...forgeConfig} />;

  const avatarSizes = { sm: 'sm', md: 'md', lg: 'lg' } as const;
  const nameSizes = { sm: 'text-sm', md: 'text-base', lg: 'text-lg' };

  const content = (
    <div className={cn('flex items-center gap-3', layout === 'column' && 'flex-col text-center', className)}>
      {showAvatar && (
        <ForgeAvatar
          {...forgeConfig}
          src={user?.avatar as string}
          fallback={(user?.name as string) || (user?.email as string) || 'U'}
          size={avatarSizes[size]}
        />
      )}
      <div className={cn(layout === 'column' ? 'text-center' : '', 'min-w-0')}>
        {showName && (
          <p className={cn(nameSizes[size], 'font-medium truncate')}>
            {(user?.name as string) || (user?.displayName as string) || 'User'}
          </p>
        )}
        {showEmail && (
          <p className="text-sm text-muted-foreground truncate">
            {(user?.email as string) || ''}
          </p>
        )}
      </div>
    </div>
  );

  if (variant === 'card') return <ForgeCard {...forgeConfig}>{content}</ForgeCard>;
  return content;
}
