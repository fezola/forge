export const IEncryptionService = Symbol('IEncryptionService');

export interface EncryptedData {
  encrypted: string;
  iv: string;
  authTag?: string;
  algorithm: string;
  keyVersion: number;
}

export interface IEncryptionService {
  encrypt(plaintext: string): Promise<EncryptedData>;
  decrypt(data: EncryptedData): Promise<string>;
  rotateKey(): Promise<void>;
  getCurrentKeyVersion(): Promise<number>;
}