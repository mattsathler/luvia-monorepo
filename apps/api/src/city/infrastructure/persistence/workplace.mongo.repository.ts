import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workplace } from '../../domain/entities/workplace.entity';
import { WorkplaceRepository } from '../../domain/repositories/workplace.repository';
import { WorkplaceDocument, WorkplaceModel } from './workplace.schema';

@Injectable()
export class WorkplaceMongoRepository implements WorkplaceRepository {
  constructor(
    @InjectModel(WorkplaceModel.name)
    private readonly model: Model<WorkplaceDocument>,
  ) {}

  async save(workplace: Workplace): Promise<Workplace> {
    await this.model.findOneAndUpdate(
      { workplaceId: workplace.id },
      { workplaceId: workplace.id, ...this.toFields(workplace) },
      { upsert: true, returnDocument: 'after' },
    );

    return workplace;
  }

  async findAll(): Promise<Workplace[]> {
    const documents = await this.model.find({}).exec();
    return documents.map((document) => this.toDomain(document));
  }

  async findById(id: string): Promise<Workplace | null> {
    const document = await this.model.findOne({ workplaceId: id }).exec();
    return document ? this.toDomain(document) : null;
  }

  private toFields(workplace: Workplace) {
    return { buildingTypeId: workplace.buildingTypeId, x: workplace.x, y: workplace.y };
  }

  private toDomain(document: WorkplaceDocument): Workplace {
    return new Workplace({
      id: document.workplaceId,
      buildingTypeId: document.buildingTypeId,
      x: document.x,
      y: document.y,
    });
  }
}
