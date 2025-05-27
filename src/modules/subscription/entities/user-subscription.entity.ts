import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { SubscriptionPlan } from './subscriptionPlan.entity';

@Entity()
export class UserSubscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => UserEntity, user => user.subscriptions, { eager: false })
    user: UserEntity;

    @ManyToOne(() => SubscriptionPlan, { eager: true })
    plan: SubscriptionPlan;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column()
    lastCreditGivenDate: Date;
}
