import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../subscription/entities/subscriptionPlan.entity';
import { Repository } from 'typeorm';
import { ZibalService } from '../zibal/zibal.service';
import { SubscriptionService } from '../subscription/subscription.service';
import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(SubscriptionPlan) private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    private readonly zibalService: ZibalService,
    private readonly subscriptionService: SubscriptionService,
  ) { }

  async createPurchase(mobile: string, planId: number) {
    const user = await this.userRepo.findOne({ where: { mobile } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');

    const payment = await this.zibalService.createPayment(user.mobile, plan.price, planId);

    return {
      payLink: payment.payLink,
      trackId: payment.trackId,
    };
  }

  async verifyAndActivate(trackId: string, mobile: string, planId: number): Promise<{ success: boolean }> {
    const verifyResult = await this.zibalService.verifyPayment(trackId);

    if (verifyResult.success) {
      await this.subscriptionService.activateSubscription(mobile, planId);
      return { success: true };
    }

    return { success: false };
  }
}
