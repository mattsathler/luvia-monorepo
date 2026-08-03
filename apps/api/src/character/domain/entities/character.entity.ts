import { Activity, CharacterStats, DEFAULT_ACTIVITY, applyActivityEffect } from './activity';

export type CharacterProps = {
  id: string;
  name: string;
  happiness: number;
  energy: number;
  money: number;
  fame: number;
  activity: Activity;
  activityEndsAt: Date | null;
  lastUpdatedAt: Date;
};

/**
 * Ver docs/game-design/character-needs.md, docs/game-design/progression-fame.md
 * e docs/game-design/wryd-activity-system.md.
 */
export class Character {
  readonly id: string;
  readonly name: string;
  readonly happiness: number;
  readonly energy: number;
  readonly money: number;
  readonly fame: number;
  readonly activity: Activity;
  readonly activityEndsAt: Date | null;
  readonly lastUpdatedAt: Date;

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.name = props.name;
    this.happiness = props.happiness;
    this.energy = props.energy;
    this.money = props.money;
    this.fame = props.fame;
    this.activity = props.activity;
    this.activityEndsAt = props.activityEndsAt;
    this.lastUpdatedAt = props.lastUpdatedAt;
  }

  static create(
    props: { name: string } & Partial<Pick<CharacterProps, 'happiness' | 'energy' | 'money' | 'fame'>>,
    id: string,
    now: Date = new Date(),
  ): Character {
    return new Character({
      id,
      name: props.name,
      happiness: props.happiness ?? 100,
      energy: props.energy ?? 100,
      money: props.money ?? 0,
      fame: props.fame ?? 0,
      activity: DEFAULT_ACTIVITY,
      activityEndsAt: null,
      lastUpdatedAt: now,
    });
  }

  /**
   * Ver docs/decisions/0013-sistema-wryd-tick-em-lotes-e-polling.md.
   * Aplica o efeito da atividade atual sobre o intervalo [lastUpdatedAt, now].
   * Se activityEndsAt cair dentro desse intervalo, fecha o efeito da atividade
   * até lá e trata o restante do intervalo como Ocioso (atividade padrão).
   */
  recomputeUntil(now: Date): { character: Character; previousLastUpdatedAt: Date } {
    const previousLastUpdatedAt = this.lastUpdatedAt;

    if (now <= previousLastUpdatedAt) {
      return { character: this, previousLastUpdatedAt };
    }

    if (this.activityEndsAt && this.activityEndsAt <= now) {
      const statsAfterActivity = applyActivityEffect(
        this.stats(),
        this.activity,
        this.activityEndsAt.getTime() - previousLastUpdatedAt.getTime(),
      );
      const statsAfterIdle = applyActivityEffect(
        statsAfterActivity,
        DEFAULT_ACTIVITY,
        now.getTime() - this.activityEndsAt.getTime(),
      );

      return {
        character: new Character({
          ...this.withStats(statsAfterIdle),
          activity: DEFAULT_ACTIVITY,
          activityEndsAt: null,
          lastUpdatedAt: now,
        }),
        previousLastUpdatedAt,
      };
    }

    const stats = applyActivityEffect(this.stats(), this.activity, now.getTime() - previousLastUpdatedAt.getTime());

    return {
      character: new Character({ ...this.withStats(stats), lastUpdatedAt: now }),
      previousLastUpdatedAt,
    };
  }

  /**
   * Troca a atividade atual. Deve ser chamado sobre um Character já recomputado
   * até `now` (ver RecomputeCharacterUseCase), para que o efeito da atividade
   * anterior já tenha sido fechado antes de gravar a nova.
   */
  changeActivity(activity: Activity, activityEndsAt: Date | null, now: Date): Character {
    return new Character({ ...this.withStats(this.stats()), activity, activityEndsAt, lastUpdatedAt: now });
  }

  private stats(): CharacterStats {
    return { happiness: this.happiness, energy: this.energy, money: this.money, fame: this.fame };
  }

  private withStats(stats: CharacterStats): CharacterProps {
    return {
      id: this.id,
      name: this.name,
      ...stats,
      activity: this.activity,
      activityEndsAt: this.activityEndsAt,
      lastUpdatedAt: this.lastUpdatedAt,
    };
  }
}
