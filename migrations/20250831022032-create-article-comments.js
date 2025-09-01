'use strict';

/** @type {import('sequelize-cli').Migration} */
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('article_comments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
        primaryKey: true,
        allowNull: false
      },
      collectionId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'collections', key: 'id' },
        onDelete: 'CASCADE'
      },
      articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'articles', key: 'id' },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      },
      parentId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'article_comments', key: 'id' },
        onDelete: 'CASCADE'
      },
      content: { type: Sequelize.TEXT, allowNull: false },
      isDeleted: { type: Sequelize.BOOLEAN, defaultValue: false },
      editedAt: { type: Sequelize.DATE },
      deletedAt: { type: Sequelize.DATE },
      reactions: { type: Sequelize.JSONB, defaultValue: {} },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn('NOW') }
    });

    await queryInterface.addIndex('article_comments', ['articleId', 'createdAt']);
    await queryInterface.addIndex('article_comments', ['collectionId']);
    await queryInterface.addIndex('article_comments', ['parentId']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('article_comments');
  }
};

