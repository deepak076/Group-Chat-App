const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');
const ChatMessage = require('./chatMessage'); 

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

// User.hasMany(ChatMessage, { foreignKey: 'userId'});
User.hasMany(ChatMessage);
ChatMessage.belongsTo(User);
module.exports = User;