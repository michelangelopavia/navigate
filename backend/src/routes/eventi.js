const express = require('express');
const { Evento } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/eventi — pubblico
router.get('/', async (req, res) => {
  try {
    const where = {};
    if (req.query.id)       where.id = req.query.id;
    if (req.query.luogo_id) where.luogo_id = req.query.luogo_id;
    if (req.query.attivo !== undefined)  where.attivo = parseBool(req.query.attivo);
    if (req.query.concluso !== undefined) where.concluso = parseBool(req.query.concluso);

    const eventi = await Evento.findAll({ where, order: [['data_inizio', 'ASC']] });
    res.json(eventi);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/eventi/:id
router.get('/:id', async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Non trovato' });
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/eventi — admin (solo sulla propria sede, se admin di sede)
router.post('/', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    if (req.sedeIds && !req.sedeIds.includes(req.body.luogo_id)) {
      return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
    }
    const evento = await Evento.create(req.body);
    res.status(201).json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/eventi/:id — admin (solo sulla propria sede, se admin di sede)
router.put('/:id', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Non trovato' });
    if (req.sedeIds && !req.sedeIds.includes(evento.luogo_id)) {
      return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
    }
    await evento.update(req.body);
    res.json(evento);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/eventi/:id — admin (solo sulla propria sede, se admin di sede)
router.delete('/:id', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const evento = await Evento.findByPk(req.params.id);
    if (!evento) return res.status(404).json({ error: 'Non trovato' });
    if (req.sedeIds && !req.sedeIds.includes(evento.luogo_id)) {
      return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
    }
    await evento.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
