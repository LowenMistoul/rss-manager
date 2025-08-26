module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define('Collection', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      isShared: { type: DataTypes.BOOLEAN, defaultValue: false }
    }, { tableName: 'collections', timestamps: true });
  
    Collection.associate = (models) => {
      Collection.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
      Collection.hasMany(models.Feed, { foreignKey: 'collectionId', onDelete: 'CASCADE' });
    };
  
    return Collection;
  };
  