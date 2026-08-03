export type CharacterProps = {
  id: string;
  name: string;
  happiness: number;
  energy: number;
  money: number;
  fame: number;
};

/**
 * Ver docs/game-design/character-needs.md e docs/game-design/progression-fame.md.
 */
export class Character {
  readonly id: string;
  readonly name: string;
  readonly happiness: number;
  readonly energy: number;
  readonly money: number;
  readonly fame: number;

  constructor(props: CharacterProps) {
    this.id = props.id;
    this.name = props.name;
    this.happiness = props.happiness;
    this.energy = props.energy;
    this.money = props.money;
    this.fame = props.fame;
  }

  static create(props: Omit<CharacterProps, 'id' | 'happiness' | 'energy' | 'money' | 'fame'> & Partial<Pick<CharacterProps, 'happiness' | 'energy' | 'money' | 'fame'>>, id: string): Character {
    return new Character({
      id,
      name: props.name,
      happiness: props.happiness ?? 100,
      energy: props.energy ?? 100,
      money: props.money ?? 0,
      fame: props.fame ?? 0,
    });
  }
}
