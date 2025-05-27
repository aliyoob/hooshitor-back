import { Controller, Post, Body, Get, Param, Patch, Delete, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionPlan } from './entities/subscriptionPlan.entity';

@Controller('plans')
export class SubscriptionPlanController {
  constructor(
    @InjectRepository(SubscriptionPlan)
    private readonly planRepo: Repository<SubscriptionPlan>,
  ) { }

  // ✅ ساخت پلن جدید
  @Post()
  async create(@Body() dto: { name: string; durationInDays: number; dailyCredit: number, price: number }) {
    const plan = this.planRepo.create(dto);
    await this.planRepo.save(plan);
    return { success: true, data: plan };
  }

  // ✅ لیست همه پلن‌ها
  @Get()
  async findAll() {
    const plans = await this.planRepo.find();
    return { success: true, data: plans };
  }

  // ✅ دریافت یک پلن خاص
  @Get(':id')
  async findOne(@Param('id') id: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return { success: true, data: plan };
  }

  // ✅ ویرایش پلن
  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() dto: Partial<{ name: string; durationInDays: number; dailyCredit: number, price: number }>,
  ) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    Object.assign(plan, dto);
    await this.planRepo.save(plan);
    return { success: true, data: plan };
  }

  // ✅ حذف پلن
  @Delete(':id')
  async remove(@Param('id') id: number) {
    const plan = await this.planRepo.findOne({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');

    await this.planRepo.remove(plan);
    return { success: true, message: 'Plan deleted' };
  }
}
