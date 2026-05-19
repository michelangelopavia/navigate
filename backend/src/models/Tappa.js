const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tappa = sequelize.define('Tappa', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  luogo_id:     { type: DataTypes.UUID, allowNull: false },
  titolo:       { type: DataTypes.STRING, allowNull: true },
  titolo_en:    { type: DataTypes.STRING, allowNull: true },
  difficolta:   { type: DataTypes.ENUM('facile', 'media', 'difficile'), allowNull: false },
  indovinello:  { type: DataTypes.TEXT, allowNull: false },
  indovinello_en: { type: DataTypes.TEXT, allowNull: true },
  risposta_corretta: { type: DataTypes.STRING, allowNull: false },
  risposte_alternative: { type: DataTypes.JSON, defaultValue: [] },
  suggerimento:   { type: DataTypes.TEXT, allowNull: true },
  suggerimento_en: { type: DataTypes.TEXT, allowNull: true },
  approfondimento:   { type: DataTypes.TEXT, allowNull: true },
  approfondimento_en: { type: DataTypes.TEXT, allowNull: true },
  ordine: { type: DataTypes.INTEGER, defaultValue: 0 },
  attivo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'tappe',
  underscored: true,
});

module.exports = Tappa;
