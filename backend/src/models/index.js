const sequelize = require('../config/database');
const User            = require('./User');
const Luogo           = require('./Luogo');
const Tappa           = require('./Tappa');
const Evento          = require('./Evento');
const Squadra         = require('./Squadra');
const Notifica        = require('./Notifica');
const RichiestaAiuto  = require('./RichiestaAiuto');
const Segnalazione    = require('./Segnalazione');
const ImpostazioniSito = require('./ImpostazioniSito');
const AdminLuogo      = require('./AdminLuogo');

// Associazioni
Luogo.hasMany(Tappa,   { foreignKey: 'luogo_id', onDelete: 'CASCADE' });
Tappa.belongsTo(Luogo, { foreignKey: 'luogo_id' });

Luogo.hasMany(Evento,   { foreignKey: 'luogo_id' });
Evento.belongsTo(Luogo, { foreignKey: 'luogo_id' });

User.hasMany(Squadra,    { foreignKey: 'user_id' });
Squadra.belongsTo(User,  { foreignKey: 'user_id' });

Luogo.hasMany(Squadra,   { foreignKey: 'luogo_id' });
Squadra.belongsTo(Luogo, { foreignKey: 'luogo_id' });

Evento.hasMany(Squadra,   { foreignKey: 'evento_id' });
Squadra.belongsTo(Evento, { foreignKey: 'evento_id' });

// Admin di sede: relazione molti-a-molti tra User (admin) e Luogo
User.belongsToMany(Luogo, { through: AdminLuogo, foreignKey: 'user_id', otherKey: 'luogo_id', as: 'sedi' });
Luogo.belongsToMany(User, { through: AdminLuogo, foreignKey: 'luogo_id', otherKey: 'user_id', as: 'admins' });
User.hasMany(AdminLuogo,    { foreignKey: 'user_id' });
AdminLuogo.belongsTo(User,  { foreignKey: 'user_id' });
Luogo.hasMany(AdminLuogo,   { foreignKey: 'luogo_id' });
AdminLuogo.belongsTo(Luogo, { foreignKey: 'luogo_id' });

module.exports = {
  sequelize,
  User,
  Luogo,
  Tappa,
  Evento,
  Squadra,
  Notifica,
  RichiestaAiuto,
  Segnalazione,
  ImpostazioniSito,
  AdminLuogo,
};
