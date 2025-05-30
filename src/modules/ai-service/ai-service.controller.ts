import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { CreateAiServiceDto } from './dto/create-ai-service.dto';
import { UpdateAiServiceDto } from './dto/update-ai-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { BuyServiceDto } from './dto/buy-service.dto';
import { UserService } from '../user/user.service';
import { GptService } from './services/gpt.service';
import { WalletService } from '../wallet/wallet.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { console } from 'inspector';
import { ServiceType } from './enums/service.enum';

@Controller('service')
export class AiServiceController {
  constructor(
    private readonly aiServiceService: AiServiceService,
    private readonly userService: UserService,
    private readonly gptService: GptService,
    private readonly walletService: WalletService,

  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() createAiServiceDto: CreateAiServiceDto) {
    return this.aiServiceService.findOne(user.mobile);
  }

  @UseGuards(AuthGuard)
  @Post('buy')
  async buyService(@CurrentUser() user: UserEntity, @Body() buyServiceDto: BuyServiceDto) {
    if (buyServiceDto.serviceType === ServiceType.Replicate) {
      buyServiceDto.content = await this.aiServiceService.gptTranslate(buyServiceDto.content);
    }
    return this.aiServiceService.buyService(buyServiceDto, user);
  }

  @UseGuards(AuthGuard)
  @Get('conversations')
  async getConverestion(@CurrentUser() user: UserEntity) {


    const userm = await this.userService.findOneCoversetions(user.mobile);
    const conversations = await this.aiServiceService.getConversationsByMobile(user);

    return {
      conversations,
      userm
    }
  }

  @UseGuards(AuthGuard)
  @Get('conversations/:id')
  async getSingleConverestion(@CurrentUser() user: UserEntity, @Param('id') id: number) {
    const conversation = await this.aiServiceService.getConversation(id);

    return {
      conversation,
    };
  }


  @Post('chat')
  @UseGuards(AuthGuard)
  async chat(@CurrentUser() user: UserEntity, @Body() body: { message: string; thread_id?: string }) {
    await this.walletService.subtractBalance(user.mobile, 100);
    const threadId = body.thread_id || await this.gptService.createThread(body.message, user);
    await this.gptService.addMessage(threadId, body.message);
    const runId = await this.gptService.runAssistant(threadId);
    await this.gptService.waitForRunCompletion(threadId, runId);
    const response = await this.gptService.getLatestAssistantMessage(threadId);

    return {
      thread_id: threadId,
      response,
    };
  }

  @UseGuards(AuthGuard)
  @Get('threads')
  async getThreads(@CurrentUser() user: UserEntity) {


    const userm = await this.userService.findOneCoversetions(user.mobile);
    const threads = await this.aiServiceService.getConversationsByMobile(user);

    return {
      threads,
      userm
    }
  }

  @UseGuards(AuthGuard)
  @Get('threads/messages')
  async getThreadMessages(@CurrentUser() user: UserEntity, @Query('thread_id') threadId: string) {
    console.log('threadId', threadId);
    const messages = await this.gptService.getThreadMessages(threadId);

    return {
      messages,
      threadId
    }
  }

  @Post('voicetext')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // مطمئن شو این پوشه وجود داره
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // حداکثر 10MB
    }),
  )
  async uploadVoice(@UploadedFile() file: Express.Multer.File) {
    const transcription = await this.gptService.transcribeAudio(file.path);
    return { text: transcription };
  }


}
