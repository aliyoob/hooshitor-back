import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZibalService {
  async createPayment(mobile: string, amount: number, planId: number): Promise<{ trackId: string, payLink: string }> {

    const result = await axios.post('https://gateway.zibal.ir/v1/request', {
      merchant: process.env.ZIBAL_MERCHANT_ID,
      amount,
      callbackUrl: `http://localhost:3000/zibal/callback?mobile=${mobile}&amount=${amount}&planId=${planId}`,
      description: 'افزایش موجودی کیف پول'
    });

    if (result.data.result !== 100) {
      throw new Error('خطا در اتصال به درگاه زیبال: ' + result.data.message);
    }

    return {
      trackId: result.data.trackId,
      payLink: `https://gateway.zibal.ir/start/${result.data.trackId}`
    };
  }

  async verifyPayment(trackId: string): Promise<{ success: boolean, amount: number }> {
    const merchant = process.env.ZIBAL_MERCHANT_ID;
    const response = await axios.post('https://gateway.zibal.ir/v1/verify', {
      merchant,
      trackId,
    });

    if (response.data.result === 100 || response.data.result === 201) {
      return { success: true, amount: response.data.amount };
    } else {
      return { success: false, amount: 0 };
    }
  }
}
