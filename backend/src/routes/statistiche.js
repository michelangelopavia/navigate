const express = require('express');
const { Squadra, Tappa, Luogo } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

const pct = (n, tot) => (tot ? Math.round((n / tot) * 100) : null);

// GET /api/statistiche/tappe — admin (solo delle proprie sedi, se admin di sede)
// Filtro opzionale ?evento_id= per limitare l'aggregazione a un singolo evento.
//
// errori_per_tappa/tappe_saltate/aiuti_usati sono indicizzati per POSIZIONE nel
// percorso della squadra (0-9), non per tappa_id diretto — ogni squadra ha un
// percorso diverso (generato casualmente), quindi si risale al tappa_id reale
// tramite percorso[i] prima di aggregare. Si considerano "giocate" solo le
// tappe fino a tappa_corrente (escluse), coerente con come CompletamentoCard.jsx
// calcola le tappe completate altrove nell'app.
router.get('/tappe', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const luoghiWhere = req.sedeIds ? { id: req.sedeIds } : {};
    const luoghi = await Luogo.findAll({ where: luoghiWhere, attributes: ['id', 'nome'] });
    const luogoIds = luoghi.map((l) => l.id);

    const tappe = await Tappa.findAll({ where: { luogo_id: luogoIds }, attributes: ['id', 'titolo', 'luogo_id'] });
    const tappaById = Object.fromEntries(tappe.map((t) => [t.id, t]));

    const squadreWhere = { luogo_id: luogoIds };
    if (req.query.evento_id) squadreWhere.evento_id = req.query.evento_id;
    const squadre = (await Squadra.findAll({ where: squadreWhere })).map((s) => s.toJSON());

    const stats = {};
    for (const squadra of squadre) {
      const percorso = squadra.percorso || [];
      const erroriPerTappa = squadra.errori_per_tappa || [];
      const tappeSaltate = squadra.tappe_saltate || [];
      const aiutiUsati = squadra.aiuti_usati || [];

      for (let i = 0; i < squadra.tappa_corrente; i++) {
        const tappaId = percorso[i];
        if (!tappaId || !tappaById[tappaId]) continue;

        if (!stats[tappaId]) stats[tappaId] = { giocata: 0, sbagliata: 0, saltata: 0, aiuto: 0 };
        stats[tappaId].giocata += 1;
        if ((erroriPerTappa[i] || 0) > 0) stats[tappaId].sbagliata += 1;
        if (tappeSaltate.includes(i)) stats[tappaId].saltata += 1;
        if (aiutiUsati.includes(i)) stats[tappaId].aiuto += 1;
      }
    }

    const risultato = luoghi.map((luogo) => ({
      luogo_id: luogo.id,
      luogo_nome: luogo.nome,
      tappe: tappe
        .filter((t) => t.luogo_id === luogo.id)
        .map((t) => {
          const s = stats[t.id] || { giocata: 0, sbagliata: 0, saltata: 0, aiuto: 0 };
          return {
            tappa_id: t.id,
            titolo: t.titolo,
            giocata: s.giocata,
            sbagliata: s.sbagliata,
            saltata: s.saltata,
            aiuto: s.aiuto,
            pct_sbagliata: pct(s.sbagliata, s.giocata),
            pct_saltata: pct(s.saltata, s.giocata),
            pct_aiuto: pct(s.aiuto, s.giocata),
          };
        }),
    }));

    res.json(risultato);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
