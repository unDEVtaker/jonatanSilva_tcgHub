'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Customer, {
        through: 'Favorites',
        foreignKey: 'product_id',
        otherKey: 'customer_id',
        as: 'customersWhoFavorited',
      });
      Product.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'creator',
      });
      Product.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state',
      });
    }
  }

  Product.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    nombre: DataTypes.STRING,
    descripcion: {
      type: DataTypes.TEXT,
      field: 'descripcion',
    },
    set_name: {
      type: DataTypes.STRING,
      field: 'set',
    },
    foilType: {
      type: DataTypes.STRING,
      field: 'foiltype',
    },
    precio: DataTypes.FLOAT,
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    api_id: DataTypes.STRING,
    cardNumber: {
      type: DataTypes.STRING,
      field: 'cardNumber',
    },
    img: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'states',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'customers',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
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
    modelName: 'Product',
    underscored: true,
  });

  return Product;
};
