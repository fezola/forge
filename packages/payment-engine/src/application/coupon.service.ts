import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { ICouponRepository } from '../domain/repository-interfaces';
import type { Coupon } from '@forge/payment-types';

@Injectable()
export class CouponService {
  constructor(@Inject('ICouponRepository') private readonly couponRepo: ICouponRepository) {}

  async findAll(activeOnly?: boolean): Promise<Coupon[]> {
    return this.couponRepo.findAll(activeOnly);
  }

  async findByCode(code: string): Promise<Coupon> {
    const coupon = await this.couponRepo.findByCode(code);
    if (!coupon) throw new NotFoundException('Coupon not found');
    if (!coupon.active || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
      throw new BadRequestException('Coupon expired or inactive');
    }
    if (coupon.maxRedemptions && coupon.currentRedemptions >= coupon.maxRedemptions) {
      throw new BadRequestException('Coupon max redemptions reached');
    }
    return coupon;
  }

  async create(data: { code: string; description?: string; discountPercent?: number; discountAmount?: number; maxRedemptions?: number; expiresAt?: Date }): Promise<Coupon> {
    const existing = await this.couponRepo.findByCode(data.code);
    if (existing) throw new BadRequestException('Coupon code already exists');
    return this.couponRepo.create(data);
  }

  async redeems(code: string): Promise<void> {
    const coupon = await this.findByCode(code);
    await this.couponRepo.incrementRedemptions(coupon.id);
  }
}
