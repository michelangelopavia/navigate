const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email:       { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: true },
  full_name:   { type: DataTypes.STRING, allowNull: false },
  role:        { type: DataTypes.ENUM('user', 'admin', 'super_admin'), defaultValue: 'user' },
  provider:    { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local' },
  provider_id: { type: DataTypes.STRING, allowNull: true },
  avatar_url:  { type: DataTypes.STRING, allowNull: true },
  reset_token:         { type: DataTypes.STRING, allowNull: true },
  reset_token_expires: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'users',
  underscored: true,
});

module.exports = User;
