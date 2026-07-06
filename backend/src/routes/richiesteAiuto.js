const express = require('express');
const { Op } = require('sequelize');
const { RichiestaAiuto, Squadra } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

// GET /api/richieste-aiuto — admin (solo della propria sede, se admin di sede)
router.get('/', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const where = {};
    if (req.query.risolta !== undefined) where.risolta = parseBool(req.query.risolta);
    if (req.query.squadra_id) where.squadra_id = req.query.squadra_id;

    if (req.sedeIds) {
      const squadreScope = await Squadra.findAll({ where: { luogo_id: req.sedeIds }, attributes: ['id'] });
      const scopedIds = squadreScope.map((s) => s.id);
      where.squadra_id = where.squadra_id
        ? (scopedIds.includes(where.squadra_id) ? where.squadra_id : { [Op.in]: [] })
        : { [Op.in]: scopedIds };
    }

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

// PUT /api/richieste-aiuto/:id — admin (risponde/risolve, solo della propria sede se admin di sede)
router.put('/:id', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const richiesta = await RichiestaAiuto.findByPk(req.params.id);
    if (!richiesta) return res.status(404).json({ error: 'Non trovata' });
    if (req.sedeIds) {
      const squadra = richiesta.squadra_id ? await Squadra.findByPk(richiesta.squadra_id) : null;
      if (!squadra || !req.sedeIds.includes(squadra.luogo_id)) {
        return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
      }
    }
    await richiesta.update(req.body);
    res.json(richiesta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
