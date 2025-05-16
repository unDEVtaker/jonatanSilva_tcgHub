'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.hasMany(models.Customer, {
        foreignKey: 'rol_id',
        as: 'customers'
      });
    }
  }

  Roles.init({
    nombre: DataTypes.STRING,
    descripcion: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Roles',
    underscored: true,
  });

  return Roles;
};
