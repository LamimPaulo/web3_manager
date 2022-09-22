'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("network_keys",{
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
      allowNull: false,
    },
    key:{
      type: Sequelize.STRING(),
      allowNull:false
    },
    is_active: {
      type: Sequelize.BOOLEAN(),
      defaultValue: true
    },
    is_daily_expired: {
      type: Sequelize.BOOLEAN(),
      defaultValue: false
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
