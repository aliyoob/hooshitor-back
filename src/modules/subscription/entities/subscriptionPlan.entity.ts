import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('subscription_plans')
export class SubscriptionPlan {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string; // رایگان، قدرتمند، حرفه‌ای، سلطان

    @Column()
    price: number;

    @Column()
    durationInDays: number; // مثلاً 30، 90، 180، 365

    @Column()
    dailyCredit: number; // مثلاً ۶۰۰۰ اعتبار در روز
}
