const express = require('express');
const { Op } = require('sequelize');
const { RichiestaAiuto, Squadra, Tappa, Notifica } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;
const PUT_ALLOWED_FIELDS = ['risolta', 'risposta'];
const pick = (obj, fields) =>
  Object.fromEntries(fields.filter((f) => f in obj).map((f) => [f, obj[f]]));

// GET /api/richieste-aiuto — admin (solo della propria sede, se admin di sede)
router.get('/', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const where = {};
    if (req.query.risolta !== undefined) where.risolta = parseBool(req.query.risolta);
    if (req.query.squadra_id) where.squadra_id = req.query.squadra_id;

    let squadreScope = null;
    if (req.sedeIds) {
      squadreScope = await Squadra.findAll({ where: { luogo_id: req.sedeIds } });
      const scopedIds = squadreScope.map((s) => s.id);
      where.squadra_id = where.squadra_id
        ? (scopedIds.includes(where.squadra_id) ? where.squadra_id : { [Op.in]: [] })
        : { [Op.in]: scopedIds };
    }

    const richieste = await RichiestaAiuto.findAll({ where, order: [['created_at', 'DESC']] });

    // squadra_nome/tappa_titolo non sono colonne dirette: tappa_numero è la posizione
    // nel percorso della squadra (0-9), non un tappa_id — stesso principio già usato
    // per le Statistiche (backend/src/routes/statistiche.js)
    const squadraIds = [...new Set(richieste.map((r) => r.squadra_id).filter(Boolean))];
    const squadre = (squadreScope
      ? squadreScope.filter((s) => squadraIds.includes(s.id))
      : await Squadra.findAll({ where: { id: { [Op.in]: squadraIds } } })
    ).map((s) => s.toJSON());
    const squadraById = Object.fromEntries(squadre.map((s) => [s.id, s]));

    const tappaIds = [...new Set(
      richieste
        .map((r) => squadraById[r.squadra_id]?.percorso?.[r.tappa_numero])
        .filter(Boolean)
    )];
    const tappe = await Tappa.findAll({ where: { id: { [Op.in]: tappaIds } }, attributes: ['id', 'titolo'] });
    const tappaById = Object.fromEntries(tappe.map((t) => [t.id, t]));

    const arricchite = richieste.map((r) => {
      const squadra = squadraById[r.squadra_id];
      const tappaId = squadra?.percorso?.[r.tappa_numero];
      return {
        ...r.toJSON(),
        squadra_nome: squadra?.nome_squadra || null,
        tappa_titolo: tappaId ? (tappaById[tappaId]?.titolo || null) : null,
      };
    });

    res.json(arricchite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/richieste-aiuto/mie — giocatore, solo le richieste della propria squadra
// (usato da Gioca.jsx per far comparire la risposta dell'admin senza esporre l'endpoint admin)
router.get('/mie', auth, async (req, res) => {
  try {
    const { squadra_id } = req.query;
    if (!squadra_id) return res.status(400).json({ error: 'squadra_id richiesto' });

    const squadra = await Squadra.findByPk(squadra_id);
    if (!squadra || squadra.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Non autorizzato' });
    }

    const richieste = await RichiestaAiuto.findAll({ where: { squadra_id }, order: [['created_at', 'DESC']] });
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

    // Notifica in-app — solo in modalità evento, coerente con tappa_superata/gioco_completato
    const squadra = richiesta.squadra_id ? await Squadra.findByPk(richiesta.squadra_id) : null;
    if (squadra?.evento_id) {
      await Notifica.create({
        tipo: 'richiesta_aiuto',
        squadra_id: richiesta.squadra_id,
        squadra_nome: squadra.nome_squadra,
        evento_id: squadra.evento_id,
        messaggio: `🆘 ${squadra.nome_squadra} ha richiesto aiuto: ${richiesta.messaggio}`,
      });
    }

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
    await richiesta.update(pick(req.body, PUT_ALLOWED_FIELDS));
    res.json(richiesta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
