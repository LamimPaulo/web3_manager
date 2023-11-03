'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.bulkInsert('system_wallets', 
    [
      {
        name: 'coinage',
        address: '0x70277FDe321D5427e6d527fc5c51D3BD2732D5a2',
        priv: '0x404d82cb50d7de925c1dd32d7f45475129d654c08a1ca3dbe6bb14f139c727fd',
        token: '$2b$10$HPWhu7dc5TEMYikcHMky9elnV/ltRTVUz/ipu/4WUErLT2Ije4KbC',
        host:'https://sandbox.coinage.trade',
      },
      {
        name: 'infinity',
        address: '0x56c57C0c0Bf1041f7672D51150B080c84616231B',
        priv: '0x4eca97308bbfaf3d88b3d72a548f753c21f9834140e715b4ae87acb7a317ad5f',
        token: '$2b$10$aeFWRkFKAmYD//3XEt0PmeHQ9VvZkIdliS6lmY3IhCh11/iwgCj.C',
        host:'https://hub.infinitypay.inf.br',
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
