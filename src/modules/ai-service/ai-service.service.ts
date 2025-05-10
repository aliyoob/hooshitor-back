import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserService } from '../user/user.service';
import { BuyServiceDto } from './dto/buy-service.dto';
import { conversationEntity } from './entities/conversation.entity';
import { GptService } from './services/gpt.service';
import { UserEntity } from '../user/entities/user.entity';
import { DalleService } from './services/dalle.service';

@Injectable()
export class AiServiceService {
  constructor(
    private userService: UserService,
    @InjectRepository(conversationEntity)
    private conversationRepository: Repository<conversationEntity>,
    @Inject(forwardRef(() => GptService))
    private gptService: GptService,
    @Inject(forwardRef(() => DalleService))
    private dalleService: DalleService,

  ) { }

  async newMessage(conversationId: number, content: string) {
    let messagee;

    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (conversation) {
      conversation.messages.push(content);
      await this.conversationRepository.save(conversation);
      messagee = conversation;
    }

    return await this.getConversation(messagee.id);
  }




  async getConversation(conversationId: number) {
    return this.conversationRepository.findOne({ where: { id: conversationId } });
  }

  async getConversationsByMobile(user: UserEntity) {
    return this.conversationRepository.findOne({ where: { user: user } });
  }



  async buyService(buyService: BuyServiceDto, userm: UserEntity) {
    let { conversationId, content } = buyService;
    console.log(conversationId, content);

    if (!conversationId) {
      const newConversation = this.conversationRepository.create({ messages: [], user: userm });
      await this.conversationRepository.save(newConversation);
      conversationId = newConversation.id;
    }

    const conversation = await this.newMessage(conversationId, content);

    if (buyService.serviceType === 'gpt') {
      const response = await this.gptService.gptChat(conversationId, content);
      await this.newMessage(conversationId, response);


      return {
        conversation,
        response,
      };
    }

    if (buyService.serviceType === 'dalle') {
      const response = await this.dalleService.dalleChat(conversationId, content);
      await this.newMessage(conversationId, response);


      return {
        conversation,
        response,
      };
    }

  }




  findOne(mobile: string) {
    return this.userService.findOne(mobile);
  }


}
