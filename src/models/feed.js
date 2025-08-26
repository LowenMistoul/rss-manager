module.exports = (sequelize, DataTypes) => {
    const Feed = sequelize.define('Feed', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      url: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      categories: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
      updateFrequency: { type: DataTypes.INTEGER, defaultValue: 60 }, // en minutes
      status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
    }, { tableName: 'feeds', timestamps: true });
  
    Feed.associate = (models) => {
      Feed.belongsTo(models.Collection, { foreignKey: 'collectionId' });
      Feed.hasMany(models.Article, { foreignKey: 'feedId', onDelete: 'CASCADE' });
    };
  
    return Feed;
  };
  