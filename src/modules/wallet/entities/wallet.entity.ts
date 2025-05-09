import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { UserEntity } from 'src/modules/user/entities/user.entity';

@Entity()
export class Wallet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ default: 0 })
    balance: number;

    @OneToOne(() => UserEntity, (user) => user.wallet, { onDelete: 'CASCADE' })
    user: UserEntity;
}
