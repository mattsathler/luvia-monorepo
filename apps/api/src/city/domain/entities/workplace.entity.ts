export type WorkplaceProps = {
  id: string;
  buildingTypeId: string;
  x: number;
  y: number;
};

/**
 * Prédio de trabalho (ex.: Prefeitura, Hospital) — infraestrutura fixa da
 * cidade, sem dono. Diferente de `Lot`: nenhum `characterId`, nenhuma regra
 * de posse (não é "1 por jogador"). `buildingTypeId` é uma chave opaca pro
 * catálogo de prédios/cargos do bounded context `employment` — `city` nunca
 * importa nada de lá, só guarda a posição na grade. Ver
 * docs/game-design/jobs.md e docs/decisions/0031-bairros-expansao-do-mundo-sob-demanda.md.
 */
export class Workplace {
  readonly id: string;
  readonly buildingTypeId: string;
  readonly x: number;
  readonly y: number;

  constructor(props: WorkplaceProps) {
    this.id = props.id;
    this.buildingTypeId = props.buildingTypeId;
    this.x = props.x;
    this.y = props.y;
  }

  static create(props: { buildingTypeId: string; x: number; y: number }, id: string): Workplace {
    return new Workplace({ id, ...props });
  }
}
