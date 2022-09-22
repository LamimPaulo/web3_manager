import Sequelize, { Model } from "sequelize";
 
class SystemNetwork extends Model {
    static init(sequelize) {
        super.init(
        {
            name: Sequelize.STRING(100),
            address: Sequelize.STRING(100),
            provider: Sequelize.STRING(100),
            is_active: Sequelize.BOOLEAN(),
        },
        {
            sequelize,
        }
        );

        return this;
    }
}

export default SystemNetwork