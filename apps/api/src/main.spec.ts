jest.mock('@nestjs/core', () => ({
  NestFactory: { create: jest.fn() },
}));

// Evita que a árvore real de módulos (e o ConfigModule.forRoot, que carrega o
// .env real via dotenv e sobrescreveria process.env.PORT) seja avaliada aqui.
jest.mock('./app.module', () => ({ AppModule: class AppModule {} }));

describe('bootstrap', () => {
  const originalPort = process.env.PORT;

  afterEach(() => {
    if (originalPort === undefined) {
      delete process.env.PORT;
    } else {
      process.env.PORT = originalPort;
    }
    jest.clearAllMocks();
  });

  it('creates the Nest app, enables CORS, applies the global validation pipe, and listens on PORT', async () => {
    const enableCors = jest.fn();
    const useGlobalPipes = jest.fn();
    const listen = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NestFactory } = require('@nestjs/core');
    NestFactory.create.mockResolvedValue({ enableCors, useGlobalPipes, listen });

    process.env.PORT = '4000';

    const { bootstrap } = await import('./main');
    await bootstrap();

    expect(NestFactory.create).toHaveBeenCalled();
    expect(enableCors).toHaveBeenCalled();
    expect(useGlobalPipes).toHaveBeenCalled();
    expect(listen).toHaveBeenLastCalledWith('4000');
  });

  it('falls back to port 3000 when PORT is not set', async () => {
    const listen = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { NestFactory } = require('@nestjs/core');
    NestFactory.create.mockResolvedValue({ enableCors: jest.fn(), useGlobalPipes: jest.fn(), listen });

    delete process.env.PORT;

    const { bootstrap } = await import('./main');
    await bootstrap();

    expect(listen).toHaveBeenLastCalledWith(3000);
  });
});
