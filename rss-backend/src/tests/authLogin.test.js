process.env.NODE_ENV = 'test';
require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');
const { sequelize, User } = require('../src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test('Login retourne un token valide et route protégée fonctionne', async () => {
  const email = `t${Date.now()}@example.com`;
  const password = 'pwd12345';

  await User.create({ email, password, displayName: 'Toto' });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email, password });
  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body.token).toBeDefined();

  const token = loginRes.body.token;

  const meRes = await request(app)
    .get('/api/users/me')
    .set('Authorization', `Bearer ${token}`);

  expect(meRes.statusCode).toBe(200);
  expect(meRes.body.email).toBe(email);
});
