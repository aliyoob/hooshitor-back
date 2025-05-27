import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { OTPEntity } from '../user/entities/otp.entity';
import { CheckOtpDto, SendOtpDto } from './dto/auth.dto';
import { randomInt } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './types/payload';
import axios from 'axios';

import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { WalletService } from '../wallet/wallet.service';
import { SubscriptionService } from '../subscription/subscription.service';


@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OTPEntity)
    private otpRepository: Repository<OTPEntity>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private walletService: WalletService,
    private subService: SubscriptionService,
  ) { }

  async sendOtp(otpDto: SendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepository.findOneBy({ mobile })


    // اگر وجود داشته باشه کد رو ارسال میکنیم واگر وجود نداشته باشه اول اکانت رو ایجاد می کنیم
    if (!user) {
      const wallet = await this.walletService.createInitialWallet();
      user = this.userRepository.create({
        mobile,
        wallet
      });
      user = await this.userRepository.save(user);
      await this.subService.activateFreePlanForUser(user)
    }
    await this.createOtpForUser(user)
  }

  async createOtpForUser(user: UserEntity) {
    const expiresIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();
    let otp = await this.otpRepository.findOneBy({ userId: user.id });
    if (otp) {
      if (otp.expires_in > new Date()) {
        throw new BadRequestException("otp code not expired!")
      }
      otp.code = code;
      otp.expires_in = expiresIn;
    } else {
      otp = this.otpRepository.create({
        code,
        expires_in: expiresIn,
        userId: user.id
      });
    }
    otp = await this.otpRepository.save(otp);
    // console.log(otp)
    console.log('در حال ارسال پیامک به Kavenegar با اطلاعات زیر:');

    const apiKey = this.configService.get("Sms.smsApiToken");
    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;
    console.log(otp.code)
    console.log(user.mobile)
    // const response = await axios.get(url, {
    //   params: {
    //     receptor: user.mobile,
    //     token: otp.code,
    //     template: 'flatorlogin',
    //   }
    // });
    // , headers: {
    //   "Content-Type": "application/x-www-form-urlencoded",
    // }



    user.otpId = otp.id;
    await this.userRepository.save(user);
  }

  async checkOtp(otpDto: CheckOtpDto) {
    const { code, mobile } = otpDto;
    const now = new Date();
    const user = await this.userRepository.findOne({
      where: { mobile },
      relations: {
        otp: true,
      }
    });
    if (!user || !user.otp) throw new UnauthorizedException("Not found account!");
    const otp = user?.otp;
    if (otp?.code !== code) throw new UnauthorizedException("otp code is not correct!");
    if (otp.expires_in < now) throw new UnauthorizedException("otp code expired!");
    if (!user.mobile_verify) {
      await this.userRepository.update({ id: user.id }, { mobile_verify: true })
    }

    const { accessToken, refreshToken } = this.makeTokenforUser({ id: user.id, mobile });

    const apiKey = this.configService.get("Sms.smsApiToken");
    // await this.sendSms(user.mobile, otp, "flatorlogin");
    console.log(otp)

    return {
      accessToken,
      refreshToken,
      message: "you loggedin successfully!"
    }
  }

  makeTokenforUser(payload: TokenPayload) {
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.accessTokenSecret,
      expiresIn: "30d",
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.refreshTokenSecret,
      expiresIn: "1y",
    });
    return {
      accessToken,
      refreshToken
    }
  }
  // این برای استفاده در گارد است
  // قسمتی که پی لود است برای ساخت پی لود استفادع میشه
  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token, {
        secret: process.env.accessTokenSecret,
      });
      // در این if یعنی همه چیز درست بوده
      if (typeof payload === "object" && payload?.id) {
        const user = await this.userRepository.findOneBy({ id: payload.id })
        if (!user) {
          throw new UnauthorizedException("login to your account!")
        }
        return user
      }
      throw new UnauthorizedException("login to your account!")
    } catch (error) {
      throw new UnauthorizedException("login to your account!")
    }
  }

  async sendSms(receptor, token: any, template: string) {
    const apiKey = this.configService.get("Sms.smsApiToken");


    const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;

    try {
      console.log('در حال ارسال پیامک به Kavenegar با اطلاعات زیر:');
      console.log('receptor:', receptor);
      console.log('token:', token.code);
      console.log('template:', template);
      const response = await axios.get(url, {
        params: {
          receptor,
          token: token.code,
          template
        }, headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        }
      });

      console.log('پیامک با موفقیت ارسال شد:', response.data);
      return response.data;
      // return;
    } catch (error) {
      console.error('خطا در ارسال پیامک:', error);
      throw error;
    }
  }









  async checkMobile(mobile: string) {
    const user = await this.userRepository.findOneBy({ mobile })
    if (user) throw new ConflictException("Mobile is already exist!")
  }

  hashPasswords(password: string) {
    const salt = genSaltSync(10)
    return hashSync(password, salt);
  }

  async getMe(mobile: string) {
    const user = await this.userRepository.findOne({
      where: { mobile },
      relations: {
        wallet: true,
        subscriptions: true,
      }
    });
    if (!user) throw new UnauthorizedException("login to your account!")
    return user;
  }

  async updateMe(mobile: string, updateMe: { name?: string; }) {
    const user = await this.userRepository.findOneBy({ mobile });
    if (!user) throw new UnauthorizedException("login to your account!");

    if (updateMe.name) {
      user.first_name = updateMe.name;
    }

    return this.userRepository.save(user);
  }



}
