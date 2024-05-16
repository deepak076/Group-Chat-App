// models\ArchivedChat.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');

const ArchivedChat = sequelize.define('archivedChat', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
    },

    message: {
        type: Sequelize.TEXT,
        allowNull: false,
    },

    userId: {
        type: Sequelize.INTEGER
    },

    groupId: {
        type: Sequelize.INTEGER
    }
});


module.exports = ArchivedChat;