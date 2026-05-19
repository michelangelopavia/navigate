const express = require('express');
const { ImpostazioniSito } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

// GET /api/impostazioni-sito — pubblico (serve per meta tags)
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.id) where.id = req.query.id;

    let impostazioni = await ImpostazioniSito.findAll({ where });
    // Se non esistono ancora, restituisce array vuoto (compatibile con Base44)
    res.json(impostazioni);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/impostazioni-sito — admin
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const imp = await ImpostazioniSito.create(req.body);
    res.status(201).json(imp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/impostazioni-sito/:id — admin
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const imp = await ImpostazioniSito.findByPk(req.params.id);
    if (!imp) return res.status(404).json({ error: 'Non trovato' });
    await imp.update(req.body);
    res.json(imp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
