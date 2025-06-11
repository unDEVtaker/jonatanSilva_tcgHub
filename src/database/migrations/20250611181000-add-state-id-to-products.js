"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("products", "state_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "states",
        key: "id"
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("products", "state_id");
  }
};
