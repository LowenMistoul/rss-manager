'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const TABLE_NAME = 'users'; 
    const table = await queryInterface.describeTable(TABLE_NAME);

    const ops = [];

    if (!table.googleId && !table.google_id) {
      ops.push(queryInterface.addColumn(TABLE_NAME, 'googleId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      }));
    }
    if (!table.githubId && !table.github_id) {
      ops.push(queryInterface.addColumn(TABLE_NAME, 'githubId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      }));
    }
    if (!table.microsoftId && !table.microsoft_id) {
      ops.push(queryInterface.addColumn(TABLE_NAME, 'microsoftId', {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      }));
    }

    await Promise.all(ops);
  },

  async down(queryInterface, Sequelize) {
    const TABLE_NAME = 'Users'; // ← idem qu'au-dessus
    const table = await queryInterface.describeTable(TABLE_NAME);

    const ops = [];

    if (table.googleId || table.google_id) {
      ops.push(queryInterface.removeColumn(TABLE_NAME, 'googleId'));
    }
    if (table.githubId || table.github_id) {
      ops.push(queryInterface.removeColumn(TABLE_NAME, 'githubId'));
    }
    if (table.microsoftId || table.microsoft_id) {
      ops.push(queryInterface.removeColumn(TABLE_NAME, 'microsoftId'));
    }

    await Promise.all(ops);
  }
};
