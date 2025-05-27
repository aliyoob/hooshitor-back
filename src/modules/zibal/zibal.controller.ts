import { Controller, Get, Query, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ZibalService } from './zibal.service';
import { WalletService } from '../wallet/wallet.service';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Zibal } from './entities/zibal.entity';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('zibal')
export class ZibalController {
  constructor(
    private readonly zibalService: ZibalService,
    private readonly walletService: WalletService,
    @InjectRepository(Zibal)
    private paymentRepository: Repository<Zibal>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) { }

  // @UseGuards(AuthGuard)
  // @Get('pay')
  // async pay(@CurrentUser() user: UserEntity, @Query('amount') amount: number, @Res() res: Response) {
  //   const { payLink, trackId } = await this.zibalService.createPayment(user.mobile, Number(amount));
  //   console.log('payLink', payLink);
  //   res.json({ payLink, trackId });
  // }


  @Get('callback')
  async callback(
    @Query('trackId') trackId: string,
    @Query('mobile') mobile: string,
    @Query('amount') amount: number,
    @Query('planId') planId: number,

    @Res() res: Response
  ) {
    if (!mobile) {
      throw new UnauthorizedException('کاربر مجاز نیست.');
    }
    const verify = await this.zibalService.verifyPayment(trackId);
    const user = await this.userRepository.findOne({ where: { mobile } });




    if (!user) {
      return res.status(404).send('کاربر پیدا نشد.');
    }

    await this.paymentRepository.save({
      amount: Number(amount),
      trackId,
      status: verify.success ? 'success' : 'failed',
      user,
    });

    if (verify.success) {
      // await this.walletService.addBalance(mobile, Number(amount));
      return res.redirect(`/purchase/zibal/callback?trackId=${trackId}&mobile=${mobile}&amount=${amount}&planId=${planId}`);
    } else {
      return res.send('پرداخت ناموفق بود.');
    }
  }

}
