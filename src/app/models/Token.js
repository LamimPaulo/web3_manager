import Sequelize, { Model } from "sequelize";

class Token extends Model {
    static init(sequelize) {
        super.init(
        {
            network_id: Sequelize.INTEGER,
            name: Sequelize.STRING(100),
            contract_address: Sequelize.TEXT('long'),
            contract_abi: Sequelize.JSON(),
            is_active: Sequelize.BOOLEAN(),
        },
        {
            sequelize,
        }
        );

        return this;
    }
}

export default Token