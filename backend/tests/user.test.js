import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';
import { User } from '../src/models/User.js';

let adminToken, gestorToken;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('👥 Gestão e CRUD de Utilizadores (User Endpoints)', () => {
  beforeEach(async () => {
    await seedInitialUsers();

    const adminRes = await request(app).post('/api/v1/auth/login').send({ email: 'admin@ddjlaw.co.mz', password: 'Admin123!' });
    adminToken = adminRes.body.token;

    const gestorRes = await request(app).post('/api/v1/auth/login').send({ email: 'gestor@ddjlaw.co.mz', password: 'Gestor123!' });
    gestorToken = gestorRes.body.token;
  });

  test('Deve listar todos os utilizadores se for Administrador', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(3);
  });

  test('Deve recusar listar utilizadores se NÃO for Administrador (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${gestorToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test('Admin pode criar um novo utilizador com sucesso', async () => {
    const newUserPayload = {
      name: 'Novo Advogado',
      email: 'advogado@ddjlaw.co.mz',
      password: 'SenhaSegura123!',
      role: 'gestor',
    };

    const res = await request(app)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newUserPayload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('advogado@ddjlaw.co.mz');
    expect(res.body.data.role).toBe('gestor');
  });

  test('Admin pode atualizar o perfil e papel RBAC de outro utilizador', async () => {
    const userToEdit = await User.create({
      name: 'Utilizador Inicial',
      email: 'inicial@ddjlaw.co.mz',
      password: 'Password123!',
      role: 'leitor',
    });

    const res = await request(app)
      .put(`/api/v1/users/${userToEdit._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Utilizador Promovido', role: 'gestor', active: false });

    if (res.status !== 200) {
      console.log('FAIL RES STATUS/BODY:', res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Utilizador Promovido');
    expect(res.body.data.role).toBe('gestor');
    expect(res.body.data.active).toBe(false);
  });

  test('Admin pode eliminar um utilizador existente', async () => {
    const userToDelete = await User.create({
      name: 'Conta Temporaria',
      email: 'temp@ddjlaw.co.mz',
      password: 'Password123!',
      role: 'leitor',
    });

    const res = await request(app)
      .delete(`/api/v1/users/${userToDelete._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('Qualquer utilizador autenticado pode atualizar o seu próprio perfil', async () => {
    const res = await request(app)
      .put('/api/v1/users/profile/me')
      .set('Authorization', `Bearer ${gestorToken}`)
      .send({ name: 'Gestor Nome Atualizado', password: 'NovaSenha123!' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.name).toBe('Gestor Nome Atualizado');
  });
});
