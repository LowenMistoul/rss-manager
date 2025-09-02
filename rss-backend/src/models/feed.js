module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      categories: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      updateFrequency: { type: DataTypes.INTEGER, defaultValue: 60 }, // minutes
      status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' },
      lastFetchedAt: { type: DataTypes.DATE, allowNull: true },
      failedAttempts: { type: DataTypes.INTEGER, defaultValue: 0 },
      lastError: { type: DataTypes.TEXT, allowNull: true },
      userId: {type: DataTypes.UUID,allowNull: false}
    }, { tableName: 'feeds', timestamps: true });
  
    Feed.associate = (models) => {
      Feed.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' });
      Feed.belongsTo(models.Collection, { foreignKey: 'collectionId' });
      Feed.hasMany(models.Article, { foreignKey: 'feedId', onDelete: 'CASCADE' });
    };
  
    return Feed;
  };
  