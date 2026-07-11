import { Injectable, BadRequestException } from '@nestjs/common';
import type { MfaConfig, MfaChallenge } from '@forge/identity-types';
import { MfaMethod, IMfaService } from '@forge/identity-types';
import { v4 as uuid } from 'uuid';
import * as crypto from 'crypto';

@Injectable()
export class MfaService implements IMfaService {
  private challenges = new Map<string, MfaChallenge>();

  async enable(method: MfaMethod, identityId: string, config?: Record<string, unknown>): Promise<MfaConfig> {
    const base = {
      id: uuid(),
      identityId,
      method,
      enabled: true,
      verifiedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    switch (method) {
      case 'authenticator_app': {
        const secret = crypto.randomBytes(20).toString('hex');
        return { ...base, method: 'authenticator_app', secret, qrCodeUri: `otpauth://totp/Forge:${identityId}?secret=${secret}&issuer=Forge` } as MfaConfig;
      }
      case 'passkey':
        return { ...base, method: 'passkey', credentialId: config?.credentialId as string ?? '', publicKey: config?.publicKey as string ?? '' } as MfaConfig;
      case 'email_otp':
        return { ...base, method: 'email_otp', email: config?.email as string ?? '' } as MfaConfig;
      case 'sms_otp':
        return { ...base, method: 'sms_otp', phone: config?.phone as string ?? '' } as MfaConfig;
      case 'recovery_code':
        return { ...base, method: 'recovery_code', codes: this.doGenerateRecoveryCodes() } as MfaConfig;
    }
  }

  async disable(_id: string, _identityId: string): Promise<void> {
    // To be implemented: persist MFA config
  }

  async challenge(identityId: string, method: MfaMethod): Promise<MfaChallenge> {
    const challenge: MfaChallenge = {
      challengeId: uuid(),
      identityId,
      method,
      code: String(Math.floor(100000 + Math.random() * 900000)),
      expiresAt: new Date(Date.now() + 300000).toISOString(),
      attempts: 0,
      maxAttempts: 5,
    };
    this.challenges.set(challenge.challengeId, challenge);
    return challenge;
  }

  async verify(challengeId: string, code: string): Promise<boolean> {
    const challenge = this.challenges.get(challengeId);
    if (!challenge) throw new BadRequestException('Challenge not found');
    if (new Date(challenge.expiresAt) < new Date()) {
      this.challenges.delete(challengeId);
      throw new BadRequestException('Challenge expired');
    }
    challenge.attempts++;
    if (challenge.attempts > challenge.maxAttempts) {
      this.challenges.delete(challengeId);
      throw new BadRequestException('Too many attempts');
    }
    const valid = challenge.code === code;
    if (valid) this.challenges.delete(challengeId);
    return valid;
  }

  async getEnabledMethods(_identityId: string): Promise<MfaConfig[]> {
    return [];
  }

  async isMfaRequired(identityId: string): Promise<boolean> {
    const methods = await this.getEnabledMethods(identityId);
    return methods.length > 0;
  }

  async generateRecoveryCodes(_identityId: string): Promise<string[]> {
    return this.doGenerateRecoveryCodes();
  }

  private doGenerateRecoveryCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      codes.push(crypto.randomBytes(6).toString('hex').toUpperCase());
    }
    return codes;
  }
}