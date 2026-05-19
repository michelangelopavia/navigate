const express = require('express');
const { RichiestaAiuto } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/richieste-aiuto — admin
router.get('/', auth, isAdmin, async (req, res) => {
  try {
    const where = {};
    if (req.query.risolta !== undefined) where.risolta = parseBool(req.query.risolta);
    if (req.query.squadra_id) where.squadra_id = req.query.squadra_id;

    const richieste = await RichiestaAiuto.findAll({ where, order: [['created_at', 'DESC']] });
    res.json(richieste);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/richieste-aiuto — autenticato
router.post('/', auth, async (req, res) => {
  try {
    const richiesta = await RichiestaAiuto.create({
      ...req.body,
      user_email: req.user.email,
    });
    res.status(201).json(richiesta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/richieste-aiuto/:id — admin (risponde/risolve)
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const richiesta = await RichiestaAiuto.findByPk(req.params.id);
    if (!richiesta) return res.status(404).json({ error: 'Non trovata' });
    await richiesta.update(req.body);
    res.json(richiesta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
