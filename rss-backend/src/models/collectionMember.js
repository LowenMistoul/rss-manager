// src/models/collectionmember.js
module.exports = (sequelize, DataTypes) => {
  const CollectionMember = sequelize.define('CollectionMember', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    collectionId: { type: DataTypes.UUID, allowNull: false },
    userId: { type: DataTypes.UUID, allowNull: false },

    // rôle de l'utilisateur dans la collection :
    // 'owner' (créateur), 'admin' (peut gérer feeds/membres), 'member' (lecture/commentaire)
    role: {
      type: DataTypes.ENUM('owner', 'admin', 'member', 'viewer'),
      allowNull: false,
      defaultValue: 'member'
    },

    // statut de l'invitation/adhésion :
    // 'invited' (invitation envoyée), 'accepted', 'removed'
    status: {
      type: DataTypes.ENUM('invited', 'accepted', 'removed'),
      allowNull: false,
      defaultValue: 'accepted'
    },

    invitedBy: { type: DataTypes.UUID, allowNull: true }, // userId qui a invité
    invitedAt: { type: DataTypes.DATE, allowNull: true },
    acceptedAt: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'collection_members',
    timestamps: true,
    indexes: [
      { fields: ['collectionId'] },
      { fields: ['userId'] },
      { unique: true, fields: ['collectionId', 'userId'] } // éviter doublons
    ]
  });

  CollectionMember.associate = function(models) {
    CollectionMember.belongsTo(models.User, { foreignKey: 'userId' });
    CollectionMember.belongsTo(models.Collection, { foreignKey: 'collectionId' });
  };

  return CollectionMember;
};
