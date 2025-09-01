module.exports = (sequelize, DataTypes) => {
    const Message = sequelize.define('Message', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      collectionId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: false },
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      editedAt: { type: DataTypes.DATE, allowNull: true },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
  
      
      reactions: { type: DataTypes.JSONB, defaultValue: {} }
    }, {
      tableName: 'messages',
      timestamps: true,
      indexes: [
        { fields: ['collectionId', 'createdAt'] },
        { fields: ['userId'] }
      ]
    });
  
    Message.associate = (models) => {
      Message.belongsTo(models.Collection, { foreignKey: 'collectionId' });
      Message.belongsTo(models.User, { foreignKey: 'userId'});
    };
  
    return Message;
  };
  