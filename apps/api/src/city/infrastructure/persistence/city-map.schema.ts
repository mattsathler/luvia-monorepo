import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TerrainTile } from '../../domain/entities/terrain-tile';

export type CityMapDocument = HydratedDocument<CityMapModel>;

@Schema({ collection: 'city_maps' })
export class CityMapModel {
  /** Sempre `'default'` — existe uma cidade só, este documento é um singleton. */
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true })
  width!: number;

  @Prop({ required: true })
  height!: number;

  @Prop({ required: true })
  seed!: string;

  /** Hex — ver `city-map.entity.ts#DEFAULT_BACKGROUND_COLOR`. */
  @Prop({ required: true })
  backgroundColor!: string;

  /**
   * O subcampo `type` precisa ser `{ type: String }` (não `String` direto) —
   * Mongoose reserva a chave `type` num objeto de definição de schema pra
   * indicar o tipo do próprio campo; sem esse aninhamento, ele interpreta o
   * elemento do array inteiro como `String`, não como `{x, y, type}`.
   */
  @Prop({
    type: [{ x: Number, y: Number, type: { type: String }, _id: false }],
    required: true,
  })
  tiles!: TerrainTile[];
}

export const CityMapSchema = SchemaFactory.createForClass(CityMapModel);
