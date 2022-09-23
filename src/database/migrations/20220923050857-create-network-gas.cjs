'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("network_gas",{
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
    safe: {
      type: Sequelize.STRING(),
      defaultValue: '0',
    },
    propose:{
      type: Sequelize.STRING(),
      defaultValue: '0',
      allowNull:false
    },
    fast:{
      type: Sequelize.STRING(),
      defaultValue: '0',
      allowNull:false
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

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
