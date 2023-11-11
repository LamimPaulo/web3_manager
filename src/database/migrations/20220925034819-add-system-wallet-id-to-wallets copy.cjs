'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.addColumn("wallets", "system_wallet_id_", {
    type: Sequelize.INTEGER,
    // references: {
    //   model:{
    //     tableName: 'system_wallets',
    //   },
    //   key: 'id',
    // },
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
