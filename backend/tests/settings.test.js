import request from 'supertest';
import app from '../src/app.js';
import { connectTestDB, clearTestDB, closeTestDB } from './setup.js';
import { seedInitialUsers } from '../src/controllers/authController.js';
import { Information } from '../src/models/Information.js';
import { checkExpiringRecords } from '../src/services/notificationScheduler.js';

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

describe('⚙️ Configurações & Notificações de Expiração (Settings & Notifications)', () => {
  beforeEach(async () => {
    await connectTestDB();
    await seedInitialUsers();

    const adminRes = await request(app).post('/api/v1/auth/login').send({ email: 'admin@ddjlaw.co.mz', password: 'Admin123!' });
    adminToken = adminRes.body.token;

    const gestorRes = await request(app).post('/api/v1/auth/login').send({ email: 'gestor@ddjlaw.co.mz', password: 'Gestor123!' });
    gestorToken = gestorRes.body.token;

    const leitorRes = await request(app).post('/api/v1/auth/login').send({ email: 'leitor@ddjlaw.co.mz', password: 'Leitor123!' });
    leitorToken = leitorRes.body.token;
  });

  test('Deve obter configurações do sistema com valores padrão', async () => {
    const res = await request(app)
      .get('/api/v1/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('sendHour', '09:00');
    expect(res.body.data).toHaveProperty('daysBeforeExpiration', 30);
    expect(res.body.data).toHaveProperty('notificationsEnabled', true);
  });

  test('Deve permitir que Admin atualize as configurações de notificação', async () => {
    const res = await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        notificationEmail: 'alertas@ddjlaw.co.mz',
        sendHour: '08:30',
        period: 'Semanal',
        daysBeforeExpiration: 45,
        notificationsEnabled: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notificationEmail).toBe('alertas@ddjlaw.co.mz');
    expect(res.body.data.sendHour).toBe('08:30');
    expect(res.body.data.period).toBe('Semanal');
    expect(res.body.data.daysBeforeExpiration).toBe(45);
  });

  test('Deve proibir utilizadores do tipo Leitor de alterar configurações', async () => {
    const res = await request(app)
      .put('/api/v1/settings')
      .set('Authorization', `Bearer ${leitorToken}`)
      .send({
        notificationEmail: 'hacker@ddjlaw.co.mz',
      });

    expect(res.status).toBe(403);
  });

  test('Deve enviar email de teste com sucesso (modo de simulação)', async () => {
    const res = await request(app)
      .post('/api/v1/settings/test-email')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'teste@ddjlaw.co.mz',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('Email de teste enviado com sucesso');
  });

  test('Deve identificar corretamente registos prestes a expirar dentro da janela configurada', async () => {
    const today = new Date();
    const expiringSoon = new Date();
    expiringSoon.setDate(today.getDate() + 10); // expira em 10 dias

    const itemSoon = await Information.create({
      infoRef: 'EXP-SOON-999',
      brand: 'Marca Prestes a Vencer',
      clazz: 5,
      owner: 'Empresa Teste',
      expirationDate: expiringSoon,
    });

    const expiringFar = new Date();
    expiringFar.setDate(today.getDate() + 180); // expira em 180 dias

    const itemFar = await Information.create({
      infoRef: 'EXP-FAR-999',
      brand: 'Marca Com Validade Longa',
      clazz: 9,
      owner: 'Empresa Teste',
      expirationDate: expiringFar,
    });

    const results = await checkExpiringRecords(30);
    const refs = results.map((r) => r.infoRef);
    expect(refs).toContain('EXP-SOON-999');
    expect(refs).not.toContain('EXP-FAR-999');
  });
});
