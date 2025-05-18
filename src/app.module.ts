import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { TypeOrmDbConfig } from './config/typeorm.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { AiServiceModule } from './modules/ai-service/ai-service.module';
import { WalletService } from './modules/wallet/wallet.service';
import { ZibalModule } from './modules/zibal/zibal.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), '.env')
    }),
    TypeOrmModule.forRoot(TypeOrmDbConfig()),
    AuthModule,
    UserModule,
    AiServiceModule,
    ZibalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
