const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Evento = sequelize.define('Evento', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nome:         { type: DataTypes.STRING, allowNull: false },
  nome_en:      { type: DataTypes.STRING, allowNull: true },
  descrizione:  { type: DataTypes.TEXT, allowNull: true },
  descrizione_en: { type: DataTypes.TEXT, allowNull: true },
  luogo_id:     { type: DataTypes.UUID, allowNull: false },
  data_inizio:  { type: DataTypes.DATE, allowNull: false },
  data_fine:    { type: DataTypes.DATE, allowNull: false },
  attivo:       { type: DataTypes.BOOLEAN, defaultValue: true },
  concluso:     { type: DataTypes.BOOLEAN, defaultValue: false },
  email_gestori: { type: DataTypes.JSON, defaultValue: [] },
  og_image_url: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'eventi',
  underscored: true,
});

module.exports = Evento;
