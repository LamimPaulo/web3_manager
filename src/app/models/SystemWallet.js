import Sequelize, { Model } from "sequelize";
 
class SystemWallet extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING(),
        address: Sequelize.STRING(100),
        priv: Sequelize.STRING(100),
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default SystemWallet