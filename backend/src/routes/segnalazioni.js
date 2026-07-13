const express = require('express');
const { Op } = require('sequelize');
const { Segnalazione, Squadra, Notifica, Evento } = require('../models');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { sendEmail } = require('../services/email');
const { wrapEmail } = require('../services/emailTemplate');
const { getSedeAdminEmails, getSuperAdminEmails } = require('../services/adminEmails');
const scopeToSedi = require('../middleware/scopeToSedi');

const router = express.Router();

const PUT_ALLOWED_FIELDS = ['risolta', 'note_admin'];
const pick = (obj, fields) =>
  Object.fromEntries(fields.filter((f) => f in obj).map((f) => [f, obj[f]]));

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

    const squadra = segnalazione.squadra_id ? await Squadra.findByPk(segnalazione.squadra_id) : null;
    await Notifica.create({
      tipo: 'segnalazione',
      squadra_id: segnalazione.squadra_id || null,
      squadra_nome: squadra?.nome_squadra || null,
      messaggio: segnalazione.descrizione,
    });

    // Email sempre ad admin sede + super_admin (segnalazioni rare, meritano visibilità garantita),
    // più email_gestori se la segnalazione arriva da una squadra iscritta a un evento.
    // Non deve mai far fallire la creazione della segnalazione se l'invio fallisce.
    try {
      const evento = squadra?.evento_id ? await Evento.findByPk(squadra.evento_id) : null;
      const destinatari = [...new Set([
        ...(await getSedeAdminEmails(squadra?.luogo_id)),
        ...(await getSuperAdminEmails()),
        ...(evento?.email_gestori || []),
      ])];

      for (const to of destinatari) {
        await sendEmail({
          to,
          subject: '🚨 Segnalazione malfunzionamento - NAVIGATE',
          body: wrapEmail({
            title: 'Nuova segnalazione',
            contentHtml: `
              <p><strong>Messaggio:</strong> ${segnalazione.descrizione}</p>
              <p><strong>Squadra:</strong> ${squadra?.nome_squadra || 'N/D'}</p>
              <p><strong>Email utente:</strong> ${segnalazione.user_email || 'Anonimo'}</p>
              <hr>
              <p>Data: ${new Date().toLocaleString('it-IT')}</p>
            `,
          }),
        });
      }
    } catch (emailErr) {
      console.error('Errore invio email segnalazione:', emailErr.message);
    }

    res.status(201).json(segnalazione);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/segnalazioni/:id — admin (segna risolta/note_admin, solo della propria sede se admin di sede)
router.put('/:id', auth, isAdmin, scopeToSedi, async (req, res) => {
  try {
    const s = await Segnalazione.findByPk(req.params.id);
    if (!s) return res.status(404).json({ error: 'Non trovata' });
    if (req.sedeIds) {
      const squadra = s.squadra_id ? await Squadra.findByPk(s.squadra_id) : null;
      if (!squadra || !req.sedeIds.includes(squadra.luogo_id)) {
        return res.status(403).json({ error: 'Non sei assegnato a questa sede' });
      }
    }
    await s.update(pick(req.body, PUT_ALLOWED_FIELDS));
    res.json(s);
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
