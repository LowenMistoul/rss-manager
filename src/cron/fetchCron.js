const cron = require('node-cron');
const { fetchAllFeeds } = require('../services/rssFetcher');

const startCron = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log('Début du fetch RSS...');
    await fetchAllFeeds();
  });
};

module.exports = { startCron };
