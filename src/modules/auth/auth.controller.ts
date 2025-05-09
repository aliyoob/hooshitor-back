import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CheckOtpDto, SendOtpDto } from './dto/auth.dto';



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




}
