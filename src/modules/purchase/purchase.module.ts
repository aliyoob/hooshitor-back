import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionPlan } from '../subscription/entities/subscriptionPlan.entity';
import { UserEntity } from '../user/entities/user.entity';
import { Wallet } from '../wallet/entities/wallet.entity';
import { UserSubscription } from '../subscription/entities/user-subscription.entity';
import { SubscriptionService } from '../subscription/subscription.service';
import { ZibalService } from '../zibal/zibal.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, SubscriptionPlan, UserSubscription, Wallet]), AuthModule],
  providers: [PurchaseService, SubscriptionService, ZibalService],
  controllers: [PurchaseController],
})
export class PurchaseModule { }
