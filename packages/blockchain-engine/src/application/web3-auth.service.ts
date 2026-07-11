import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IWeb3AuthRepository } from '../domain/repository-interfaces';
import type { IBlockchainProvider } from '../domain/blockchain-provider.interface';
import type { Web3AuthChallenge, Web3LoginRequest, Web3AuthResult } from '@forge/blockchain-types';
import { v4 as uuid } from 'uuid';

@Injectable()
export class Web3AuthService {
  private readonly logger = new Logger(Web3AuthService.name);

  constructor(
    @Inject('IWeb3AuthRepository') private readonly authRepo: IWeb3AuthRepository,
    @Inject('IBlockchainProvider') private readonly provider: IBlockchainProvider,
  ) {}

  async createChallenge(address: string, chainSlug = 'ethereum', ip?: string, userAgent?: string): Promise<Web3AuthChallenge> {
    const nonce = uuid();
    const message = `Sign this message to authenticate with Forge.\n\nAddress: ${address}\nNonce: ${nonce}\nExpires: ${new Date(Date.now() + 300000).toISOString()}`;
    return this.authRepo.create({
      address,
      chainSlug,
      message,
      nonce,
      expiresAt: new Date(Date.now() + 300000),
      ip,
      userAgent,
    });
  }

  async authenticate(input: Web3LoginRequest): Promise<Web3AuthResult> {
    const challenge = await this.authRepo.findByNonce(input.message.split('Nonce: ')[1]?.split('\n')[0] || '');
    if (!challenge) throw new Error('Invalid challenge');
    if (challenge.completed) throw new Error('Challenge already used');
    if (new Date(challenge.expiresAt) < new Date()) throw new Error('Challenge expired');

    const isValid = await this.provider.verifyMessage(input.message, input.signature, input.address);
    if (!isValid) throw new Error('Invalid signature');

    const identityId = uuid();
    await this.authRepo.complete(challenge.id, input.signature, identityId);

    return { token: uuid(), identityId: identityId, address: input.address };
  }

  async cleanupExpired(): Promise<number> {
    return this.authRepo.cleanupExpired();
  }
}
