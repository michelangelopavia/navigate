const { User, AdminLuogo } = require('../models');

// Email degli admin assegnati a una sede specifica (array vuoto se nessuno)
const getSedeAdminEmails = async (luogo_id) => {
  if (!luogo_id) return [];
  const assegnazioni = await AdminLuogo.findAll({
    where: { luogo_id },
    include: [{ model: User, attributes: ['email'] }],
  });
  return assegnazioni.map((a) => a.User.email).filter(Boolean);
};

// Email di tutti i super_admin (fallback per sedi orfane, sempre in copia sulle segnalazioni)
const getSuperAdminEmails = async () => {
  const superAdmins = await User.findAll({ where: { role: 'super_admin' }, attributes: ['email'] });
  return superAdmins.map((u) => u.email);
};

module.exports = { getSedeAdminEmails, getSuperAdminEmails };
