import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";


@Entity("conversation")
export class conversationEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @Column("simple-array", { nullable: true })
    messages: string[];



    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @ManyToOne(() => UserEntity, (user) => user.conversations, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity;
}
