const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const env = process.env.NODE_ENV || 'development';
const dbName = env === 'test' ? process.env.DB_TEST_NAME : process.env.DB_NAME;

const sequelize = new Sequelize(dbName, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 5432,
  dialect: 'postgres',
  logging: true, 
});


const db = {
  sequelize,
  Sequelize,
  DataTypes,
};

db.User = require('./user')(sequelize, DataTypes);
db.Collection = require('./collection')(sequelize, DataTypes);
db.Feed = require('./feed')(sequelize, DataTypes);
db.Article = require('./article')(sequelize, DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName] && db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
