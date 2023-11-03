'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.bulkInsert('system_networks', 
    [
      {
        id: 1,
        name: 'BEP20',
        address: '0.001',
        is_active: true,
        provider:'https://data-seed-prebsc-1-s1.binance.org:8545/',
      },
      {
        id: 2,
        name: 'ERC20',
        address: '0.025',
        is_active: true,
        provider:'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
      },
      {
        id: 3,
        name: 'POLYGON',
        address: '0.001',
        is_active: true,
        provider:'https://rpc-mumbai.maticvigil.com/',
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
