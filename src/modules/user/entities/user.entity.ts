import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { OTPEntity } from "./otp.entity";
import { Wallet } from "src/modules/wallet/entities/wallet.entity";
import { conversationEntity } from "../../ai-service/entities/conversation.entity";

@Entity("user")
export class UserEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column({ nullable: true })
    first_name: string;

    @Column({ nullable: true })
    last_name: string;

    @Column({ nullable: true })
    mobile: string;

    @Column({ default: false })
    mobile_verify: boolean;

    @Column({ nullable: true })
    otpId: number;

    @OneToOne(() => OTPEntity, (otp) => otp.user)
    @JoinColumn({ name: "otpId" })
    otp: OTPEntity;

    @OneToOne(() => Wallet, (wallet) => wallet.user, { cascade: true })
    @JoinColumn()
    wallet: Wallet;

    @OneToMany(() => conversationEntity, (conversation) => conversation.user, { cascade: true })
    conversations: conversationEntity[];

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
