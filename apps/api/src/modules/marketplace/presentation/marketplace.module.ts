import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceFacade } from '../application/marketplace-facade';

@Module({
  controllers: [MarketplaceController],
  providers: [MarketplaceFacade, PrismaClient],
})
export class MarketplaceModule {}
