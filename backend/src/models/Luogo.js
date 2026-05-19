const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Luogo = sequelize.define('Luogo', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  nome:         { type: DataTypes.STRING, allowNull: false },
  nome_en:      { type: DataTypes.STRING, allowNull: true },
  descrizione:  { type: DataTypes.TEXT, allowNull: true },
  descrizione_en: { type: DataTypes.TEXT, allowNull: true },
  citta:        { type: DataTypes.STRING, allowNull: true },
  attivo:       { type: DataTypes.BOOLEAN, defaultValue: true },
  immagine_url: { type: DataTypes.STRING, allowNull: true },
}, {
  tableName: 'luoghi',
  underscored: true,
});

module.exports = Luogo;
