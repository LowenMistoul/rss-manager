require('dotenv').config();
const http = require('http');
const app = require('./app');
const { sequelize } = require('./models');
const { startRssSchedulers } = require('./services/rssScheduler');
const { socketInit } = require('./socket');
//const { startCron } = require('./cron/fetchCron');

const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
socketInit(server, app);

(async () => {
  try {
    console.log("DEBUG ENV:", {
      DB_HOST: process.env.DB_HOST,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME
    });  
    await sequelize.authenticate();
    console.log('DB authenticated');  
    await sequelize.sync({ alter: true });
    console.log('DB synced (tables created/updated)');
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
    await startRssSchedulers();
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
