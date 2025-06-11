"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("products", "img", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "cardNumber" // Opcional: coloca la columna después de cardNumber si el motor lo soporta
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("products", "img");
  }
};
