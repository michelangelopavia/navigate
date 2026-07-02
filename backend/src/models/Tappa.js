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
  risposta_corretta_en: { type: DataTypes.STRING, allowNull: true },
  risposte_alternative: { type: DataTypes.JSON, defaultValue: [] },
  risposte_alternative_en: { type: DataTypes.JSON, defaultValue: [] },
  suggerimento:   { type: DataTypes.TEXT, allowNull: true },
  suggerimento_en: { type: DataTypes.TEXT, allowNull: true },
  approfondimento:   { type: DataTypes.TEXT, allowNull: true },
  approfondimento_en: { type: DataTypes.TEXT, allowNull: true },
  immagine_url: { type: DataTypes.STRING, allowNull: true },
  associazione: { type: DataTypes.STRING, allowNull: true },
  link_associazione: { type: DataTypes.STRING, allowNull: true },
  ordine: { type: DataTypes.INTEGER, defaultValue: 0 },
  attivo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'tappe',
  underscored: true,
});

Tappa.prototype.toJSON = function () {
  const values = this.get({ plain: true });
  if (typeof values.risposte_alternative === 'string') {
    try { values.risposte_alternative = JSON.parse(values.risposte_alternative); } catch { /* lascia invariato */ }
  }
  if (typeof values.risposte_alternative_en === 'string') {
    try { values.risposte_alternative_en = JSON.parse(values.risposte_alternative_en); } catch { /* lascia invariato */ }
  }
  return values;
};

module.exports = Tappa;
