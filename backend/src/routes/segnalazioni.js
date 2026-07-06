const express = require('express');
const { Op } = require('sequelize');
const { Segnalazione, Squadra } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

// GET /api/segnalazioni — admin (solo della propria sede, se admin di sede)
// Le segnalazioni non hanno luogo_id diretto: si risale tramite la squadra.
// Una segnalazione senza squadra_id non è attribuibile a nessuna sede,
// quindi resta visibile solo al super_admin.
router.get('/', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const where = {};
    if (req.sedeIds) {
      const squadreScope = await Squadra.findAll({ where: { luogo_id: req.sedeIds }, attributes: ['id'] });
      where.squadra_id = { [Op.in]: squadreScope.map((s) => s.id) };
    }
    const segnalazioni = await Segnalazione.findAll({ where, order: [['created_at', 'DESC']] });
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

// DELETE /api/segnalazioni/:id — admin (solo della propria sede, se admin di sede)
router.delete('/:id', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const s = await Segnalazione.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Non trovata' });
    if (req.sedeIds) {
      const squadra = s.squadra_id ? await Squadra.findByPk(s.squadra_id) : null;
      if (!squadra || !req.sedeIds.includes(squadra.luogo_id)) {
        return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
      }
    }
    await s.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
