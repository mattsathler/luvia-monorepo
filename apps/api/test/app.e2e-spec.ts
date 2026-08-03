import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { HealthModule } from '../src/shared/health/health.module';

/**
 * Testa só o HealthModule (sem MongoDB) para servir de exemplo de teste e2e
 * que não depende de infraestrutura externa. Testes e2e que envolvem
 * persistência devem subir um MongoDB de teste (ex.: mongodb-memory-server).
 */
describe('Health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HealthModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ status: 'ok' });
  });
});
