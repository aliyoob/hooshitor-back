// payment.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity('payment')
export class Zibal {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    trackId: string;

    @Column()
    status: string; // success | failed

    @ManyToOne(() => UserEntity, (user) => user.payments)
    user: UserEntity;

    @CreateDateColumn()
    created_at: Date;
}
