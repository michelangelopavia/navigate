const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ImpostazioniSito = sequelize.define('ImpostazioniSito', {
  id:               { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  og_title:         { type: DataTypes.STRING, allowNull: true },
  og_description:   { type: DataTypes.TEXT, allowNull: true },
  og_image_url:     { type: DataTypes.STRING, allowNull: true },
  meta_description: { type: DataTypes.TEXT, allowNull: true },
  site_name:        { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'impostazioni_sito',
  underscored: true,
});

module.exports = ImpostazioniSito;
