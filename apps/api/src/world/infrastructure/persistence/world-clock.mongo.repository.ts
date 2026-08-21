import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WorldClock } from '../../domain/entities/world-clock.entity';
import { WorldClockRepository } from '../../domain/repositories/world-clock.repository';
import { WorldClockDocument, WorldClockModel } from './world-clock.schema';

const SINGLETON_KEY = 'default';

@Injectable()
export class WorldClockMongoRepository implements WorldClockRepository {
  constructor(
    @InjectModel(WorldClockModel.name)
    private readonly model: Model<WorldClockDocument>,
  ) {}

  async find(): Promise<WorldClock | null> {
    const document = await this.model.findOne({ key: SINGLETON_KEY }).exec();
    return document ? this.toDomain(document) : null;
  }

  async save(worldClock: WorldClock): Promise<WorldClock> {
    await this.model.findOneAndUpdate(
      { key: SINGLETON_KEY },
      { key: SINGLETON_KEY, epoch: worldClock.epoch },
      { upsert: true, returnDocument: 'after' },
    );

    return worldClock;
  }

  private toDomain(document: WorldClockDocument): WorldClock {
    return new WorldClock({ epoch: document.epoch });
  }
}
