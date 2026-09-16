import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';
import fs from 'fs';
import path from 'path';

let adminToken;
const dummyPdfPath = path.join(process.cwd(), 'tests', 'sample.pdf');
const dummyTxtPath = path.join(process.cwd(), 'tests', 'sample.txt');

beforeAll(async () => {
  await connectTestDB();
  // Criar ficheiros temporários para teste
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4 sample pdf content for testing');
  fs.writeFileSync(dummyTxtPath, 'invalid file format content');
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  // Limpar ficheiros temporários
  if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
  if (fs.existsSync(dummyTxtPath)) fs.unlinkSync(dummyTxtPath);
  await closeTestDB();
});

describe('📄 Upload e Gestão de Documentos PDF (Upload Endpoints)', () => {
  beforeEach(async () => {
    await seedInitialUsers();
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@ddjlaw.co.mz', password: 'Admin123!' });
    adminToken = loginRes.body.token;
  });

  test('Deve realizar o upload com sucesso de um ficheiro PDF válido', async () => {
    const response = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('infoRef', 'PDF-TEST-01')
      .field('fileType', 'Marca Comercial')
      .field('brand', 'MARCA COM PDF')
      .field('clazz', '30')
      .field('owner', 'EMPRESA PDF SA')
      .attach('document', dummyPdfPath);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.documentUrl).toMatch(/\/uploads\/documents\/doc-.*\.pdf/);
    expect(response.body.data.documentOriginalName).toBe('sample.pdf');
  });

  test('Deve rejeitar o upload de ficheiros com formato inválido (não PDF)', async () => {
    const response = await request(app)
      .post('/api/v1/informations')
      .set('Authorization', `Bearer ${adminToken}`)
      .field('infoRef', 'TXT-TEST-01')
      .field('brand', 'MARCA INVALIDA')
      .field('clazz', '10')
      .field('owner', 'EMPRESA TXT')
      .attach('document', dummyTxtPath);

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/Apenas ficheiros em formato PDF são permitidos/i);
  });
});
