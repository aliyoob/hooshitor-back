import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { SubscriptionPlan } from './entities/subscriptionPlan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Wallet } from 'src/modules/wallet/entities/wallet.entity';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
    @InjectRepository(SubscriptionPlan) private planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription) private subRepo: Repository<UserSubscription>,
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) { }

  // ✅ فعال‌سازی اشتراک خاص برای کاربر
  async activateSubscription(mobile: string, planId: number): Promise<void> {
    const user = await this.userRepo.findOne({ where: { mobile } });
    if (!user) throw new NotFoundException('User not found');

    const plan = await this.planRepo.findOne({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Subscription plan not found');

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + plan.durationInDays);

    // پایان اشتراک قبلی در صورت وجود
    const existing = await this.subRepo.findOne({
      where: { user },
      order: { endDate: 'DESC' },
    });

    if (existing && existing.endDate > now) {
      existing.endDate = now;
      await this.subRepo.save(existing);
    }

    const newSub = this.subRepo.create({
      user,
      plan,
      startDate: now,
      endDate,
      lastCreditGivenDate: new Date(0), // اعتبار هنوز داده نشده
    });

    await this.subRepo.save(newSub);

    // شارژ کیف پول برای روز اول
    const wallet = await this.walletRepo.findOne({ where: { user: { mobile } }, relations: ['user'] });
    if (wallet) {
      wallet.balance = plan.dailyCredit;
      wallet.updated_at = now;
      await this.walletRepo.save(wallet);
    }
  }

  // ✅ فعال‌سازی خودکار پلن رایگان
  async activateFreePlanForUser(user: UserEntity): Promise<void> {
    const plan = await this.planRepo.findOne({ where: { name: 'free' } });
    if (!plan) return;

    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + plan.durationInDays);

    const sub = this.subRepo.create({
      user,
      plan,
      startDate: now,
      endDate,
      lastCreditGivenDate: new Date(0),
    });
    await this.subRepo.save(sub);

    const wallet = await this.walletRepo.findOne({ where: { user: { mobile: user.mobile } }, relations: ['user'] });
    if (wallet) {
      wallet.balance = plan.dailyCredit;
      wallet.updated_at = now;
      await this.walletRepo.save(wallet);
    }
  }

  // ✅ کران‌جاب روزانه برای شارژ اعتبار
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async giveDailyCredits(): Promise<void> {
    const now = new Date();
    const today = now.toDateString();
    const users = await this.userRepo.find();

    for (const user of users) {
      const subs = await this.subRepo.find({
        where: {
          user: { id: user.id },
          startDate: LessThanOrEqual(now),
          endDate: MoreThanOrEqual(now),
        },
        relations: ['user', 'plan'],
      });

      if (subs.length === 0) {
        await this.activateFreePlanForUser(user);
        continue;
      }

      const sub = subs.sort((a, b) => b.plan.price - a.plan.price)[0]; // انتخاب پلن گران‌تر
      console.log(`Processing user: ${user.mobile}, Subscription Plan: ${sub.plan.name}`);

      // بررسی اینکه آیا اعتبار امروز داده شده است یا خیر
      const alreadyGiven = sub.lastCreditGivenDate?.toDateString() === today;
      if (alreadyGiven) continue;

      const wallet = await this.walletRepo.findOne({ where: { user: { id: user.id } }, relations: ['user'] });
      if (wallet) {
        wallet.balance = sub.plan.dailyCredit;
        wallet.updated_at = now;
        await this.walletRepo.save(wallet);

        sub.lastCreditGivenDate = now;
        await this.subRepo.save(sub);
      }
    }
  }



}
