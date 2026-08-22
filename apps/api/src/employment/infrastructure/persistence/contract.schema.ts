import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContractDocument = HydratedDocument<ContractModel>;

@Schema({ collection: 'contracts' })
export class ContractModel {
  @Prop({ required: true, unique: true })
  contractId!: string;

  @Prop({ required: true, unique: true })
  characterId!: string;

  @Prop({ required: true, index: true })
  workplaceId!: string;

  @Prop({ required: true })
  buildingTypeId!: string;

  @Prop({ required: true })
  cargoId!: string;

  @Prop({ required: true })
  hourlyWage!: number;

  @Prop({ required: true, default: 0 })
  hoursWorked!: number;

  @Prop({ required: true, default: 0 })
  progressScore!: number;

  @Prop({ required: true, index: true })
  lastUpdatedAt!: Date;
}

export const ContractSchema = SchemaFactory.createForClass(ContractModel);
