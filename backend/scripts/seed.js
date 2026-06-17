require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const bcrypt     = require('bcryptjs');
const fs         = require('fs');
const path       = require('path');
const { parse }  = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const { sequelize, User, Luogo, Tappa, Evento } = require('../src/models');

const DATA_DIR = path.join(__dirname, '../../DATA');

function readCsv(filename) {
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) { console.warn(`  File non trovato: ${file}`); return []; }
  return parse(fs.readFileSync(file, 'utf8'), {
    columns: true, skip_empty_lines: true, relax_quotes: true, trim: true,
  });
}

function parseBoolean(val) {
  if (typeof val === 'boolean') return val;
  return String(val).toLowerCase() === 'true';
}

function parseJson(val) {
  if (!val || String(val).trim() === '' || val === '[]') return [];
  try { return JSON.parse(val); } catch { return []; }
}

async function seedUser(email, password, fullName, role) {
  const [, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      password_hash: await bcrypt.hash(password, 10),
      full_name: fullName,
      role,
      provider: 'local',
    },
  });
  console.log(`  ${created ? '✓ creato' : '→ già presente'}: ${email}`);
}

async function main() {
  console.log('Avvio seed database...\n');

  await sequelize.sync({ alter: true });
  console.log('✓ Tabelle sincronizzate\n');

  // ── Utenti ───────────────────────────────────────────────────────────────────
  console.log('Utenti:');
  await seedUser('admin@navigate.it', process.env.ADMIN_SEED_PASSWORD || 'Admin1234!', 'Amministratore', 'admin');
  await seedUser('test@navigate.it',  'Test1234!',  'Utente Test',    'user');

  // ── Dati di gioco (solo se il DB è vuoto) ────────────────────────────────────
  const luoghiCount = await Luogo.count();
  if (luoghiCount > 0) {
    console.log('\nDati di gioco già presenti, salto import.');
    console.log('\n✅ Seed completato!');
    await sequelize.close();
    return;
  }

  const idMap = new Map();

  // ── Luoghi ───────────────────────────────────────────────────────────────────
  const luoghiCsv = readCsv('Luogo_export.csv');
  console.log(`\nLuoghi (${luoghiCsv.length}):`);
  for (const row of luoghiCsv) {
    const id = uuidv4();
    idMap.set(row.id, id);
    await Luogo.create({
      id,
      nome:         row.nome,
      citta:        row.citta        || null,
      descrizione:  row.descrizione  || null,
      immagine_url: row.immagine_url || null,
      attivo:       parseBoolean(row.attivo),
    });
    console.log(`  ✓ ${row.nome}`);
  }

  // ── Tappe ────────────────────────────────────────────────────────────────────
  const tappaCsvName = fs.existsSync(path.join(DATA_DIR, 'Tappa_export(1).csv'))
    ? 'Tappa_export(1).csv' : 'Tappa_export.csv';
  const tappeCsv = readCsv(tappaCsvName);
  console.log(`\nTappe (${tappeCsv.length}):`);
  for (const row of tappeCsv) {
    const luogoId = idMap.get(row.luogo_id);
    if (!luogoId) {
      console.warn(`  ✗ Tappa "${row.titolo || row.id}": luogo_id non trovato, salto`);
      continue;
    }
    const id = uuidv4();
    idMap.set(row.id, id);
    await Tappa.create({
      id,
      luogo_id:             luogoId,
      titolo:               row.titolo               || null,
      titolo_en:            row.titolo_en            || null,
      difficolta:           row.difficolta            || 'facile',
      indovinello:          row.indovinello,
      indovinello_en:       row.indovinello_en       || null,
      risposta_corretta:    row.risposta_corretta,
      risposte_alternative: parseJson(row.risposte_alternative),
      suggerimento:         row.suggerimento         || null,
      suggerimento_en:      row.suggerimento_en      || null,
      approfondimento:      row.approfondimento      || null,
      approfondimento_en:   row.approfondimento_en   || null,
      attivo:               true,
    });
    console.log(`  ✓ ${row.titolo || row.id} (${row.difficolta})`);
  }

  // ── Eventi ───────────────────────────────────────────────────────────────────
  const eventiCsv = readCsv('Evento_export.csv');
  console.log(`\nEventi (${eventiCsv.length}):`);
  for (const row of eventiCsv) {
    const luogoId = idMap.get(row.luogo_id);
    if (!luogoId) {
      console.warn(`  ✗ Evento "${row.nome}": luogo_id non trovato, salto`);
      continue;
    }
    await Evento.create({
      id:             uuidv4(),
      nome:           row.nome,
      nome_en:        row.nome_en        || null,
      luogo_id:       luogoId,
      data_inizio:    new Date(row.data_inizio),
      data_fine:      new Date(row.data_fine),
      descrizione:    row.descrizione    || null,
      descrizione_en: row.descrizione_en || null,
      attivo:         parseBoolean(row.attivo),
      concluso:       parseBoolean(row.concluso),
      email_gestori:  parseJson(row.email_gestori),
      og_image_url:   row.immagine_copertina || null,
    });
    console.log(`  ✓ ${row.nome}`);
  }

  console.log('\n✅ Seed completato!');
  console.log('\nCredenziali di accesso:');
  console.log('  Admin: admin@navigate.it / (password da ADMIN_SEED_PASSWORD)');
  console.log('  Test:  test@navigate.it  / Test1234!');

  await sequelize.close();
}

main().catch((err) => { console.error('\n❌ Errore:', err.message); process.exit(1); });
