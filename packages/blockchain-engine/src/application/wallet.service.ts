import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IWalletRepository } from '../domain/repository-interfaces';
import type { Wallet, LinkWalletRequest } from '@forge/blockchain-types';

@Injectable()
export class WalletService {
  constructor(@Inject('IWalletRepository') private readonly walletRepo: IWalletRepository) {}

  async findByIdentity(identityId: string): Promise<Wallet[]> {
    return this.walletRepo.findByIdentity(identityId);
  }

  async findById(id: string): Promise<Wallet> {
    const wallet = await this.walletRepo.findById(id);
    if (!wallet) throw new NotFoundException('Wallet not found');
    return wallet;
  }

  async link(input: LinkWalletRequest & { identityId: string }): Promise<Wallet> {
    const existing = await this.walletRepo.findByAddress(input.address, input.chainSlug || 'ethereum');
    if (existing) throw new BadRequestException('Wallet already linked');
    return this.walletRepo.create({
      address: input.address,
      chainSlug: input.chainSlug || 'ethereum',
      identityId: input.identityId,
      label: input.label,
    });
  }

  async setPrimary(id: string, identityId: string): Promise<void> {
    await this.findById(id);
    await this.walletRepo.setPrimary(id, identityId);
  }

  async unlink(id: string, identityId: string): Promise<void> {
    const wallet = await this.findById(id);
    if (wallet.identityId !== identityId) throw new BadRequestException('Wallet does not belong to this identity');
    await this.walletRepo.delete(id);
  }
}
