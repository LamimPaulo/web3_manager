'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("stakings", {
    id:{
      type: Sequelize.INTEGER,
      allowNull:false,
      autoIncrement: true,
      primaryKey:true
    },
    network_id: {
      type: Sequelize.INTEGER,
      references: {
        model:{
          tableName: 'system_networks',
        },
        key: 'id',
      },
    },
    name: {
      type: Sequelize.STRING(),
      allowNull: false,
    },
    contract_address:{
      type: Sequelize.STRING(),
      allowNull:false
    },
    contract_abi:{
      type: Sequelize.JSON(),
      allowNull:false
    },
    is_active: {
      type: Sequelize.BOOLEAN(),
      defaultValue: true
    },
    created_at: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    },
    updated_at: {
      type: 'TIMESTAMP',
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      allowNull: false
    }
  }),

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
