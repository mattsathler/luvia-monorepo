import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character } from '../../domain/entities/character.entity';
import { CharacterRepository } from '../../domain/repositories/character.repository';
import { CharacterModel, CharacterDocument } from './character.schema';

@Injectable()
export class CharacterMongoRepository implements CharacterRepository {
  constructor(
    @InjectModel(CharacterModel.name)
    private readonly model: Model<CharacterDocument>,
  ) {}

  async save(character: Character): Promise<Character> {
    await this.model.findOneAndUpdate(
      { characterId: character.id },
      { characterId: character.id, ...this.toFields(character) },
      { upsert: true, returnDocument: 'after' },
    );

    return character;
  }

  async trySave(character: Character, expectedLastUpdatedAt: Date): Promise<Character | null> {
    const updated = await this.model
      .findOneAndUpdate(
        { characterId: character.id, lastUpdatedAt: expectedLastUpdatedAt },
        { $set: this.toFields(character) },
        { returnDocument: 'after' },
      )
      .exec();

    return updated ? character : null;
  }

  async findById(id: string): Promise<Character | null> {
    const document = await this.model.findOne({ characterId: id }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findByAccountId(accountId: string): Promise<Character[]> {
    const documents = await this.model.find({ accountId }).exec();
    return documents.map((document) => this.toDomain(document));
  }

  async findStaleBatch(olderThan: Date, limit: number, skip: number): Promise<Character[]> {
    const documents = await this.model
      .find({ lastUpdatedAt: { $lt: olderThan } })
      .sort({ lastUpdatedAt: 1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return documents.map((document) => this.toDomain(document));
  }

  private toFields(character: Character) {
    return {
      accountId: character.accountId,
      firstName: character.firstName,
      lastName: character.lastName,
      gender: character.gender,
      skills: character.skills,
      happiness: character.happiness,
      energy: character.energy,
      money: character.money,
      fame: character.fame,
      activity: character.activity,
      activityEndsAt: character.activityEndsAt,
      lastUpdatedAt: character.lastUpdatedAt,
      skinTone: character.appearance.skinTone,
      hairType: character.appearance.hairType,
      eyeType: character.appearance.eyeType,
      face: character.appearance.face,
      accessory: character.appearance.accessory,
      top: character.appearance.top,
      pants: character.appearance.pants,
      shoes: character.appearance.shoes,
      overlay: character.appearance.overlay,
    };
  }

  private toDomain(document: CharacterDocument): Character {
    return new Character({
      id: document.characterId,
      accountId: document.accountId,
      firstName: document.firstName,
      lastName: document.lastName,
      gender: document.gender,
      skills: document.skills,
      happiness: document.happiness,
      energy: document.energy,
      money: document.money,
      fame: document.fame,
      activity: document.activity,
      activityEndsAt: document.activityEndsAt,
      lastUpdatedAt: document.lastUpdatedAt,
      appearance: {
        skinTone: document.skinTone,
        hairType: document.hairType,
        eyeType: document.eyeType,
        face: document.face,
        accessory: document.accessory,
        top: document.top,
        pants: document.pants,
        shoes: document.shoes,
        overlay: document.overlay,
      },
    });
  }
}
