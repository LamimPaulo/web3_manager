import Sequelize, { Model } from "sequelize";
 
class NetworkKey extends Model {
    static init(sequelize) {
        super.init(
        {
            network_id: Sequelize.INTEGER(),
            key: Sequelize.STRING(100),
            is_active: Sequelize.BOOLEAN(),
            is_daily_expired: Sequelize.BOOLEAN(),
            url: Sequelize.STRING(100),
        },
        {
            sequelize,
        }
        );

        return this;
id    }
}

export default NetworkKey