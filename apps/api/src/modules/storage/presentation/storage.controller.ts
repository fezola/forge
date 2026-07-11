import {
  Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { BucketService, FileService, UploadPipelineService } from '@forge/storage-engine';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import type { CreateBucketInput, UpdateBucketInput } from '@forge/storage-types';

@ApiTags('Storage')
@Controller('storage')
export class StorageController {
  constructor(
    private readonly bucketService: BucketService,
    private readonly fileService: FileService,
    private readonly uploadPipeline: UploadPipelineService,
  ) {}

  // ---- Buckets ----

  @Get('buckets')
  async listBuckets(@Query('projectId') projectId: string) {
    return this.bucketService.findByProject(projectId);
  }

  @Get('buckets/:id')
  async getBucket(@Param('id') id: string) {
    return this.bucketService.findById(id);
  }

  @Post('buckets')
  async createBucket(@Body() input: CreateBucketInput, @Query('projectId') projectId: string) {
    return this.bucketService.create(projectId, input, 'system');
  }

  @Put('buckets/:id')
  async updateBucket(@Param('id') id: string, @Body() input: UpdateBucketInput) {
    return this.bucketService.update(id, input, 'system');
  }

  @Delete('buckets/:id')
  async deleteBucket(@Param('id') id: string) {
    return this.bucketService.delete(id, 'system');
  }

  @Get('buckets/:id/stats')
  async getBucketStats(@Param('id') id: string) {
    return this.bucketService.getStats(id);
  }

  // ---- Files ----

  @Get('buckets/:bucketId/files')
  async listFiles(
    @Param('bucketId') bucketId: string,
    @Query('folder') folder?: string,
    @Query('offset') offset?: number,
    @Query('limit') limit?: number,
    @Query('mimeType') mimeType?: string,
    @Query('search') searchQuery?: string,
  ) {
    return this.fileService.list(bucketId, { folder, offset, limit, mimeType, searchQuery });
  }

  @Get('files/:id')
  async getFile(@Param('id') id: string) {
    return this.fileService.findById(id);
  }

  @Delete('files/:id')
  async deleteFile(@Param('id') id: string) {
    return this.fileService.delete(id, 'system');
  }

  @Get('files/:id/versions')
  async getFileVersions(@Param('id') id: string) {
    return this.fileService.getVersions(id);
  }

  @Post('files/:id/restore/:versionId')
  async restoreFileVersion(@Param('id') id: string, @Param('versionId') versionId: string) {
    return this.fileService.restoreVersion(id, versionId, 'system');
  }

  @Post('files/:id/move')
  async moveFile(@Param('id') id: string, @Body('folder') folder: string) {
    return this.fileService.move(id, folder, 'system');
  }

  @Post('files/:id/copy')
  async copyFile(
    @Param('id') id: string,
    @Body('targetBucketId') targetBucketId: string,
    @Body('targetFolder') targetFolder?: string,
  ) {
    return this.fileService.copy(id, targetBucketId, targetFolder, 'system');
  }

  @Get('buckets/:bucketId/folders')
  async listFolders(@Param('bucketId') bucketId: string, @Query('prefix') prefix?: string) {
    return this.fileService.listFolders(bucketId, prefix);
  }

  // ---- Upload ----

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('upload/initiate')
  async initiateUpload(@CurrentUser('id') userId: string, @Body() input: { bucketId: string; fileName: string; mimeType: string; sizeBytes: number; folder?: string; tags?: string[] }) {
    const request = {
      id: crypto.randomUUID(),
      bucketId: input.bucketId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      folder: input.folder,
      tags: input.tags,
      status: 'pending' as const,
      uploadMethod: 'direct' as const,
      createdAt: new Date().toISOString(),
    };
    return this.uploadPipeline.initiateUpload(request);
  }
}