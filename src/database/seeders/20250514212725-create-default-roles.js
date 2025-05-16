'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Roles', [
      {
        nombre: 'admin',
        descripcion: 'Administrador del sistema',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'user',
        descripcion: 'Usuario general del sistema',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        nombre: 'auditor',
        descripcion: 'Usuario con permisos de auditoría',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', {
      nombre: ['admin', 'user', 'auditor']
    }, {});
  }
};
