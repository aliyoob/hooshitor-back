import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { Response } from 'express';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserEntity } from '../user/entities/user.entity';

@Controller('purchase')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) { }

  @UseGuards(AuthGuard)
  @Get('start')
  async startPayment(
    @CurrentUser() user: UserEntity,

    @Query('planId') planId: number,
  ) {
    return this.purchaseService.createPurchase(user.mobile, planId);
  }

  @Get('zibal/callback')
  async zibalCallback(
    @Query('trackId') trackId: string,
    // @CurrentUser() user: UserEntity,
    @Query('planId') planId: number,
    @Query('mobile') mobile: string,
    @Res() res: Response,
  ) {
    const result = await this.purchaseService.verifyAndActivate(trackId, mobile, planId);
    if (result.success) {
      return res.redirect('https://flator.ir/panel/subscription/success'); // یا هر آدرسی
    } else {
      return res.redirect('https://flator.ir/panel/subscription/failure');
    }
  }
}
