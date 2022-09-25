import Sequelize, { Model } from "sequelize";
 
class Wallet extends Model {
  static init(sequelize) {
    super.init(
      {
        address: Sequelize.STRING(100),
        priv: Sequelize.STRING(100),
        system_wallet_id: Sequelize.INTEGER,
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default Wallet