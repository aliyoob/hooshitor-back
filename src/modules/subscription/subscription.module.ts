import { Module } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from './entities/subscriptionPlan.entity';
import { UserSubscription } from './entities/user-subscription.entity';
import { Wallet } from 'src/modules/wallet/entities/wallet.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { SubscriptionPlanController } from './subscription.controller';


@Module({
  imports: [TypeOrmModule.forFeature([SubscriptionPlan, UserSubscription, Wallet, UserEntity])],
  controllers: [SubscriptionPlanController],
  providers: [SubscriptionService],
  exports: [SubscriptionService],
})
export class SubscriptionModule { }
