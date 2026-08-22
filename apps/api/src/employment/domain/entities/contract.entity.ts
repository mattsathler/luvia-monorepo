import { findCargo, nextCargo } from './building-catalog';

export type ContractProps = {
  id: string;
  characterId: string;
  workplaceId: string;
  buildingTypeId: string;
  cargoId: string;
  hourlyWage: number;
  hoursWorked: number;
  progressScore: number;
  lastUpdatedAt: Date;
};

/**
 * Ver docs/game-design/jobs.md. `hourlyWage` é copiado do catálogo na
 * criação/promoção (permite divergir no futuro — negociação, bônus), não é
 * puramente derivado. `hoursWorked`/`progressScore` são acumulados *no cargo
 * atual* — zeram na promoção, não continuam pro próximo cargo.
 */
export class Contract {
  readonly id: string;
  readonly characterId: string;
  readonly workplaceId: string;
  readonly buildingTypeId: string;
  readonly cargoId: string;
  readonly hourlyWage: number;
  readonly hoursWorked: number;
  readonly progressScore: number;
  readonly lastUpdatedAt: Date;

  constructor(props: ContractProps) {
    this.id = props.id;
    this.characterId = props.characterId;
    this.workplaceId = props.workplaceId;
    this.buildingTypeId = props.buildingTypeId;
    this.cargoId = props.cargoId;
    this.hourlyWage = props.hourlyWage;
    this.hoursWorked = props.hoursWorked;
    this.progressScore = props.progressScore;
    this.lastUpdatedAt = props.lastUpdatedAt;
  }

  static start(
    props: {
      characterId: string;
      workplaceId: string;
      buildingTypeId: string;
      cargoId: string;
      hourlyWage: number;
    },
    id: string,
    now: Date = new Date(),
  ): Contract {
    return new Contract({
      id,
      characterId: props.characterId,
      workplaceId: props.workplaceId,
      buildingTypeId: props.buildingTypeId,
      cargoId: props.cargoId,
      hourlyWage: props.hourlyWage,
      hoursWorked: 0,
      progressScore: 0,
      lastUpdatedAt: now,
    });
  }

  /**
   * Avança o contrato por [lastUpdatedAt, now]. `isWorking` e `efficiency`
   * são parâmetros separados de propósito: eficiência baixa (longe de casa,
   * skill fraca) ainda acumula horas/score/dinheiro nessa taxa baixa — só
   * `isWorking = false` (personagem fora da atividade `working`) congela o
   * contrato por completo (o relógio ainda avança até `now`, sem acúmulo,
   * pra não reprocessar esse intervalo depois).
   *
   * `efficiency` é o resultado de computeEfficiency() (escala ~0-100, já com
   * o fator de distância aplicado): dita tanto o dinheiro ganho (fração do
   * salário-base) quanto o progresso de promoção.
   */
  recomputeUntil(
    now: Date,
    isWorking: boolean,
    efficiency: number,
  ): { contract: Contract; previousLastUpdatedAt: Date; moneyEarned: number } {
    const previousLastUpdatedAt = this.lastUpdatedAt;

    if (now <= previousLastUpdatedAt) {
      return { contract: this, previousLastUpdatedAt, moneyEarned: 0 };
    }

    if (!isWorking) {
      return {
        contract: new Contract({ ...this.fields(), lastUpdatedAt: now }),
        previousLastUpdatedAt,
        moneyEarned: 0,
      };
    }

    const elapsedHours = (now.getTime() - previousLastUpdatedAt.getTime()) / (1000 * 60 * 60);
    const moneyEarned = elapsedHours * this.hourlyWage * (efficiency / 100);
    const hoursWorked = this.hoursWorked + elapsedHours;
    const progressScore = this.progressScore + efficiency * elapsedHours;

    const cargo = findCargo(this.buildingTypeId, this.cargoId);
    const shouldPromote = cargo !== undefined && cargo.scoreToPromote !== null && progressScore >= cargo.scoreToPromote;

    if (!shouldPromote) {
      return {
        contract: new Contract({ ...this.fields(), hoursWorked, progressScore, lastUpdatedAt: now }),
        previousLastUpdatedAt,
        moneyEarned,
      };
    }

    // Invariante do catálogo: scoreToPromote não-null sempre implica que
    // existe um próximo cargo na hierarquia (só o último cargo tem
    // scoreToPromote null — ver building-catalog.ts).
    const promoted = nextCargo(this.buildingTypeId, this.cargoId)!;

    return {
      contract: new Contract({
        ...this.fields(),
        cargoId: promoted.id,
        hourlyWage: promoted.baseHourlyWage,
        hoursWorked: 0,
        progressScore: 0,
        lastUpdatedAt: now,
      }),
      previousLastUpdatedAt,
      moneyEarned,
    };
  }

  private fields(): ContractProps {
    return {
      id: this.id,
      characterId: this.characterId,
      workplaceId: this.workplaceId,
      buildingTypeId: this.buildingTypeId,
      cargoId: this.cargoId,
      hourlyWage: this.hourlyWage,
      hoursWorked: this.hoursWorked,
      progressScore: this.progressScore,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }
}
