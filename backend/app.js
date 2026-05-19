require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const { sequelize } = require('./src/models');

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(passport.initialize());

// Routes API
app.use('/api/auth',            require('./src/routes/auth'));
app.use('/api/luoghi',          require('./src/routes/luoghi'));
app.use('/api/tappe',           require('./src/routes/tappe'));
app.use('/api/eventi',          require('./src/routes/eventi'));
app.use('/api/squadre',         require('./src/routes/squadre'));
app.use('/api/notifiche',       require('./src/routes/notifiche'));
app.use('/api/richieste-aiuto', require('./src/routes/richiesteAiuto'));
app.use('/api/segnalazioni',    require('./src/routes/segnalazioni'));
app.use('/api/impostazioni-sito', require('./src/routes/impostazioniSito'));
app.use('/api/integrations',    require('./src/routes/integrations'));

// In produzione serve il frontend buildato
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Sincronizza DB all'avvio
sequelize
  .sync({ alter: process.env.NODE_ENV === 'development' })
  .then(() => console.log('Database sincronizzato'))
  .catch((err) => console.error('Errore sync DB:', err));

module.exports = app;
