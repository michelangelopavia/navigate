const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Squadra = sequelize.define('Squadra', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nome_squadra: { type: DataTypes.STRING, allowNull: false },
  user_id:      { type: DataTypes.UUID, allowNull: false },
  tipo_gioco:   { type: DataTypes.ENUM('libero', 'evento'), allowNull: false },
  luogo_id:     { type: DataTypes.UUID, allowNull: false },
  evento_id:    { type: DataTypes.UUID, allowNull: true },
  percorso:     { type: DataTypes.JSON, defaultValue: [] },
  tappa_corrente: { type: DataTypes.INTEGER, defaultValue: 0 },
  completata:   { type: DataTypes.BOOLEAN, defaultValue: false },
  punteggio:    { type: DataTypes.INTEGER, defaultValue: 0 },
  tempo_inizio: { type: DataTypes.DATE, allowNull: true },
  tempo_fine:   { type: DataTypes.DATE, allowNull: true },
  tempo_inizio_tappa_corrente: { type: DataTypes.DATE, allowNull: true },
  tempi_tappe:   { type: DataTypes.JSON, defaultValue: [] },
  aiuti_usati:   { type: DataTypes.JSON, defaultValue: [] },
  tappe_saltate: { type: DataTypes.JSON, defaultValue: [] },
  errori_per_tappa: { type: DataTypes.JSON, defaultValue: [] },
  referente_nome:     { type: DataTypes.STRING, allowNull: true },
  referente_cognome:  { type: DataTypes.STRING, allowNull: true },
  referente_email:    { type: DataTypes.STRING, allowNull: true },
  referente_telefono: { type: DataTypes.STRING, allowNull: true },
  altri_giocatori: { type: DataTypes.JSON, defaultValue: [] },
}, {
  tableName: 'squadre',
  underscored: true,
});

module.exports = Squadra;
