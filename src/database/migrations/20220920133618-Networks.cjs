'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("system_networks",{
    id:{
      type: Sequelize.INTEGER,
      allowNull:false,
      autoIncrement: true,
      primaryKey:true
    },
    name: {
      type: Sequelize.STRING(),
      allowNull: false,
    },
    address:{
      type: Sequelize.STRING(),
      allowNull:false
    },
    is_active: {
      type: Sequelize.BOOLEAN(),
      allowNull: false
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
