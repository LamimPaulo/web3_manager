import Sequelize, { Model } from "sequelize";

class Staking extends Model {
    static init(sequelize) {
        super.init(
        {
            network_id: Sequelize.INTEGER,
            name: Sequelize.STRING(100),
            contract_address: Sequelize.TEXT('long'),
            contract_abi: Sequelize.JSON(),
            is_active: Sequelize.BOOLEAN(),
            reward_address: Sequelize.TEXT('long'),
            reward_abi: Sequelize.JSON(),
        },
        {
            sequelize,
            tableName: 'stakings',
        }
        );

        return this;
    }
}

export default Staking