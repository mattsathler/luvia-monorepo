import { Workplace } from '../entities/workplace.entity';

export const WORKPLACE_REPOSITORY = Symbol('WORKPLACE_REPOSITORY');

export interface WorkplaceRepository {
  save(workplace: Workplace): Promise<Workplace>;

  /**
   * Todos os prédios da cidade — usado pra renderizar a grade inteira
   * (junto com os lotes) e pra resolver o prédio de um Contract.
   */
  findAll(): Promise<Workplace[]>;

  findById(id: string): Promise<Workplace | null>;
}
