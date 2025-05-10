import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(mobile: string) {
    return this.userRepository.findOne({ where: { mobile }, relations: ['wallet'] });
  }
  findOneCoversetions(mobile: string) {
    return this.userRepository.findOne({ where: { mobile }, relations: ['wallet', 'conversations', 'threads'] });
  }

}
