import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('🔐 Autenticação & Login (Auth Endpoints)', () => {
  beforeEach(async () => {
    await seedInitialUsers();
  });

  test('Deve efetuar login com sucesso com credenciais Admin válidas', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@ddjlaw.co.mz',
        password: 'Admin123!',
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toEqual(
      expect.objectContaining({
        email: 'admin@ddjlaw.co.mz',
        role: 'admin',
        name: 'Lilia Tembe de Deus',
      })
    );
  });

  test('Deve rejeitar login quando a palavra-passe estiver incorreta', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@ddjlaw.co.mz',
        password: 'SenhaErrada123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Credenciais inválidas/i);
  });

  test('Deve rejeitar login para email inexistente', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'desconhecido@ddjlaw.co.mz',
        password: 'Admin123!',
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test('Deve retornar HTTP 400 se os campos de email/password estiverem em falta', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test('Deve obter os dados do próprio perfil em /auth/me com token JWT válido', async () => {
    // 1. Obter Token
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'gestor@ddjlaw.co.mz', password: 'Gestor123!' });

    const token = loginRes.body.token;

    // 2. Aceder /auth/me
    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('gestor@ddjlaw.co.mz');
    expect(meRes.body.user.role).toBe('gestor');
  });

  test('Deve recusar acesso ao /auth/me sem token ou com token inválido', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer token_invalido_123');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
