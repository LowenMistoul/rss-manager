module.exports = (sequelize, DataTypes) => {
    const Collection = sequelize.define('Collection', {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT },
      isShared: { type: DataTypes.BOOLEAN, defaultValue: false },
      creatorId: { type: DataTypes.UUID, allowNull: false }
    }, {
      tableName: 'collections',
      timestamps: true
    });
  
    Collection.associate = function(models) {
      Collection.belongsTo(models.User, { as: 'creator', foreignKey: 'creatorId' });
  
      Collection.belongsToMany(models.User, {
        through: models.CollectionMember,
        foreignKey: 'collectionId',
        otherKey: 'userId',
        as: 'members'
      });
  
      if (models.Feed) {
        Collection.hasMany(models.Feed, { foreignKey: 'collectionId' });
      }
    };

    Collection.associate = function (models) {
        Collection.hasMany(models.CollectionMember, {
          foreignKey: "collectionId",
          as: "members",
        });
      };
      
  
    return Collection;
  };
  