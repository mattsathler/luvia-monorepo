import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account } from '../../domain/entities/account.entity';
import { AccountRepository } from '../../domain/repositories/account.repository';
import { AccountModel, AccountDocument } from './account.schema';

@Injectable()
export class AccountMongoRepository implements AccountRepository {
  constructor(
    @InjectModel(AccountModel.name)
    private readonly model: Model<AccountDocument>,
  ) {}

  async save(account: Account): Promise<Account> {
    await this.model.findOneAndUpdate(
      { accountId: account.id },
      {
        accountId: account.id,
        email: account.email,
        passwordHash: account.passwordHash,
        createdAt: account.createdAt,
      },
      { upsert: true, returnDocument: 'after' },
    );

    return account;
  }

  async findById(id: string): Promise<Account | null> {
    const document = await this.model.findOne({ accountId: id }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findByEmail(email: string): Promise<Account | null> {
    const document = await this.model.findOne({ email }).exec();
    return document ? this.toDomain(document) : null;
  }

  private toDomain(document: AccountDocument): Account {
    return new Account({
      id: document.accountId,
      email: document.email,
      passwordHash: document.passwordHash,
      createdAt: document.createdAt,
    });
  }
}
