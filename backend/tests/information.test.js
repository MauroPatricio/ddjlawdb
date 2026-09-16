import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';
import { Information } from '../src/models/Information.js';

let adminToken;

beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await closeTestDB();
});

describe('📋 CRUD de Informações (SIGINFO Endpoints)', () => {
  beforeEach(async () => {
    await seedInitialUsers();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@ddjlaw.co.mz', password: 'Admin123!' });
    adminToken = loginRes.body.token;
  });

  test('Deve criar um novo registo de informação (Create)', async () => {
    const newInfo = {
      infoRef: '8811/2026',
      fileType: 'Marca Comercial',
      brand: 'NESTLÉ MOÇAMBIQUE',
      clazz: 30,
      owner: 'SOCIÉTÉ DES PRODUITS NESTLÉ S.A.',
      status: 'Concedido',
      certified: 'Sim',
      address: 'Vevey, Switzerland',
      observation: 'Registo de marca alimentícia',
    };

    const response = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newInfo);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.infoRef).toBe('8811/2026');
    expect(response.body.data.brand).toBe('NESTLÉ MOÇAMBIQUE');
  });

  test('Deve listar todas as informações com paginação (Read All)', async () => {
    await Information.create([
      { infoRef: '1001', brand: 'MARCA 1', clazz: 10, owner: 'EMP 1' },
      { infoRef: '1002', brand: 'MARCA 2', clazz: 20, owner: 'EMP 2' },
    ]);

    const response = await request(app)
      .get('/api/v1/informations?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.total).toBe(2);
    expect(response.body.data.length).toBe(2);
  });

  test('Deve filtrar informações por termo de pesquisa (Search)', async () => {
    await Information.create([
      { infoRef: '9953/2006', brand: 'CHOLESTRO', clazz: 30, owner: 'FOODCORP' },
      { infoRef: '9632/2005', brand: 'ORAQUICK', clazz: 10, owner: 'ORASURE' },
    ]);

    const response = await request(app)
      .get('/api/v1/informations?search=CHOLESTRO')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.total).toBe(1);
    expect(response.body.data[0].brand).toBe('CHOLESTRO');
  });

  test('Deve obter os detalhes de um registo específico por ID (Read One)', async () => {
    const created = await Information.create({
      infoRef: '960302',
      brand: 'SENSODYNE',
      clazz: 3,
      owner: 'Stafford-Miller',
    });

    const response = await request(app)
      .get(`/api/v1/informations/${created._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.brand).toBe('SENSODYNE');
  });

  test('Deve atualizar os dados de uma informação existente (Update)', async () => {
    const created = await Information.create({
      infoRef: '962420',
      brand: 'ONDUVILLA',
      clazz: 19,
      owner: 'ONDULINE',
      status: 'Pendente',
    });

    const response = await request(app)
      .put(`/api/v1/informations/${created._id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Concedido', observation: 'Aprovado pelo INAPI' });

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe('Concedido');
    expect(response.body.data.observation).toBe('Aprovado pelo INAPI');
  });

  test('Deve eliminar um registo de informação (Delete)', async () => {
    const created = await Information.create({
      infoRef: '914841',
      brand: 'PATTEX GAFFER TAPE',
      clazz: 16,
      owner: 'HENKEL AG',
    });

    const deleteRes = await request(app)
      .delete(`/api/v1/informations/${created._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    const checkRes = await request(app)
      .get(`/api/v1/informations/${created._id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(checkRes.status).toBe(404);
  });
});
