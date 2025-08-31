'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('articles', 'tags', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      defaultValue: []
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('articles', 'tags');
  }
};

