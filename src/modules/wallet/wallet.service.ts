import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from './entities/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet)
        private walletRepo: Repository<Wallet>,
    ) { }

    async createInitialWallet(): Promise<Wallet> {
        const wallet = this.walletRepo.create({ balance: 0 });
        return this.walletRepo.save(wallet);
    }

    async addBalance(mobile: string, amount: number): Promise<Wallet> {
        const wallet = await this.walletRepo.findOne({ where: { user: { mobile } }, relations: ['user'] });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        wallet.balance += amount;
        return this.walletRepo.save(wallet);
    }

    async subtractBalance(mobile: string, amount: number): Promise<Wallet> {
        const wallet = await this.walletRepo.findOne({ where: { user: { mobile } }, relations: ['user'] });
        if (!wallet) {
            throw new Error('Wallet not found');
        }
        if (wallet.balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }
        wallet.balance -= amount;
        return this.walletRepo.save(wallet);
    }
}
