'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn("network_keys", "url", {
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
