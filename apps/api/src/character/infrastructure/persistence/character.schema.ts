import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Activity } from '../../domain/entities/activity';

export type CharacterDocument = HydratedDocument<CharacterModel>;

@Schema({ collection: 'characters' })
export class CharacterModel {
  @Prop({ required: true, unique: true })
  characterId!: string;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, default: 100 })
  happiness!: number;

  @Prop({ required: true, default: 100 })
  energy!: number;

  @Prop({ required: true, default: 0 })
  money!: number;

  @Prop({ required: true, default: 0 })
  fame!: number;

  @Prop({ required: true, default: 'idle' })
  activity!: Activity;

  @Prop({ type: Date, default: null })
  activityEndsAt!: Date | null;

  @Prop({ required: true, index: true })
  lastUpdatedAt!: Date;
}

export const CharacterSchema = SchemaFactory.createForClass(CharacterModel);
