export type LotType = 'residential';

export type LotProps = {
  id: string;
  characterId: string;
  type: LotType;
  x: number;
  y: number;
};

/**
 * Ver docs/game-design/lots-and-construction.md e
 * docs/decisions/0006-um-lote-de-cada-tipo-por-jogador.md.
 */
export class Lot {
  readonly id: string;
  readonly characterId: string;
  readonly type: LotType;
  readonly x: number;
  readonly y: number;

  constructor(props: LotProps) {
    this.id = props.id;
    this.characterId = props.characterId;
    this.type = props.type;
    this.x = props.x;
    this.y = props.y;
  }

  static create(props: { characterId: string; type: LotType; x: number; y: number }, id: string): Lot {
    return new Lot({ id, ...props });
  }
}
