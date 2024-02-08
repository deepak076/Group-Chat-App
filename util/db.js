const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('gChat', 'root', 'dj25082001', {
    host: 'localhost',
    dialect: 'mysql',
});

module.exports = sequelize;