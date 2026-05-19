const express = require('express');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const router = express.Router();

// POST /api/integrations/email — autenticato
// Rimpiazza base44.integrations.Core.SendEmail
router.post('/email', auth, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body)
      return res.status(400).json({ error: 'to, subject e body sono obbligatori' });

    await sendEmail({ to, subject, body });
    res.json({ success: true });
  } catch (err) {
    console.error('Errore invio email:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
