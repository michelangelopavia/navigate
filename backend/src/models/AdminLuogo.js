const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminLuogo = sequelize.define('AdminLuogo', {
  id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id:  { type: DataTypes.UUID, allowNull: false },
  luogo_id: { type: DataTypes.UUID, allowNull: false },
}, {
  tableName: 'admin_luoghi',
  underscored: true,
  indexes: [{ unique: true, fields: ['user_id', 'luogo_id'] }],
});

module.exports = AdminLuogo;
