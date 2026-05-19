const express = require('express');
const { Segnalazione } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// GET /api/segnalazioni — admin
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const segnalazioni = await Segnalazione.findAll({ order: [['created_at', 'DESC']] });
    res.json(segnalazioni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/segnalazioni — pubblico (anche utenti non loggati possono segnalare)
router.post('/', async (req, res) => {
  try {
    const segnalazione = await Segnalazione.create(req.body);
    res.status(201).json(segnalazione);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/segnalazioni/:id — admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const s = await Segnalazione.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Non trovata' });
    await s.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
