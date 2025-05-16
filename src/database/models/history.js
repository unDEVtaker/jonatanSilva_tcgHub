'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class History extends Model {
    static associate(models) {
      History.belongsTo(models.Customer, {
        foreignKey: 'customer_id',
        as: 'customer',
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      });
    }
  }

  History.init({
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'customers', // Nombre de la tabla 'customers'
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    },
    total: DataTypes.FLOAT,
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
    modelName: 'History',
    underscored: true,
    timestamps: true,
  });

  return History;
};