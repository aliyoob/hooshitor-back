import { Module } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { AiServiceController } from './ai-service.controller';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [AuthModule, UserModule],
  controllers: [AiServiceController],
  providers: [AiServiceService],
})
export class AiServiceModule { }
