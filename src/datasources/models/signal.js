'use strict';
module.exports = (sequelize, DataTypes) => {
  const Signal = sequelize.define('Signal', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.STRING
    },
    time: DataTypes.DATE,
    pair: DataTypes.STRING,
    op: DataTypes.STRING
  }, {});
  Signal.associate = function(models) {
    // associations can be defined here
  };
  return Signal;
};