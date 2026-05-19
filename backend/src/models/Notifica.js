const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notifica = sequelize.define('Notifica', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tipo:         { type: DataTypes.STRING, allowNull: false },
  squadra_id:   { type: DataTypes.UUID, allowNull: true },
  squadra_nome: { type: DataTypes.STRING, allowNull: true },
  evento_id:    { type: DataTypes.UUID, allowNull: true },
  messaggio:    { type: DataTypes.TEXT, allowNull: false },
  letta:        { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'notifiche',
  underscored: true,
});

module.exports = Notifica;
