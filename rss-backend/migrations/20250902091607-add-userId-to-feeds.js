"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Ajouter la colonne en nullable
    await queryInterface.addColumn("feeds", "userId", {
      type: Sequelize.UUID,
      allowNull: true, // temporairement
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    });
    await queryInterface.sequelize.query(`
      UPDATE feeds
      SET "userId" = c."creatorId"
      FROM collections c
      WHERE feeds."collectionId" = c.id
    `);

    // 3️⃣ Rendre obligatoire
    await queryInterface.changeColumn("feeds", "userId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("feeds", "userId");
  },
};
