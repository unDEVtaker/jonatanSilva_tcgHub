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
      Product.belongsTo(models.Customer, { // Nueva asociación: Product belongsTo Customer
        foreignKey: 'customer_id',
        as: 'creator', // Alias para la relación
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
    descripcion: DataTypes.TEXT,
    set_name: {
      type: DataTypes.STRING,
      field: 'set', // Mapea a la columna 'set' en la base de datos
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
    customer_id: { // Nueva columna para la clave foránea
      type: DataTypes.INTEGER,
      allowNull: true, // Permite nulos, o false si cada producto DEBE tener un creador
      references: {
        model: 'customers', // Nombre de la tabla
        key: 'id',         // Clave primaria de la tabla Customers
      },
      onUpdate: 'CASCADE', // Define el comportamiento al actualizar el Customer
      onDelete: 'SET NULL',  // Define el comportamiento al eliminar el Customer (o 'RESTRICT', 'CASCADE', etc.)
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
