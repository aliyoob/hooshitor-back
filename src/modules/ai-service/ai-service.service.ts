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

  async newMessage(conversationId: number, content: string | Buffer) {
    let messagee;
    console.log('newMessage', conversationId, content);

    const conversation = await this.conversationRepository.findOne({ where: { id: conversationId } });
    if (conversation) {
      if (Buffer.isBuffer(content)) {
        content = content.toString('utf-8');
      }
      if (typeof content !== 'string') {
        throw new TypeError('Content must be a string');
      }
      // Remove null bytes and sanitize content
      const sanitizedContent = content.replace(/\u0000/g, '').replace(/[\u0000-\u001F\u007F-\u009F]/g, '');
      conversation.messages.push(sanitizedContent);
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

    if (buyService.serviceType === 'dalle') {
      const response = await this.dalleService.dalleChat(conversationId, content);
      await this.newMessage(conversationId, response);


      return {
        conversation,
        response,
      };
    }

    if (buyService.serviceType === 'stability') {
      const response = await this.dalleService.stabilityImage(conversationId, content);
      await this.newMessage(conversationId, response);


      return {
        conversation,
        response,
      };
    }

    if (buyService.serviceType === 'replicate') {
      const response = await this.dalleService.replicateImage(conversationId, content);
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
