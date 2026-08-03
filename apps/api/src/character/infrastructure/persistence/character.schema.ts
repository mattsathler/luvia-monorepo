import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CharacterDocument = HydratedDocument<CharacterModel>;

@Schema({ collection: 'characters' })
export class CharacterModel {
  @Prop({ required: true, unique: true })
  characterId!: string;

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
}

export const CharacterSchema = SchemaFactory.createForClass(CharacterModel);
