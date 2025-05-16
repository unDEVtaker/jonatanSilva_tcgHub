'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('states', [
      {
        id: 1,
        state: 'Near Mint',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        state: 'Lightly Played',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        state: 'Moderately Played',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 4,
        state: 'Heavily Played',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 5,
        state: 'Damaged',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('states', null, {});
  }
};
