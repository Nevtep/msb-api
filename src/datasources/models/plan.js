'use strict';
module.exports = (sequelize, DataTypes) => {
  const Plan = sequelize.define('Plan', {
    label: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    duration: {
      type: DataTypes.TEXT,
      get: function (field) {
        console.log('data: ', this.dataValues)
        console.log('get: ', this.getDataValue(field))
        return JSON.parse(this.getDataValue(field));
      },
      set: function (value, field) {
        console.log('set: ', JSON.stringify(value))

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