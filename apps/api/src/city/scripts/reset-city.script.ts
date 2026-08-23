import mongoose from 'mongoose';
import { CITY_HEIGHT, CITY_SEED, CITY_WIDTH, CityMap } from '../domain/entities/city-map.entity';

const CITY_MAPS_COLLECTION = 'city_maps';
const LOTS_COLLECTION = 'lots';
const SINGLETON_KEY = 'default';

/**
 * Reseta a cidade persistida no Atlas: apaga todos os lotes reivindicados
 * (as posições deles não têm mais garantia de validade depois que o
 * algoritmo de geração de terreno muda — ver `generate-roads.ts`) e
 * regenera + salva o documento singleton de `city_maps` com o
 * `CITY_SEED` atual, no mesmo formato que `CityMapMongoRepository.save`
 * grava em operação normal.
 *
 * Diferente de `city:generate`/`city:seed-workplaces` (que só escrevem um
 * JSON pra colar manualmente no Atlas), este conecta direto no Mongo via
 * `MONGODB_URI` — é uma operação destrutiva sobre o cluster de verdade,
 * rodar com atenção.
 *
 * Rodar com `MONGODB_URI=... npm run city:reset` (ver package.json).
 */
export async function run(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI não definida.');
  }

  await mongoose.connect(uri);

  try {
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Conexão com o Mongo não retornou um banco.');
    }

    const { deletedCount } = await db.collection(LOTS_COLLECTION).deleteMany({});

    const cityMap = CityMap.generate(CITY_WIDTH, CITY_HEIGHT, CITY_SEED);
    await db.collection(CITY_MAPS_COLLECTION).updateOne(
      { key: SINGLETON_KEY },
      {
        $set: {
          key: SINGLETON_KEY,
          width: cityMap.width,
          height: cityMap.height,
          seed: cityMap.seed,
          backgroundColor: cityMap.backgroundColor,
          tiles: cityMap.tiles,
        },
      },
      { upsert: true },
    );

    // eslint-disable-next-line no-console
    console.log(
      `${deletedCount} lote(s) removido(s). Cidade regenerada com seed "${cityMap.seed}" (${cityMap.tiles.length} tiles).`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  run().catch((error) => {
    // eslint-disable-next-line no-console
    console.error(error);
    process.exitCode = 1;
  });
}
