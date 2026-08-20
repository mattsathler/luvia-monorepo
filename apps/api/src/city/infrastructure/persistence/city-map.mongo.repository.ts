import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CityMap } from '../../domain/entities/city-map.entity';
import { CityMapRepository } from '../../domain/repositories/city-map.repository';
import { CityMapDocument, CityMapModel } from './city-map.schema';

const SINGLETON_KEY = 'default';

@Injectable()
export class CityMapMongoRepository implements CityMapRepository {
  constructor(
    @InjectModel(CityMapModel.name)
    private readonly model: Model<CityMapDocument>,
  ) {}

  async find(): Promise<CityMap | null> {
    const document = await this.model.findOne({ key: SINGLETON_KEY }).exec();
    return document ? this.toDomain(document) : null;
  }

  async save(cityMap: CityMap): Promise<CityMap> {
    await this.model.findOneAndUpdate(
      { key: SINGLETON_KEY },
      { key: SINGLETON_KEY, width: cityMap.width, height: cityMap.height, seed: cityMap.seed, tiles: cityMap.tiles },
      { upsert: true, returnDocument: 'after' },
    );

    return cityMap;
  }

  private toDomain(document: CityMapDocument): CityMap {
    return new CityMap({
      width: document.width,
      height: document.height,
      seed: document.seed,
      tiles: document.tiles,
    });
  }
}
