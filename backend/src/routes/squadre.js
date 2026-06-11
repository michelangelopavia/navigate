const express = require('express');
const { Op } = require('sequelize');
const { Squadra } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// Converte il parametro _sort in clause Sequelize
// Es: '-created_date' → [['created_at', 'DESC']], 'punteggio' → [['punteggio', 'ASC']]
const parseOrder = (sort) => {
  if (!sort) return [['created_at', 'DESC']];
  const desc = sort.startsWith('-');
  const field = sort.replace(/^-/, '').replace('created_date', 'created_at');
  return [[field, desc ? 'DESC' : 'ASC']];
};

// GET /api/squadre — pubblico in lettura (serve per classifiche)
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.id)        where.id = req.query.id;
    if (req.query.user_id)   where.user_id = req.query.user_id;
    if (req.query.luogo_id)  where.luogo_id = req.query.luogo_id;
    if (req.query.evento_id) where.evento_id = req.query.evento_id;
    if (req.query.tipo_gioco) where.tipo_gioco = req.query.tipo_gioco;
    if (req.query.completata !== undefined) where.completata = parseBool(req.query.completata);

    const options = {
      where,
      order: parseOrder(req.query._sort),
    };
    options.limit = Math.min(parseInt(req.query._limit) || 50, 200);

    const squadre = await Squadra.findAll(options);
    res.json(squadre);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/squadre/:id
router.get('/:id', async (req, res) => {
  try {
    const squadra = await Squadra.findByPk(req.params.id);
    if (!squadra) return res.status(404).json({ error: 'Non trovata' });
    res.json(squadra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/squadre — utente autenticato
router.post('/', auth, async (req, res) => {
  try {
    const squadra = await Squadra.create({ ...req.body, user_id: req.user.id });
    res.status(201).json(squadra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/squadre/:id — proprietario o admin
router.put('/:id', auth, async (req, res) => {
  try {
    const squadra = await Squadra.findByPk(req.params.id);
    if (!squadra) return res.status(404).json({ error: 'Non trovata' });

    if (req.user.role !== 'admin' && squadra.user_id !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    await squadra.update(req.body);
    res.json(squadra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/squadre/:id — proprietario o admin
router.delete('/:id', auth, async (req, res) => {
  try {
    const squadra = await Squadra.findByPk(req.params.id);
    if (!squadra) return res.status(404).json({ error: 'Non trovata' });

    if (req.user.role !== 'admin' && squadra.user_id !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    await squadra.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
