'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    label: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    duration: {
      type: DataTypes.TEXT,
      get: function (field) {
        return JSON.parse(this.getDataValue(field));
      },
      set: function (value, field) {
        this.setDataValue(field, JSON.stringify(value));
      },
    },
    role: DataTypes.STRING
  }, {});
  Plan.associate = function(models) {
    // Plan.hasMany(models.Role)
  };
  return Plan;
};