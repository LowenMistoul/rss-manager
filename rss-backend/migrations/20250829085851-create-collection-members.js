"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("collection_members", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      role: {
        type: Sequelize.ENUM("admin", "editor", "viewer"),
        allowNull: false,
        defaultValue: "viewer",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE",
      },
      collection_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "collections", key: "id" },
        onDelete: "CASCADE",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("collection_members");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_collection_members_role";');
  },
};
