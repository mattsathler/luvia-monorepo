import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Lot } from '../../domain/entities/lot.entity';
import { LotRepository } from '../../domain/repositories/lot.repository';
import { LotDocument, LotModel } from './lot.schema';

@Injectable()
export class LotMongoRepository implements LotRepository {
  constructor(
    @InjectModel(LotModel.name)
    private readonly model: Model<LotDocument>,
  ) {}

  async save(lot: Lot): Promise<Lot> {
    await this.model.findOneAndUpdate(
      { lotId: lot.id },
      { lotId: lot.id, ...this.toFields(lot) },
      { upsert: true, returnDocument: 'after' },
    );

    return lot;
  }

  async findAll(): Promise<Lot[]> {
    const documents = await this.model.find({}).exec();
    return documents.map((document) => this.toDomain(document));
  }

  async findByCharacterId(characterId: string): Promise<Lot | null> {
    const document = await this.model.findOne({ characterId }).exec();
    return document ? this.toDomain(document) : null;
  }

  private toFields(lot: Lot) {
    return { characterId: lot.characterId, type: lot.type, x: lot.x, y: lot.y };
  }

  private toDomain(document: LotDocument): Lot {
    return new Lot({
      id: document.lotId,
      characterId: document.characterId,
      type: document.type,
      x: document.x,
      y: document.y,
    });
  }
}
