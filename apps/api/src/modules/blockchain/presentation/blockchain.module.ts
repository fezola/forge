import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { BlockchainController } from './blockchain.controller';
import { BlockchainFacade } from '../application/blockchain-facade';

@Module({
  controllers: [BlockchainController],
  providers: [BlockchainFacade, PrismaClient],
})
export class BlockchainModule {}
