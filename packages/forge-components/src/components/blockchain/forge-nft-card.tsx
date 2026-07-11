import React from 'react';
import { cn } from '../../utils/cn';
import { ForgeComponentConfig } from '../../types/component.types';
import { useForgeData } from '../../hooks/use-forge-data';
import { ForgeCard } from '../ui/forge-card';
import { ForgeLoading } from '../ui/forge-loading';

export interface ForgeNftCardProps extends ForgeComponentConfig {
  collectionAddress?: string;
  tokenId?: string;
  className?: string;
}

export function ForgeNftCard({
  collectionAddress,
  tokenId,
  className,
  ...forgeConfig
}: ForgeNftCardProps) {
  const { data, loading } = useForgeData(forgeConfig, {
    sourceType: 'connector.action',
    sourceConfig: { collectionAddress, tokenId },
  });

  if (loading) return <ForgeLoading {...forgeConfig} />;

  const nft = data as Record<string, unknown> | null;

  return (
    <ForgeCard {...forgeConfig} className={cn('overflow-hidden', className)}>
      {!!nft?.image && (
        <img src={nft.image as string} alt={String(nft?.name ?? 'NFT')} className="w-full h-48 object-cover rounded-t-lg" />
      )}
      <div className="p-3 space-y-1">
        <p className="font-semibold">{String(nft?.name ?? 'NFT')}</p>
        {!!nft?.description && <p className="text-sm text-muted-foreground">{String(nft?.description ?? '')}</p>}
        {!!nft?.collection && <p className="text-xs text-muted-foreground">{String(nft?.collection ?? '')}</p>}
      </div>
    </ForgeCard>
  );
}
