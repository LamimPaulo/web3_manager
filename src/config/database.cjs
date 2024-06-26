require('dotenv').config();
module.exports = {
  host: process.env.DB_HOST,
  dialect: process.env.DB_DIALECT,
    username: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME,
    logging: false,
    define: {
      timestamps: true,
      underscored: true,
      underscoredAll: true,
    },
}