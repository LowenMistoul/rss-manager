process.env.NODE_ENV = 'test';
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const { sequelize, User } = require('../models');

beforeAll(async () => {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

test('POST /api/auth/register crée un utilisateur', async () => {
  const email = `t${Date.now()}@example.com`;
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'pwd12345', displayName: 'Toto' });

  expect(res.statusCode).toBe(200);
  expect(res.body.email).toBe(email);

  const user = await User.findOne({ where: { email } });
  expect(user).not.toBeNull();
  expect(user.email).toBe(email);
});
