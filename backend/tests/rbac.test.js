import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';
import { Information } from '../src/models/Information.js';

let adminToken, gestorToken, leitorToken;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('🛡️ Controlo de Acesso RBAC (Roles & Permissions)', () => {
  beforeEach(async () => {
    await seedInitialUsers();

    const adminRes = await request(app).post('/api/v1/auth/login').send({ email: 'admin@ddjlaw.co.mz', password: 'Admin123!' });
    adminToken = adminRes.body.token;

    const gestorRes = await request(app).post('/api/v1/auth/login').send({ email: 'gestor@ddjlaw.co.mz', password: 'Gestor123!' });
    gestorToken = gestorRes.body.token;

    const leitorRes = await request(app).post('/api/v1/auth/login').send({ email: 'leitor@ddjlaw.co.mz', password: 'Leitor123!' });
    leitorToken = leitorRes.body.token;
  });

  test('👑 Admin deve ter permissão total (Criar, Editar, Eliminar)', async () => {
    const createRes = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ infoRef: 'ADM-01', brand: 'TEST ADMIN', clazz: 1, owner: 'OWNER' });

    expect(createRes.status).toBe(201);
    const id = createRes.body.data._id;

    const deleteRes = await request(app)
      .delete(`/api/v1/informations/${id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
  });

  test('🛠️ Gestor pode criar e editar, mas é BLOQUEADO ao eliminar (403 Forbidden)', async () => {
    // Gestor cria registo com sucesso
    const createRes = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ infoRef: 'GST-01', brand: 'TEST GESTOR', clazz: 2, owner: 'OWNER' });

    expect(createRes.status).toBe(201);
    const id = createRes.body.data._id;

    // Gestor edita com sucesso
    const updateRes = await request(app)
      .put(`/api/v1/informations/${id}`)
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ brand: 'TEST GESTOR UPDATED' });

    expect(updateRes.status).toBe(200);

    // Gestor tenta ELIMINAR ➔ DEVE RECEBER 403
    const deleteRes = await request(app)
      .delete(`/api/v1/informations/${id}`)
      .set('Authorization', `Bearer ${gestorToken}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body.message).toMatch(/não tem permissão/i);
  });

  test('👁️ Leitor pode apenas visualizar, mas é BLOQUEADO ao criar, editar ou eliminar (403 Forbidden)', async () => {
    const item = await Information.create({ infoRef: 'LTR-01', brand: 'READ ONLY BRAND', clazz: 5, owner: 'OWNER' });

    // Leitor pode ler
    const readRes = await request(app)
      .get(`/api/v1/informations/${item._id}`)
      .set('Authorization', `Bearer ${leitorToken}`);
    expect(readRes.status).toBe(200);

    // Leitor tenta Criar ➔ 403
    const createRes = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({ infoRef: 'LTR-02', brand: 'NEW', clazz: 1, owner: 'OWNER' });
    expect(createRes.status).toBe(403);

    // Leitor tenta Editar ➔ 403
    const updateRes = await request(app)
      .put(`/api/v1/informations/${item._id}`)
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({ brand: 'MUTATED' });
    expect(updateRes.status).toBe(403);

    // Leitor tenta Eliminar ➔ 403
    const deleteRes = await request(app)
      .delete(`/api/v1/informations/${item._id}`)
      .set('Authorization', `Bearer ${leitorToken}`);
    expect(deleteRes.status).toBe(403);
  });
});
