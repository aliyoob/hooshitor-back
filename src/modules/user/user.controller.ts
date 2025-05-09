import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Request } from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from './entities/user.entity';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) { }


  @UseGuards(AuthGuard)
  @Get()
  profile(@CurrentUser() user: UserEntity) {
    return this.userService.findOne(user.mobile);
  }
}
