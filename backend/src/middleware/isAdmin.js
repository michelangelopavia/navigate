const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Accesso riservato agli amministratori' });
  }
  next();
};

module.exports = isAdmin;
