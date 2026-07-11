import { Injectable } from '@nestjs/common';
import { IEncryptionService } from '../domain/encryption.service.interface';
import * as crypto from 'crypto';

@Injectable()
export class Aes256EncryptionService implements IEncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;

  constructor() {
    const secret = process.env.SECRET_ENCRYPTION_KEY;
    if (!secret) {
      throw new Error('SECRET_ENCRYPTION_KEY environment variable is required');
    }
    this.key = crypto.scryptSync(secret, 'forge-salt', 32);
  }

  async encrypt(plaintext: string): Promise<string> {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
  }

  async decrypt(ciphertext: string): Promise<string> {
    const [ivHex, authTagHex, encrypted] = ciphertext.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async hash(value: string): Promise<string> {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  async verify(value: string, hash: string): Promise<boolean> {
    const computed = await this.hash(value);
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(hash));
  }
}
