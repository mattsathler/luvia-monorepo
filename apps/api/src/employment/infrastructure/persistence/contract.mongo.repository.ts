import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contract } from '../../domain/entities/contract.entity';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractModel, ContractDocument } from './contract.schema';

@Injectable()
export class ContractMongoRepository implements ContractRepository {
  constructor(
    @InjectModel(ContractModel.name)
    private readonly model: Model<ContractDocument>,
  ) {}

  async save(contract: Contract): Promise<Contract> {
    await this.model.findOneAndUpdate(
      { characterId: contract.characterId },
      { characterId: contract.characterId, ...this.toFields(contract) },
      { upsert: true, returnDocument: 'after' },
    );

    return contract;
  }

  async trySave(contract: Contract, expectedLastUpdatedAt: Date): Promise<Contract | null> {
    const updated = await this.model
      .findOneAndUpdate(
        { contractId: contract.id, lastUpdatedAt: expectedLastUpdatedAt },
        { $set: this.toFields(contract) },
        { returnDocument: 'after' },
      )
      .exec();

    return updated ? contract : null;
  }

  async findById(id: string): Promise<Contract | null> {
    const document = await this.model.findOne({ contractId: id }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findByCharacterId(characterId: string): Promise<Contract | null> {
    const document = await this.model.findOne({ characterId }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findStaleBatch(olderThan: Date, limit: number, skip: number): Promise<Contract[]> {
    const documents = await this.model
      .find({ lastUpdatedAt: { $lt: olderThan } })
      .sort({ lastUpdatedAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return documents.map((document) => this.toDomain(document));
  }

  async countActiveByWorkplaceAndCargo(workplaceId: string, cargoId: string): Promise<number> {
    return this.model.countDocuments({ workplaceId, cargoId }).exec();
  }

  private toFields(contract: Contract) {
    return {
      contractId: contract.id,
      workplaceId: contract.workplaceId,
      buildingTypeId: contract.buildingTypeId,
      cargoId: contract.cargoId,
      hourlyWage: contract.hourlyWage,
      hoursWorked: contract.hoursWorked,
      progressScore: contract.progressScore,
      lastUpdatedAt: contract.lastUpdatedAt,
    };
  }

  private toDomain(document: ContractDocument): Contract {
    return new Contract({
      id: document.contractId,
      characterId: document.characterId,
      workplaceId: document.workplaceId,
      buildingTypeId: document.buildingTypeId,
      cargoId: document.cargoId,
      hourlyWage: document.hourlyWage,
      hoursWorked: document.hoursWorked,
      progressScore: document.progressScore,
      lastUpdatedAt: document.lastUpdatedAt,
    });
  }
}
