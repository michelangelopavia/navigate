const express = require('express');
const { Notifica } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/notifiche — admin
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const where = {};
    if (req.query.letta !== undefined) where.letta = parseBool(req.query.letta);
    if (req.query.evento_id) where.evento_id = req.query.evento_id;

    const notifiche = await Notifica.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(notifiche);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notifiche — autenticato (il gioco crea notifiche)
router.post('/', auth, async (req, res) => {
  try {
    const notifica = await Notifica.create(req.body);
    res.status(201).json(notifica);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/notifiche/:id — admin (per marcare come letta)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const notifica = await Notifica.findByPk(req.params.id);
    if (!notifica) return res.status(404).json({ error: 'Non trovata' });
    await notifica.update(req.body);
    res.json(notifica);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notifiche/:id — admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const notifica = await Notifica.findByPk(req.params.id);
    if (!notifica) return res.status(404).json({ error: 'Non trovata' });
    await notifica.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
