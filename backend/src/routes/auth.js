const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );

const safeUser = (u) => ({
  id: u.id, email: u.email, full_name: u.full_name,
  role: u.role, avatar_url: u.avatar_url,
});

// Google OAuth (solo se configurato)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ where: { provider: 'google', provider_id: profile.id } });
      if (!user) {
        user = await User.findOne({ where: { email: profile.emails[0].value } });
        if (user) {
          await user.update({ provider: 'google', provider_id: profile.id });
        } else {
          user = await User.create({
            email: profile.emails[0].value,
            full_name: profile.displayName,
            provider: 'google',
            provider_id: profile.id,
            avatar_url: profile.photos?.[0]?.value || null,
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name)
      return res.status(400).json({ error: 'email, password e full_name sono obbligatori' });

    if (await User.findOne({ where: { email } }))
      return res.status(409).json({ error: 'Email già registrata' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password_hash, full_name, provider: 'local' });
    res.status(201).json({ token: generateToken(user), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !user.password_hash)
      return res.status(401).json({ error: 'Credenziali non valide' });

    if (!await bcrypt.compare(password, user.password_hash))
      return res.status(401).json({ error: 'Credenziali non valide' });

    res.json({ token: generateToken(user), user: safeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me
router.get('/me', auth, (req, res) => {
  res.json(safeUser(req.user));
});

// GET /api/auth/google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// GET /api/auth/google/callback
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
  }
);

module.exports = router;
