'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {
    static associate(models) {
      Customer.hasMany(models.History, {
        foreignKey: 'customer_id',
        as: 'histories',
      });
      Customer.belongsTo(models.Roles, {
        foreignKey: 'rol_id',
        as: 'role',
      });
      Customer.hasMany(models.Favorites, {
        foreignKey: 'customer_id',
        as: 'favorites',
      });
    }
  }

  Customer.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    contrasena: {
      type: DataTypes.STRING,
    },
    profile: {
      type: DataTypes.STRING,
    },
    rol_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 2,
      references: {
        model: 'roles',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    nick_name: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    sequelize,
    modelName: 'Customer',
    underscored: true,
    timestamps: true,
  });

  return Customer;
};