import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type WorkplaceDocument = HydratedDocument<WorkplaceModel>;

@Schema({ collection: 'workplaces' })
export class WorkplaceModel {
  @Prop({ required: true, unique: true })
  workplaceId!: string;

  @Prop({ required: true, index: true })
  buildingTypeId!: string;

  @Prop({ required: true })
  x!: number;

  @Prop({ required: true })
  y!: number;
}

export const WorkplaceSchema = SchemaFactory.createForClass(WorkplaceModel);
