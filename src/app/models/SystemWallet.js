import Sequelize, { Model } from "sequelize";
import { INTEGER } from "sequelize";
 
class SystemWallet extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: Sequelize.INTEGER,
          primaryKey:true,
        },
        name: Sequelize.STRING(),
        address: Sequelize.STRING(100),
        priv: Sequelize.STRING(100),
        token: Sequelize.STRING(100),
        host: Sequelize.STRING(100),
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default SystemWallet