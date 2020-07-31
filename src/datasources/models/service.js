'use strict';
module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.STRING
    },
    name: DataTypes.STRING,
    startDate: DataTypes.DATE,
    endData: DataTypes.DATE,
    roleId: DataTypes.STRING,
    userId: DataTypes.STRING
  }, {});
  Service.associate = function({ User, Role }) {
    Service.belongsTo(User);
    Service.belongsTo(Role);
  };
  return Service;
};