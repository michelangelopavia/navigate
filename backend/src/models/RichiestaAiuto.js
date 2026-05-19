const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RichiestaAiuto = sequelize.define('RichiestaAiuto', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  squadra_id:   { type: DataTypes.UUID, allowNull: false },
  user_email:   { type: DataTypes.STRING, allowNull: true },
  messaggio:    { type: DataTypes.TEXT, allowNull: false },
  risposta:     { type: DataTypes.TEXT, allowNull: true },
  risolta:      { type: DataTypes.BOOLEAN, defaultValue: false },
  tappa_numero: { type: DataTypes.INTEGER, allowNull: true },
}, {
  tableName: 'richieste_aiuto',
  underscored: true,
});

module.exports = RichiestaAiuto;
