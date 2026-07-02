const express = require('express');
const { Tappa } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const optionalAuth = require('../middleware/optionalAuth');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

const isReqAdmin = (req) => req.user?.role === 'admin' || req.user?.role === 'super_admin';

const stripRisposte = (t) => {
  const { risposta_corretta, risposte_alternative, risposta_corretta_en, risposte_alternative_en, ...safe } = t.toJSON();
  return safe;
};

// GET /api/tappe — pubblico, filtrabile per luogo_id, difficolta, attivo
// mostra le risposte corrette solo se chi chiama è un admin autenticato
router.get('/', optionalAuth, async (req, res) => {
  try {
    const where = {};
    if (req.query.id)        where.id = req.query.id;
    if (req.query.luogo_id)  where.luogo_id = req.query.luogo_id;
    if (req.query.difficolta) where.difficolta = req.query.difficolta;
    if (req.query.attivo !== undefined) where.attivo = parseBool(req.query.attivo);

    const tappe = await Tappa.findAll({ where, order: [['ordine', 'ASC']] });
    const admin = isReqAdmin(req);
    res.json(tappe.map(t => admin ? t.toJSON() : stripRisposte(t)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/tappe/:id — stesso criterio di visibilità della lista
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const tappa = await Tappa.findByPk(req.params.id);
    if (!tappa) return res.status(404).json({ error: 'Non trovata' });
    res.json(isReqAdmin(req) ? tappa.toJSON() : stripRisposte(tappa));
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

const normalizza = (str) =>
  str.trim().toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');

const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[b.length][a.length];
};

// POST /api/tappe/:id/verify-answer — autenticato
router.post('/:id/verify-answer', auth, async (req, res) => {
  try {
    const { risposta } = req.body;
    if (!risposta) return res.status(400).json({ error: 'risposta is required' });

    const tappa = await Tappa.findByPk(req.params.id);
    if (!tappa) return res.status(404).json({ error: 'Non trovata' });

    const inputNorm = normalizza(risposta);
    const risposteAccettate = [
      tappa.risposta_corretta,
      ...(tappa.risposte_alternative || []),
      tappa.risposta_corretta_en,
      ...(tappa.risposte_alternative_en || []),
    ].filter(Boolean);

    const correct = risposteAccettate.some(r => {
      const rNorm = normalizza(r);
      if (inputNorm === rNorm) return true;
      const maxErrori = rNorm.length <= 4 ? 1 : 2;
      return levenshtein(inputNorm, rNorm) <= maxErrori;
    });

    res.json({ correct });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
