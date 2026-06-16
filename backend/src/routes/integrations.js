const express = require('express');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const { sendEmail } = require('../services/email');

const router = express.Router();

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many email requests, please try again later' },
  keyGenerator: (req) => String(req.user.id),
});

// POST /api/integrations/email — autenticato
// Rimpiazza base44.integrations.Core.SendEmail
router.post('/email', auth, emailLimiter, async (req, res) => {
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
