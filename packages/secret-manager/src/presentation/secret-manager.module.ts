import { Module, Global } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { SecretManagerService } from '../application/secret-manager.service';
import { Aes256EncryptionService } from '../infrastructure/aes-256-encryption.service';
import { PrismaSecretRepository } from '../infrastructure/prisma-secret.repository';
import { SecretManagerController } from './secret-manager.controller';

@Global()
@Module({
  providers: [
    SecretManagerService,
    PrismaClient,
    { provide: 'IEncryptionService', useClass: Aes256EncryptionService },
    { provide: 'ISecretRepository', useClass: PrismaSecretRepository },
  ],
  exports: [SecretManagerService],
  controllers: [SecretManagerController],
})
export class SecretManagerModule {}
