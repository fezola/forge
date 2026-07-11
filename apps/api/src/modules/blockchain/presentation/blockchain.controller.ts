import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { BlockchainFacade } from '../application/blockchain-facade';

@ApiTags('Blockchain')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('blockchain')
export class BlockchainController {
  constructor(private readonly bc: BlockchainFacade) {}

  // === Chains ===

  @Get('chains')
  async listChains(@Query('enabled') enabled?: string) {
    return this.bc.getChains(enabled === 'true');
  }

  @Get('chains/:id')
  async getChain(@Param('id') id: string) {
    return this.bc.getChain(id);
  }

  @Post('chains')
  async createChain(@Body() data: any) {
    return this.bc.createChain(data);
  }

  @Put('chains/:id')
  async updateChain(@Param('id') id: string, @Body() data: any) {
    return this.bc.updateChain(id, data);
  }

  // === Contracts ===

  @Get('contracts')
  async listContracts(@Query('projectId') projectId?: string) {
    return this.bc.getContracts(projectId);
  }

  @Get('contracts/:id')
  async getContract(@Param('id') id: string) {
    return this.bc.getContract(id);
  }

  @Post('contracts')
  async createContract(@Body() data: any) {
    return this.bc.createContract(data);
  }

  @Put('contracts/:id')
  async updateContract(@Param('id') id: string, @Body() data: any) {
    return this.bc.updateContract(id, data);
  }

  @Delete('contracts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteContract(@Param('id') id: string) {
    await this.bc.deleteContract(id);
  }

  // === Transactions ===

  @Get('transactions')
  async listTransactions(@Query('projectId') projectId?: string, @Query('address') address?: string) {
    return this.bc.getTransactions(projectId, address);
  }

  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string) {
    return this.bc.getTransaction(id);
  }

  // === Wallets ===

  @Get('wallets')
  async listWallets(@Query('identityId') identityId?: string) {
    return this.bc.getWallets(identityId);
  }
}
