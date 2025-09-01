module.exports = (sequelize, DataTypes) => {
    const ArticleComment = sequelize.define('ArticleComment', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      collectionId: { type: DataTypes.UUID, allowNull: false }, 
      articleId: { type: DataTypes.UUID, allowNull: false },
      userId: { type: DataTypes.UUID, allowNull: false },
  
      parentId: { type: DataTypes.UUID, allowNull: true },
      content: { type: DataTypes.TEXT, allowNull: false },
  
      isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
      editedAt: { type: DataTypes.DATE, allowNull: true },
      deletedAt: { type: DataTypes.DATE, allowNull: true },
  
      reactions: { type: DataTypes.JSONB, defaultValue: {} }
    }, {
      tableName: 'article_comments',
      timestamps: true,
      indexes: [
        { fields: ['articleId', 'createdAt'] },
        { fields: ['collectionId'] },
        { fields: ['parentId'] }
      ]
    });
  
    ArticleComment.associate = (models) => {
      ArticleComment.belongsTo(models.Collection, { foreignKey: 'collectionId' });
      ArticleComment.belongsTo(models.Article, { foreignKey: 'articleId' });
      ArticleComment.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
      ArticleComment.belongsTo(models.ArticleComment, { foreignKey: 'parentId', as: 'parent' });
      ArticleComment.hasMany(models.ArticleComment, { foreignKey: 'parentId', as: 'replies' });
    };
  
    return ArticleComment;
  };
  