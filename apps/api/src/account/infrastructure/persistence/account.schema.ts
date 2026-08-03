import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AccountDocument = HydratedDocument<AccountModel>;

@Schema({ collection: 'accounts' })
export class AccountModel {
  @Prop({ required: true, unique: true })
  accountId!: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email!: string;

  @Prop({ required: true })
  passwordHash!: string;

  @Prop({ required: true })
  createdAt!: Date;
}

export const AccountSchema = SchemaFactory.createForClass(AccountModel);
