import Sequelize from 'sequelize';
import databaseConfig from '../config/database.cjs';
import Wallet from '../app/models/Wallet.js'
import Token from '../app/models/Token.js'
import SystemWallet from '../app/models/SystemWallet.js'
import SystemNetwork from '../app/models/SystemNetwork.js'
import NetworkKey from '../app/models/NetworkKey.js'
const models = [Wallet, SystemWallet, SystemNetwork, NetworkKey, Token];

class Database {
  constructor(){
      this.init();
  }
  init(){
    this.connection = new Sequelize(databaseConfig);
    models.map((model) => model.init(this.connection))
      .map((model) => {
          if(model.associate) model.associate(this.connection.models);
          return model;
      })
  }
}

export default new Database();