import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IWalletRepository } from '@forge/identity-types';
import { Wallet, LinkWalletRequest, EmbeddedWallet } from '@forge/identity-types';
import type { IIdentityRepository } from '../domain/identity.repository.interface';

@Injectable()
export class WalletService {
  constructor(
    @Inject('IWalletRepository')
    private readonly walletRepository: IWalletRepository,
    @Inject('IIdentityRepository')
    private readonly identityRepository: IIdentityRepository,
  ) {}

  async link(request: LinkWalletRequest): Promise<Wallet> {
    const existing = await this.walletRepository.findByAddress(request.address, request.chain);
    if (existing) throw new ConflictException('Wallet already linked to another identity');
    const wallet = await this.walletRepository.link(request);
    const identity = await this.identityRepository.findById(request.identityId);
    if (identity) {
      identity.addWallet(wallet.id);
      await this.identityRepository.updateInternal(request.identityId, {
        wallets: identity.wallets,
      });
    }
    return wallet;
  }

  async unlink(id: string, identityId: string): Promise<void> {
    await this.walletRepository.unlink(id);
    const identity = await this.identityRepository.findById(identityId);
    if (identity) {
      identity.removeWallet(id);
      await this.identityRepository.updateInternal(identityId, {
        wallets: identity.wallets,
      });
    }
  }

  async getByIdentity(identityId: string): Promise<Wallet[]> {
    return this.walletRepository.findByIdentity(identityId);
  }

  async setPrimary(id: string, identityId: string): Promise<void> {
    await this.walletRepository.setPrimary(id, identityId);
  }

  async verify(id: string): Promise<void> {
    await this.walletRepository.verify(id);
  }

  async createEmbedded(_identityId: string, _chain: string): Promise<EmbeddedWallet> {
    throw new Error('Embedded wallet generation not yet implemented');
  }
}