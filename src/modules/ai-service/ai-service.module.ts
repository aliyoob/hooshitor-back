import { Module, forwardRef } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiServiceController } from './ai-service.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { GptService } from './services/gpt.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { conversationEntity } from './entities/conversation.entity';
import { DalleService } from './services/dalle.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([conversationEntity]),
    forwardRef(() => AiServiceModule),
  ],
  controllers: [AiServiceController],
  providers: [AiServiceService, GptService, DalleService],
  exports: [AiServiceService, GptService, DalleService],
})
export class AiServiceModule { }