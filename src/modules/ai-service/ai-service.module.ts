import { Module, forwardRef } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiServiceController } from './ai-service.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { GptService } from './services/gpt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { conversationEntity } from './entities/conversation.entity';
import { DalleService } from './services/dalle.service';
import { HttpModule } from '@nestjs/axios';
import { threadEntity } from './entities/threads.entity';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    WalletModule,
    TypeOrmModule.forFeature([conversationEntity, threadEntity]),
    forwardRef(() => AiServiceModule),
    HttpModule, // Added HttpModule to provide HttpService
  ],
  controllers: [AiServiceController],
  providers: [AiServiceService, GptService, DalleService],
  exports: [AiServiceService, GptService, DalleService],
})
export class AiServiceModule { }