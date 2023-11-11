'use strict';

module.exports = {
  up: (queryInterface, Sequelize) =>
   queryInterface
   .addColumn("stakings",
    "reward_abi", {
      type: Sequelize.JSON(),
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
