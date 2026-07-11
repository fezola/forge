import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { MarketplaceFacade } from '../application/marketplace-facade';

@ApiTags('Marketplace')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly mp: MarketplaceFacade) {}

  @Get('stats')
  async getStats() {
    return this.mp.getStats();
  }

  @Get('listings')
  async listListings(@Query('category') category?: string, @Query('type') type?: string, @Query('status') status?: string, @Query('featured') featured?: string) {
    return this.mp.getListings({ category, type, status, featured: featured === 'true' ? true : undefined });
  }

  @Get('listings/search')
  async search(@Query('q') q: string) {
    return this.mp.searchListings(q);
  }

  @Get('listings/:id')
  async getListing(@Param('id') id: string) {
    return this.mp.getListing(id);
  }

  @Post('listings')
  async createListing(@Body() data: any) {
    return this.mp.createListing(data);
  }

  @Put('listings/:id')
  async updateListing(@Param('id') id: string, @Body() data: any) {
    return this.mp.updateListing(id, data);
  }

  @Delete('listings/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteListing(@Param('id') id: string) {
    await this.mp.deleteListing(id);
  }

  @Get('listings/:id/versions')
  async getVersions(@Param('id') id: string) {
    return this.mp.getVersions(id);
  }

  @Post('listings/:id/versions')
  async createVersion(@Param('id') id: string, @Body() data: any) {
    return this.mp.createVersion({ ...data, listingId: id });
  }

  @Get('listings/:id/reviews')
  async getReviews(@Param('id') id: string) {
    return this.mp.getReviews(id);
  }

  @Get('installs')
  async listInstalls(@Query('projectId') projectId?: string) {
    return this.mp.getInstalls(projectId);
  }
}
