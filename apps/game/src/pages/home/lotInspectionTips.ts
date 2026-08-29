// Dicas exibidas aleatoriamente na inspeção de lote (ver LotDetailModal) —
// curadas à mão, como SKILL_DEFINITIONS no backend: crescem por PR, não por
// conteúdo carregado em runtime. Puramente informativas por enquanto (não
// refletem nenhuma regra de jogo implementada ainda).
export const LOT_INSPECTION_TIPS: string[] = [
    "Lotes residenciais próximos a comércios e serviços são mais valorizados.",
    "Ficar perto do seu trabalho reduz o tempo gasto se deslocando todo dia.",
    "A vizinhança de um lote também importa pra fama e relacionamentos.",
    "Lotes vagos podem ser reivindicados por qualquer personagem sem dono ainda.",
];

export function pickRandomLotInspectionTip(): string {
    return LOT_INSPECTION_TIPS[Math.floor(Math.random() * LOT_INSPECTION_TIPS.length)];
}
