import Sequelize, { Model } from "sequelize";

class NetworkGas extends Model {
    static init(sequelize) {
        super.init(
        {
            network_id: Sequelize.INTEGER(),
            safe: Sequelize.STRING(100),
            propose: Sequelize.STRING(100),
            fast: Sequelize.STRING(100),
        },
        {
            sequelize,
        }
        );

        return this;
id    }
}

export default NetworkGas