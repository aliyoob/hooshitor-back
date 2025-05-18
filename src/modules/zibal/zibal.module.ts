import { Module } from '@nestjs/common';
import { ZibalService } from './zibal.service';
import { ZibalController } from './zibal.controller';
import { AuthModule } from '../auth/auth.module';
import { WalletModule } from '../wallet/wallet.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Zibal } from './entities/zibal.entity';

@Module({
  imports: [AuthModule, WalletModule, TypeOrmModule.forFeature([Zibal])],
  controllers: [ZibalController],
  providers: [ZibalService],
})
export class ZibalModule { }
