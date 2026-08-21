import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorldClockDocument = HydratedDocument<WorldClockModel>;

@Schema({ collection: 'world_clock' })
export class WorldClockModel {
  /** Sempre `'default'` — existe um relógio de mundo só, este documento é um singleton. */
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  epoch!: Date;
}

export const WorldClockSchema = SchemaFactory.createForClass(WorldClockModel);
