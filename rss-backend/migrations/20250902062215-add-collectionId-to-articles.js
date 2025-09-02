"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1️⃣ Ajouter la colonne en nullable
    await queryInterface.addColumn("articles", "collectionId", {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: "collections", key: "id" },
      onDelete: "CASCADE",
    });

    // 2️⃣ Remplir rétroactivement avec SQL
    await queryInterface.sequelize.query(`
      UPDATE articles a
      SET "collectionId" = f."collectionId"
      FROM feeds f
      WHERE a."feedId" = f.id
    `);

    // 3️⃣ Rendre obligatoire
    await queryInterface.changeColumn("articles", "collectionId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: { model: "collections", key: "id" },
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("articles", "collectionId");
  },
};
