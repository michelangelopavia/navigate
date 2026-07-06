const { AdminLuogo } = require('../models');

// Da usare DOPO isAdmin. Attacca req.sedeIds:
// - null per super_admin (nessuna restrizione, accesso globale)
// - array di luogo_id (anche vuoto) per admin di sede
const scopeToSedi = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      req.sedeIds = null;
      return next();
    }

    const assegnazioni = await AdminLuogo.findAll({
      where: { user_id: req.user.id },
      attributes: ['luogo_id'],
    });
    req.sedeIds = assegnazioni.map((a) => a.luogo_id);
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = scopeToSedi;
