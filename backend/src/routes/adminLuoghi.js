const express = require('express');
const { AdminLuogo, User, Luogo } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Accesso riservato al super admin' });
  }
  next();
};

// GET /api/admin-luoghi — elenco assegnazioni admin↔sede (solo super_admin)
router.get('/', auth, isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const assegnazioni = await AdminLuogo.findAll({
      include: [
        { model: User, attributes: ['id', 'email', 'full_name', 'role'] },
        { model: Luogo, attributes: ['id', 'nome'] },
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(assegnazioni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin-luoghi/users — utenti promuovibili/già admin (per il form di assegnazione)
router.get('/users', auth, isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { role: ['user', 'admin'] },
      attributes: ['id', 'email', 'full_name', 'role'],
      order: [['email', 'ASC']],
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin-luoghi — assegna un utente a una sede (lo promuove ad admin se serve)
router.post('/', auth, isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const { email, luogo_id } = req.body;
    if (!email || !luogo_id)
      return res.status(400).json({ error: 'email e luogo_id sono obbligatori' });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    if (user.role === 'super_admin')
      return res.status(400).json({ error: 'Il super admin ha già accesso a tutte le sedi' });

    const luogo = await Luogo.findByPk(luogo_id);
    if (!luogo) return res.status(404).json({ error: 'Sede non trovata' });

    const esistente = await AdminLuogo.findOne({ where: { user_id: user.id, luogo_id } });
    if (esistente) return res.status(409).json({ error: 'Utente già assegnato a questa sede' });

    if (user.role !== 'admin') await user.update({ role: 'admin' });
    const assegnazione = await AdminLuogo.create({ user_id: user.id, luogo_id });
    res.status(201).json(assegnazione);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/admin-luoghi/:id — rimuove un'assegnazione admin↔sede
router.delete('/:id', auth, isAdmin, isSuperAdmin, async (req, res) => {
  try {
    const assegnazione = await AdminLuogo.findByPk(req.params.id);
    if (!assegnazione) return res.status(404).json({ error: 'Assegnazione non trovata' });
    await assegnazione.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
