import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { IEncryptionService, EncryptedData } from '../domain/encryption-service.interface';

const ALGORITHM = 'aes-256-gcm';
const KEY_VERSION = 1;
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

@Injectable()
export class EncryptionService implements IEncryptionService {
  private currentKey: Buffer;

  constructor() {
    // In production, the master key would come from a key management system
    // or environment variable (not hardcoded).
    const keyHex = process.env.FORGE_ENCRYPTION_KEY || crypto.randomBytes(KEY_LENGTH).toString('hex');
    this.currentKey = Buffer.from(keyHex, 'hex');
  }

  async encrypt(plaintext: string): Promise<EncryptedData> {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, this.currentKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag,
      algorithm: ALGORITHM,
      keyVersion: KEY_VERSION,
    };
  }

  async decrypt(data: EncryptedData): Promise<string> {
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      this.currentKey,
      Buffer.from(data.iv, 'hex'),
    );

    if (data.authTag) {
      decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
    }

    let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async rotateKey(): Promise<void> {
    this.currentKey = crypto.randomBytes(KEY_LENGTH);
    // In production, re-encrypt all secrets with the new key.
    // This is intentionally left as a stub for now.
  }

  async getCurrentKeyVersion(): Promise<number> {
    return KEY_VERSION;
  }
}