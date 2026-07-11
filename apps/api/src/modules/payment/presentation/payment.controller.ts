import {
  Controller, Get, Post, Put, Delete,
  Param, Body, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { PaymentFacade } from '../application/payment-facade';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AddFeatureDto } from './dto/add-feature.dto';

@ApiTags('Payment')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment')
export class PaymentController {
  constructor(private readonly payment: PaymentFacade) {}

  // === Plans ===

  @Get('plans')
  async listPlans(@Query('publicOnly') publicOnly?: string) {
    if (publicOnly === 'true') return this.payment.getPublicPlans();
    return this.payment.getPlans();
  }

  @Get('plans/:id')
  async getPlan(@Param('id') id: string) {
    return this.payment.getPlan(id);
  }

  @Post('plans')
  async createPlan(@Body() dto: CreatePlanDto) {
    return this.payment.createPlan(dto);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
    return this.payment.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePlan(@Param('id') id: string) {
    await this.payment.deletePlan(id);
  }

  // === Plan Features ===

  @Post('plans/:planId/features')
  async addFeature(@Param('planId') planId: string, @Body() dto: AddFeatureDto) {
    return this.payment.addFeature(planId, dto);
  }

  @Delete('features/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFeature(@Param('id') id: string) {
    await this.payment.removeFeature(id);
  }

  // === Subscriptions ===

  @Get('subscriptions')
  async listSubscriptions(@Query('projectId') projectId?: string) {
    return this.payment.getSubscriptions(projectId);
  }

  @Get('subscriptions/:id')
  async getSubscription(@Param('id') id: string) {
    return this.payment.getSubscription(id);
  }

  // === Invoices ===

  @Get('invoices')
  async listInvoices(@Query('projectId') projectId?: string) {
    return this.payment.getInvoices(projectId);
  }

  @Get('invoices/:id')
  async getInvoice(@Param('id') id: string) {
    return this.payment.getInvoice(id);
  }
}
