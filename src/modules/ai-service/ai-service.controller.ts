import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AiServiceService } from './ai-service.service';
import { CreateAiServiceDto } from './dto/create-ai-service.dto';
import { UpdateAiServiceDto } from './dto/update-ai-service.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('service')
export class AiServiceController {
  constructor(private readonly aiServiceService: AiServiceService) { }

  @UseGuards(AuthGuard)
  @Post()
  create(@CurrentUser() user: UserEntity, @Body() createAiServiceDto: CreateAiServiceDto) {
    return this.aiServiceService.findOne(user.mobile);
  }

  @Get()
  findAll() {
    return this.aiServiceService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.aiServiceService.findOne(+id);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAiServiceDto: UpdateAiServiceDto) {
    return this.aiServiceService.update(+id, updateAiServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiServiceService.remove(+id);
  }
}
