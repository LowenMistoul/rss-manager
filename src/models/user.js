const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
    password: { type: DataTypes.STRING },
    googleId: { type: DataTypes.STRING },
    githubId: { type: DataTypes.STRING },
    microsoftId: { type: DataTypes.STRING },
    displayName: { type: DataTypes.STRING },
    provider: { type: DataTypes.STRING, defaultValue: 'local' }
  }, {
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  User.prototype.verifyPassword = function (plain) {
    return bcrypt.compare(plain, this.password);
  };

  User.associate = function (models) {
    User.hasMany(models.CollectionMember, {
      foreignKey: "userId",
      as: "memberships",
    });
  };  

  return User;
};
