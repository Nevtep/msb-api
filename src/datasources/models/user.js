'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('user', {
    id: DataTypes.STRING,
    fullName: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    verified: DataTypes.BOOLEAN
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};