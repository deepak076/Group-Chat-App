// models/groupMembership.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const GroupMembership = sequelize.define('GroupMembership', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
});

module.exports = GroupMembership;
