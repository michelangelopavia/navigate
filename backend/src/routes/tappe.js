const express = require('express');
const { Tappa } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/tappe — pubblico, filtrabile per luogo_id, difficolta, attivo
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.id)        where.id = req.query.id;
    if (req.query.luogo_id)  where.luogo_id = req.query.luogo_id;
    if (req.query.difficolta) where.difficolta = req.query.difficolta;
    if (req.query.attivo !== undefined) where.attivo = parseBool(req.query.attivo);

    const tappe = await Tappa.findAll({ where, order: [['ordine', 'ASC']] });
    res.json(tappe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tappe/:id
router.get('/:id', async (req, res) => {
  try {
    const tappa = await Tappa.findByPk(req.params.id);
    if (!tappa) return res.status(404).json({ error: 'Non trovata' });
    res.json(tappa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/tappe — admin
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const tappa = await Tappa.create(req.body);
    res.status(201).json(tappa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/tappe/:id — admin
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const tappa = await Tappa.findByPk(req.params.id);
    if (!tappa) return res.status(404).json({ error: 'Non trovata' });
    await tappa.update(req.body);
    res.json(tappa);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tappe/:id — admin
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    const tappa = await Tappa.findByPk(req.params.id);
    if (!tappa) return res.status(404).json({ error: 'Non trovata' });
    await tappa.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
