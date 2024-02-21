// models/groupMembership.js
const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const GroupMembership = sequelize.define('GroupMembership', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    }
});

module.exports = GroupMembership;