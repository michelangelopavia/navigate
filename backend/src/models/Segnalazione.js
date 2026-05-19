const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Segnalazione = sequelize.define('Segnalazione', {
  id:         { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_email: { type: DataTypes.STRING, allowNull: true },
  squadra_id: { type: DataTypes.UUID, allowNull: true },
  descrizione: { type: DataTypes.TEXT, allowNull: false },
}, {
  tableName: 'segnalazioni',
  underscored: true,
});

module.exports = Segnalazione;
