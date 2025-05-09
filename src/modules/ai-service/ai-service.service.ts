import { Injectable } from '@nestjs/common';
import { CreateAiServiceDto } from './dto/create-ai-service.dto';
import { UpdateAiServiceDto } from './dto/update-ai-service.dto';
import { UserService } from '../user/user.service';

@Injectable()
export class AiServiceService {
  constructor(
    private userService: UserService,
  ) { }

  create(createAiServiceDto: CreateAiServiceDto) {
    return 'This action adds a new aiService';
  }

  findAll() {
    return `This action returns all aiService`;
  }

  findOne(mobile: string) {
    return this.userService.findOne(mobile);
  }

  update(id: number, updateAiServiceDto: UpdateAiServiceDto) {
    return `This action updates a #${id} aiService`;
  }

  remove(id: number) {
    return `This action removes a #${id} aiService`;
  }
}
