import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { CreateAiServiceDto } from './dto/create-ai-service.dto';
import { UpdateAiServiceDto } from './dto/update-ai-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';
import { BuyServiceDto } from './dto/buy-service.dto';
import { UserService } from '../user/user.service';

@Controller('service')
export class AiServiceController {
  constructor(
    private readonly aiServiceService: AiServiceService,
    private readonly userService: UserService,

  ) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() createAiServiceDto: CreateAiServiceDto) {
    return this.aiServiceService.findOne(user.mobile);
  }

  @UseGuards(AuthGuard)
  @Post('buy')
  buyService(@CurrentUser() user: UserEntity, @Body() buyServiceDto: BuyServiceDto) {
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
}
