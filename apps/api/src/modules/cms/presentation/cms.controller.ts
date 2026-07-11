import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CmsService } from './cms.service';

@ApiTags('CMS Collections')
@Controller('api/v1/cms-collections')
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Get()
  async listCollections(@Query('projectId') projectId: string) {
    return this.cmsService.listCollections(projectId);
  }

  @Get('stats')
  async getStats(@Query('projectId') projectId: string) {
    return this.cmsService.getStats(projectId);
  }

  @Get(':id')
  async getCollection(@Param('id') id: string) {
    return this.cmsService.getCollection(id);
  }

  @Post()
  async createCollection(@Body() body: {
    name: string;
    projectId: string;
    sourceTableId?: string;
    forgeApiKey?: string;
    forgeBaseUrl?: string;
    fieldMapping?: any;
  }) {
    return this.cmsService.createCollection(body);
  }

  @Put(':id')
  async updateCollection(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      sourceTableId?: string;
      forgeApiKey?: string;
      forgeBaseUrl?: string;
      fieldMapping?: any;
      itemCount?: number;
    },
  ) {
    return this.cmsService.updateCollection(id, body);
  }

  @Delete(':id')
  async deleteCollection(@Param('id') id: string) {
    await this.cmsService.deleteCollection(id);
    return { success: true };
  }

  @Post(':id/sync')
  async triggerSync(
    @Param('id') collectionId: string,
    @Body() body: { projectId: string },
  ) {
    return this.cmsService.triggerSync(collectionId, body.projectId);
  }

  @Get(':id/syncs')
  async getSyncHistory(
    @Param('id') collectionId: string,
    @Query('status') status?: string,
  ) {
    return this.cmsService.getSyncHistory(collectionId, status);
  }

  @Patch(':id/syncs/:syncId')
  async completeSync(
    @Param('syncId') syncId: string,
    @Body() body: {
      status: 'success' | 'error';
      itemsAdded?: number;
      itemsUpdated?: number;
      itemsRemoved?: number;
      errors?: number;
      errorMessage?: string;
      metadata?: any;
    },
  ) {
    return this.cmsService.completeSync(syncId, body);
  }
}