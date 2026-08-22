import { Activity, CharacterStats, DEFAULT_ACTIVITY, applyActivityEffect } from './activity';
import { Appearance, DEFAULT_APPEARANCE } from './appearance';
import { DEFAULT_GENDER, Gender } from './gender';
import { SkillPoints } from './skill';

export type CharacterProps = {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  happiness: number;
  energy: number;
  money: number;
  fame: number;
  activity: Activity;
  activityEndsAt: Date | null;
  lastUpdatedAt: Date;
  appearance?: Appearance;
  gender?: Gender;
  skills?: SkillPoints;
};

/**
 * Ver docs/game-design/character-needs.md, docs/game-design/progression-fame.md
 * e docs/game-design/wryd-activity-system.md.
 */
export class Character {
  readonly id: string;
  readonly accountId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly gender: Gender;
  readonly skills: SkillPoints;
  readonly happiness: number;
  readonly energy: number;
  readonly money: number;
  readonly fame: number;
  readonly activity: Activity;
  readonly activityEndsAt: Date | null;
  readonly lastUpdatedAt: Date;
  readonly appearance: Appearance;

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.gender = props.gender ?? DEFAULT_GENDER;
    this.skills = props.skills ?? {};
    this.happiness = props.happiness;
    this.energy = props.energy;
    this.money = props.money;
    this.fame = props.fame;
    this.activity = props.activity;
    this.activityEndsAt = props.activityEndsAt;
    this.lastUpdatedAt = props.lastUpdatedAt;
    this.appearance = props.appearance ?? DEFAULT_APPEARANCE;
  }

  static create(
    props: { firstName: string; lastName: string; accountId: string } & Partial<
      Pick<CharacterProps, 'happiness' | 'energy' | 'money' | 'fame' | 'appearance' | 'gender' | 'skills'>
    >,
    id: string,
    now: Date = new Date(),
  ): Character {
    return new Character({
      id,
      accountId: props.accountId,
      firstName: props.firstName,
      lastName: props.lastName,
      gender: props.gender ?? DEFAULT_GENDER,
      skills: props.skills ?? {},
      happiness: props.happiness ?? 100,
      energy: props.energy ?? 100,
      money: props.money ?? 0,
      fame: props.fame ?? 0,
      activity: DEFAULT_ACTIVITY,
      activityEndsAt: null,
      lastUpdatedAt: now,
      appearance: props.appearance ?? DEFAULT_APPEARANCE,
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

  /**
   * Troca peças do guarda-roupa. Aceita um patch parcial — só as chaves
   * informadas são substituídas, o restante do visual atual é preservado.
   * Não afeta atributos nem `lastUpdatedAt` (visual não decai com o tempo).
   */
  updateAppearance(patch: Partial<Appearance>): Character {
    return new Character({ ...this.withStats(this.stats()), appearance: { ...this.appearance, ...patch } });
  }

  /**
   * Credita (ou debita) dinheiro, clampando em 0 — usado por
   * CreditCharacterMoneyUseCase (ex.: pagamento de um Contract no bounded
   * context `employment`). Não mexe em mais nada; o chamador já deve ter
   * recomputado o personagem até `now` antes de chamar isso.
   */
  credit(amount: number): Character {
    return new Character({ ...this.withStats(this.stats()), money: Math.max(0, this.money + amount) });
  }

  private stats(): CharacterStats {
    return { happiness: this.happiness, energy: this.energy, money: this.money, fame: this.fame };
  }

  private withStats(stats: CharacterStats): CharacterProps {
    return {
      id: this.id,
      accountId: this.accountId,
      firstName: this.firstName,
      lastName: this.lastName,
      gender: this.gender,
      skills: this.skills,
      ...stats,
      activity: this.activity,
      activityEndsAt: this.activityEndsAt,
      lastUpdatedAt: this.lastUpdatedAt,
      appearance: this.appearance,
    };
  }
}
