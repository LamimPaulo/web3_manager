'use strict';
 
module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.createTable("wallets",{
    id:{
      type: Sequelize.INTEGER,
      allowNull:false,
      autoIncrement: true,
      primaryKey:true
    },
    address:{
      type: Sequelize.STRING(),
      allowNull:false
    },
    priv: {
      type: Sequelize.STRING(),
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
  

  down: (queryInterface) => queryInterface.dropTable("wallets")
};