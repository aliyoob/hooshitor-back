import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";


@Entity("thread")
export class threadEntity {
    @PrimaryGeneratedColumn("increment")
    id: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    @Column("simple-array", { nullable: true })
    threadIds: string[];

    @ManyToOne(() => UserEntity, (user) => user.threads, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user: UserEntity;

    @Column({ nullable: true })
    subject: string;
}
