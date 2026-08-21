import { Inject, Injectable } from '@nestjs/common';
import { WorldClock } from '../../domain/entities/world-clock.entity';
import { WORLD_CLOCK_REPOSITORY, WorldClockRepository } from '../../domain/repositories/world-clock.repository';

/**
 * Busca a época (epoch) singleton do relógio do mundo; se ainda não existir,
 * gera (= agora) e persiste. Mesmo padrão de "buscar ou gerar" de
 * GetOrGenerateCityMapUseCase — sem controle de concorrência otimista,
 * porque uma corrida entre leituras concorrentes na primeira geração só
 * define a época com uma diferença de milissegundos, sem consequência real.
 */
@Injectable()
export class GetOrGenerateWorldClockUseCase {
  constructor(
    @Inject(WORLD_CLOCK_REPOSITORY)
    private readonly worldClockRepository: WorldClockRepository,
  ) {}

  async execute(): Promise<WorldClock> {
    const existing = await this.worldClockRepository.find();

    if (existing) {
      return existing;
    }

    return this.worldClockRepository.save(WorldClock.generate());
  }
}
