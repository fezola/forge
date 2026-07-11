import { Injectable } from '@nestjs/common';

export interface IEncryptionService {
  encrypt(plaintext: string): Promise<string>;
  decrypt(ciphertext: string): Promise<string>;
  hash(value: string): Promise<string>;
  verify(value: string, hash: string): Promise<boolean>;
}
