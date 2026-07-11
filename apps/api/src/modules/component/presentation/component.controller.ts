import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { ComponentFacade } from '../application/component-facade';

@ApiTags('Components')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('components')
export class ComponentController {
  constructor(private readonly comp: ComponentFacade) {}

  @Get()
  async listComponents(@Query('type') type?: string, @Query('categoryId') categoryId?: string, @Query('status') status?: string) {
    return this.comp.getComponents({ type, categoryId, status });
  }

  @Get('search')
  async search(@Query('q') q: string) {
    return this.comp.searchComponents(q);
  }

  @Get(':id')
  async getComponent(@Param('id') id: string) {
    return this.comp.getComponent(id);
  }

  @Post()
  async createComponent(@Body() data: any) {
    return this.comp.createComponent(data);
  }

  @Put(':id')
  async updateComponent(@Param('id') id: string, @Body() data: any) {
    return this.comp.updateComponent(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteComponent(@Param('id') id: string) {
    await this.comp.deleteComponent(id);
  }

  @Get(':id/versions')
  async getVersions(@Param('id') id: string) {
    return this.comp.getVersions(id);
  }

  @Post(':id/versions')
  async createVersion(@Param('id') id: string, @Body() data: any) {
    return this.comp.createVersion({ ...data, componentId: id });
  }

  @Get('categories')
  async getCategories() {
    return this.comp.getCategories();
  }

  @Post('categories')
  async createCategory(@Body() data: any) {
    return this.comp.createCategory(data);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: any) {
    return this.comp.updateCategory(id, data);
  }

  @Delete('categories/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(@Param('id') id: string) {
    await this.comp.deleteCategory(id);
  }

  @Get('installs')
  async listInstalls(@Query('projectId') projectId?: string) {
    return this.comp.getInstalls(projectId);
  }

  @Post('installs')
  async installComponent(@Body() data: { componentId: string; projectId: string; installedBy: string }) {
    return this.comp.installComponent(data.componentId, data.projectId, data.installedBy);
  }

  @Delete('installs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async uninstallComponent(@Param('id') id: string) {
    await this.comp.uninstallComponent(id);
  }
}
