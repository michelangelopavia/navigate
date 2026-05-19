const express = require('express');
const { Luogo } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/luoghi  — pubblico, filtrabile per ?attivo=true&id=xxx
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.id)     where.id = req.query.id;
    if (req.query.attivo !== undefined) where.attivo = parseBool(req.query.attivo);

    const luoghi = await Luogo.findAll({ where, order: [['nome', 'ASC']] });
    res.json(luoghi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/luoghi/:id
router.get('/:id', async (req, res) => {
  try {
    const luogo = await Luogo.findByPk(req.params.id);
    if (!luogo) return res.status(404).json({ error: 'Non trovato' });
    res.json(luogo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/luoghi — admin
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const luogo = await Luogo.create(req.body);
    res.status(201).json(luogo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/luoghi/:id — admin
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const luogo = await Luogo.findByPk(req.params.id);
    if (!luogo) return res.status(404).json({ error: 'Non trovato' });
    await luogo.update(req.body);
    res.json(luogo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/luoghi/:id — admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const luogo = await Luogo.findByPk(req.params.id);
    if (!luogo) return res.status(404).json({ error: 'Non trovato' });
    await luogo.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
