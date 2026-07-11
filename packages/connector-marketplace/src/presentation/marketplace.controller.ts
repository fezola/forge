import { Controller, Get, Post, Delete, Param, Query, Body } from '@nestjs/common';
import { ConnectorMarketplaceService } from '../application/connector-marketplace.service';

@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplace: ConnectorMarketplaceService) {}

  @Get()
  browse(
    @Query('query') query?: string,
    @Query('category') category?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.marketplace.browse(query, category, page || 1, limit || 20);
  }

  @Get('categories/:category')
  byCategory(@Param('category') category: string) {
    return this.marketplace.getByCategory(category);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.marketplace.getListing(id);
  }

  @Post('publish')
  publish(@Body() input: { manifestId: string; icon?: string }) {
    return this.marketplace.publish(input.manifestId, input.icon);
  }

  @Delete(':id')
  unpublish(@Param('id') id: string) {
    return this.marketplace.unpublish(id);
  }

  @Post(':id/install')
  install(
    @Param('id') id: string,
    @Body() input: { projectId: string; config?: Record<string, unknown> },
  ) {
    return this.marketplace.install(input.projectId, id, input.config);
  }
}
