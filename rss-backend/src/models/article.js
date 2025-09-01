module.exports = (sequelize, DataTypes) => {
    const Article = sequelize.define('Article', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      title: { type: DataTypes.STRING, allowNull: false },
      link: { type: DataTypes.STRING, allowNull: false },
      author: { type: DataTypes.STRING },
      pubDate: { type: DataTypes.DATE },
      contentSnippet: { type: DataTypes.TEXT },
      isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
      isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false },
      tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] } // <-- ajouté
    }, { 
      tableName: 'articles', 
      timestamps: true 
    });
  
    Article.associate = (models) => {
      Article.belongsTo(models.Feed, { foreignKey: 'feedId', as: 'feed' });
    };
  
    return Article;
  };
  