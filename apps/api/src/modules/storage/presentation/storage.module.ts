import { Module } from '@nestjs/common';
import { StorageEngineModule } from '@forge/storage-engine';
import { StorageController } from './storage.controller';

@Module({
  imports: [StorageEngineModule],
  controllers: [StorageController],
})
export class StorageModule {}