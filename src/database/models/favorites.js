'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Favorites extends Model {
    static associate(models) {
      Favorites.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
      Favorites.belongsTo(models.Product, {
        foreignKey: 'product_id',
        as: 'product',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

  Favorites.init({
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'customers', // Nombre de la tabla 'customers'
        key: 'id',
      },
      primaryKey: true, // Clave primaria compuesta
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products', // Nombre de la tabla 'products'
        key: 'id',
      },
      primaryKey: true, // Clave primaria compuesta
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
    modelName: 'Favorites',
    underscored: true,
    timestamps: true,
  });

  return Favorites;
};