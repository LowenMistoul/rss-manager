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
    await sequelize.authenticate();
    console.log('DB authenticated');
    await sequelize.sync({ alter: true });
    console.log('DB synced (tables created/updated)');
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
    await startRssSchedulers();
  } catch (err) {
    console.error('Unable to start server:', err);
    process.exit(1);
  }
})();
