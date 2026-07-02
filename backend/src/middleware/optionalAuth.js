const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Come auth.js, ma non blocca la richiesta se manca un token valido:
// attacca req.user quando possibile, altrimenti procede come utente anonimo.
const optionalAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) req.user = user;
    } catch {
      // token mancante/non valido: procedi come utente anonimo
    }
  }
  next();
};

module.exports = optionalAuth;
