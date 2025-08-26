// src/scripts/testModels.js
const path = require('path');
const { sequelize, User, Collection, Feed } = require(path.resolve(__dirname, '../models'));

(async () => {
  console.log('🟢 Starting test script...');

  try {
    // 1️⃣ Connect to DB
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // 2️⃣ Sync tables (force: true = drop & recreate)
    await sequelize.sync({ force: true });
    console.log('✅ Tables synced');

    // 3️⃣ Create a test user
    const user = await User.create({
      email: `user${Date.now()}@test.com`,
      password: 'password123',
      displayName: 'TestUser'
    });
    console.log('✅ User created:', user.toJSON());

    // 4️⃣ Create a collection
    const collection = await Collection.create({
      name: 'Tech News',
      description: 'Collection of tech RSS feeds',
      isShared: true,
      creatorId: user.id
    });
    console.log('✅ Collection created:', collection.toJSON());

    // 5️⃣ Create a feed
    const feed = await Feed.create({
      title: 'Le Monde Tech',
      url: 'https://www.lemonde.fr/rss/technologies.xml',
      collectionId: collection.id
    });
    console.log('✅ Feed created:', feed.toJSON());

    console.log('🎉 Test script finished successfully!');
  } catch (err) {
    console.error('❌ Error during test script:', err.message);
    console.error(err);
  } finally {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  }
})();
