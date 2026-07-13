const express = require('express');
const { Op } = require('sequelize');
const { Squadra, Evento, Tappa } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const scopeToSedi = require('../middleware/scopeToSedi');
const { sendEmail } = require('../services/email');
const { wrapEmail } = require('../services/emailTemplate');
const { getSedeAdminEmails, getSuperAdminEmails } = require('../services/adminEmails');

const router = express.Router();

const parseBool = (v) => v === 'true' ? true : v === 'false' ? false : v;

const isReqAdmin = (req) => req.user?.role === 'admin' || req.user?.role === 'super_admin';

// Un admin di sede può agire solo sulle squadre della propria sede; super_admin non ha limiti (req.sedeIds === null)
const isSedeAllowed = (req, luogoId) => req.sedeIds === null || req.sedeIds.includes(luogoId);

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

const POST_ALLOWED_FIELDS = [
  'nome_squadra', 'tipo_gioco', 'luogo_id', 'evento_id',
  'referente_nome', 'referente_cognome', 'referente_email', 'referente_telefono',
  'altri_giocatori',
];

const PUT_ALLOWED_FIELDS = [
  'tappa_corrente', 'completata', 'punteggio',
  'tempi_tappe', 'aiuti_usati', 'tappe_saltate',
  'errori_per_tappa',
];

const pick = (obj, fields) =>
  Object.fromEntries(fields.filter(f => f in obj).map(f => [f, obj[f]]));

// POST /api/squadre — utente autenticato
router.post('/', auth, async (req, res) => {
  try {
    const data = pick(req.body, POST_ALLOWED_FIELDS);

    const tappe = await Tappa.findAll({
      where: { luogo_id: data.luogo_id, attivo: true },
      attributes: ['id', 'difficolta'],
    });

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);
    const facili    = shuffle(tappe.filter(t => t.difficolta === 'facile')).slice(0, 4).map(t => t.id);
    const medie     = shuffle(tappe.filter(t => t.difficolta === 'media')).slice(0, 4).map(t => t.id);
    const difficili = shuffle(tappe.filter(t => t.difficolta === 'difficile')).slice(0, 2).map(t => t.id);

    if (facili.length < 4 || medie.length < 4 || difficili.length < 2) {
      return res.status(422).json({ error: 'Tappe insufficienti per generare un percorso' });
    }

    const percorso = [...facili, ...medie, ...difficili];
    const squadra = await Squadra.create({ ...data, user_id: req.user.id, percorso });

    // Email di iscrizione all'admin della sede (fallback super_admin solo se la sede è orfana),
    // più email_gestori se è un'iscrizione a un evento. Non deve mai far fallire la creazione.
    try {
      const sedeEmails = await getSedeAdminEmails(data.luogo_id);
      const destinatari = new Set(sedeEmails.length ? sedeEmails : await getSuperAdminEmails());
      if (data.evento_id) {
        const evento = await Evento.findByPk(data.evento_id);
        (evento?.email_gestori || []).forEach((e) => destinatari.add(e));
      }

      for (const to of destinatari) {
        await sendEmail({
          to,
          subject: `Nuova iscrizione: ${data.nome_squadra}`,
          body: wrapEmail({
            title: `Nuova squadra iscritta ${data.evento_id ? 'all\'evento' : 'in gioco libero'}`,
            contentHtml: `
              <p><strong>Squadra:</strong> ${data.nome_squadra}</p>
              <p><strong>Referente:</strong> ${data.referente_nome} ${data.referente_cognome}</p>
              <p><strong>Email:</strong> ${data.referente_email}</p>
              <p><strong>Telefono:</strong> ${data.referente_telefono || 'N/D'}</p>
              <p><strong>Numero giocatori:</strong> ${(data.altri_giocatori?.length || 0) + 1}</p>
              <hr>
              <p>Data iscrizione: ${new Date().toLocaleString('it-IT')}</p>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error('Errore invio email iscrizione:', emailErr.message);
    }

    res.status(201).json(squadra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/squadre/:id — proprietario o admin (di sede: solo squadre della propria sede)
router.put('/:id', auth, scopeToSedi, async (req, res) => {
  try {
    const squadra = await Squadra.findByPk(req.params.id);
    if (!squadra) return res.status(404).json({ error: 'Non trovata' });

    if (!isReqAdmin(req) && squadra.user_id !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    if (isReqAdmin(req) && !isSedeAllowed(req, squadra.luogo_id))
      return res.status(403).json({ error: 'Non autorizzato per questa sede' });

    if (!isReqAdmin(req) && squadra.evento_id) {
      const evento = await Evento.findByPk(squadra.evento_id);
      if (evento) {
        const now = new Date();
        if (now < new Date(evento.data_inizio) || now > new Date(evento.data_fine))
          return res.status(403).json({ error: 'Event is not currently active' });
      }
    }

    const updates = pick(req.body, PUT_ALLOWED_FIELDS);
    const now = new Date();

    if (!squadra.tempo_inizio && Array.isArray(req.body.aiuti_usati)) {
      updates.tempo_inizio = now;
      updates.tempo_inizio_tappa_corrente = now;
    }

    // Imposta tempo_fine quando la partita viene completata (timeout o completamento normale)
    if (updates.completata && !squadra.completata) {
      updates.tempo_fine = now;
    }

    if (typeof updates.tappa_corrente === 'number' && updates.tappa_corrente > squadra.tappa_corrente) {
      if (updates.completata) {
        updates.tempo_fine = now;
      } else {
        updates.tempo_inizio_tappa_corrente = now;
      }
    }

    await squadra.update(updates);
    res.json(squadra);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/squadre/:id — proprietario o admin (di sede: solo squadre della propria sede)
router.delete('/:id', auth, scopeToSedi, async (req, res) => {
  try {
    const squadra = await Squadra.findByPk(req.params.id);
    if (!squadra) return res.status(404).json({ error: 'Non trovata' });

    if (!isReqAdmin(req) && squadra.user_id !== req.user.id)
      return res.status(403).json({ error: 'Non autorizzato' });

    if (isReqAdmin(req) && !isSedeAllowed(req, squadra.luogo_id))
      return res.status(403).json({ error: 'Non autorizzato per questa sede' });

    await squadra.destroy();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
