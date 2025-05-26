import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckOtpDto, SendOtpDto, UpdateMe } from './dto/auth.dto';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("/send-otp")
  async sendOtp(@Body() otpDto: SendOtpDto) {
    const otp = await this.authService.sendOtp(otpDto);
    return "otp Send sucssesfuly!"
  }

  @Post("/check-otp")
  checkOtp(@Body() otpDto: CheckOtpDto) {
    return this.authService.checkOtp(otpDto)
  }

  @UseGuards(AuthGuard)
  @Get('/me')
  getMe(@CurrentUser() user: UserEntity,) {
    return this.authService.getMe(user.mobile);
  }

  @UseGuards(AuthGuard)
  @Put('/me')
  updateMe(@CurrentUser() user: UserEntity, @Body() updateMe: UpdateMe) {
    return this.authService.updateMe(user.mobile, updateMe);
  }





}
