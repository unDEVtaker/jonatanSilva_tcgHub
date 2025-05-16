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
        model: 'customers',
        key: 'id',
      },
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'products',
        key: 'id',
      },
      primaryKey: true,
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