import { WorldClock } from '../entities/world-clock.entity';

export const WORLD_CLOCK_REPOSITORY = 'WORLD_CLOCK_REPOSITORY';

export interface WorldClockRepository {
  find(): Promise<WorldClock | null>;
  save(worldClock: WorldClock): Promise<WorldClock>;
}
