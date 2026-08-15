import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Activity } from '../../domain/entities/activity';
import { SkinTone } from '../../domain/entities/appearance';
import { Gender } from '../../domain/entities/gender';
import { SkillPoints } from '../../domain/entities/skill';

export type CharacterDocument = HydratedDocument<CharacterModel>;

@Schema({ collection: 'characters' })
export class CharacterModel {
  @Prop({ required: true, unique: true })
  characterId!: string;

  @Prop({ required: true, index: true })
  accountId!: string;

  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, default: 'other' })
  gender!: Gender;

  @Prop({ type: Object, required: true, default: {} })
  skills!: SkillPoints;

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

  @Prop({ required: true, default: 3 })
  skinTone!: SkinTone;

  @Prop({ required: true, default: 'default' })
  hairType!: string;

  @Prop({ required: true, default: 'default' })
  eyeType!: string;

  @Prop({ required: true, default: 'default' })
  face!: string;

  @Prop({ type: String, default: null })
  accessory!: string | null;

  @Prop({ required: true, default: 'default' })
  top!: string;

  @Prop({ required: true, default: 'default' })
  pants!: string;

  @Prop({ required: true, default: 'default' })
  shoes!: string;

  @Prop({ required: true, default: 'default' })
  overlay!: string;
}

export const CharacterSchema = SchemaFactory.createForClass(CharacterModel);
