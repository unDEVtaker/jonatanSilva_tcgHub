'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      nombre: {
        type: Sequelize.STRING
      },
      descripcion: {
        type: Sequelize.TEXT
      },
      set: {
        type: Sequelize.STRING
      },
      foiltype: {
        type: Sequelize.STRING
      },
      precio: {
        type: Sequelize.FLOAT
      },
      stock: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      api_id: {
        type: Sequelize.STRING
      },
      cardNumber: {
        type: Sequelize.STRING,
        field: 'cardNumber'
      },
      customer_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('products');
  }
};
