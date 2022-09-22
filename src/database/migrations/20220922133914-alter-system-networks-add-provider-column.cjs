'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn("system_networks", "provider", {
    type: Sequelize.STRING(),
    allowNull:false,
  }),

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
