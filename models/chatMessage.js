// models/chatMessage.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const ChatMessage = sequelize.define('ChatMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users', // or 'users', depending on how Sequelize has named your table
            key: 'id',
        },
    },
});

module.exports = ChatMessage;
