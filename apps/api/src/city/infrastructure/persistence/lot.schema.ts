import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { LotType } from '../../domain/entities/lot.entity';

export type LotDocument = HydratedDocument<LotModel>;

@Schema({ collection: 'lots' })
export class LotModel {
  @Prop({ required: true, unique: true })
  lotId!: string;

  @Prop({ required: true, unique: true, index: true })
  characterId!: string;

  @Prop({ required: true, default: 'residential' })
  type!: LotType;

  @Prop({ required: true })
  x!: number;

  @Prop({ required: true })
  y!: number;
}

export const LotSchema = SchemaFactory.createForClass(LotModel);
