require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs   = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { v4: uuidv4 } = require('uuid');
const { sequelize, Luogo, Tappa, Evento, ImpostazioniSito } = require('../src/models');

const DATA_DIR = path.join(__dirname, '../../DATA');

function readCsv(filename) {
  const file = path.join(DATA_DIR, filename);
  if (!fs.existsSync(file)) { console.warn(`File non trovato: ${file}`); return []; }
  const content = fs.readFileSync(file, 'utf8');
  return parse(content, { columns: true, skip_empty_lines: true, relax_quotes: true, trim: true });
}

function parseBoolean(val) {
  if (typeof val === 'boolean') return val;
  return String(val).toLowerCase() === 'true';
}

function parseJson(val) {
  if (!val || val.trim() === '' || val === '[]') return [];
  try { return JSON.parse(val); } catch { return []; }
}

async function main() {
  await sequelize.sync({ alter: true });

  // ── Mappa ID Base44 → UUID nuovo ──────────────────────────────────────────
  const idMap = new Map();

  // ── 1. Luoghi ─────────────────────────────────────────────────────────────
  const luoghiCsv = readCsv('Luogo_export.csv');
  console.log(`Importo ${luoghiCsv.length} luoghi...`);
  for (const row of luoghiCsv) {
    const newId = uuidv4();
    idMap.set(row.id, newId);
    await Luogo.upsert({
      id:           newId,
      nome:         row.nome,
      citta:        row.citta || null,
      descrizione:  row.descrizione || null,
      immagine_url: row.immagine_url || null,
      attivo:       parseBoolean(row.attivo),
    });
    console.log(`  ✓ Luogo: ${row.nome} → ${newId}`);
  }

  // ── 2. Tappe ──────────────────────────────────────────────────────────────
  // accetta sia "Tappa_export.csv" che "Tappa_export(1).csv"
  const tappaCsvName = fs.existsSync(path.join(DATA_DIR, 'Tappa_export(1).csv'))
    ? 'Tappa_export(1).csv' : 'Tappa_export.csv';
  const tappeCsv = readCsv(tappaCsvName);
  console.log(`\nImporto ${tappeCsv.length} tappe...`);
  for (const row of tappeCsv) {
    const luogoUuid = idMap.get(row.luogo_id);
    if (!luogoUuid) {
      console.warn(`  ✗ Tappa "${row.titolo}": luogo_id ${row.luogo_id} non trovato nella mappa, salto`);
      continue;
    }
    const newId = uuidv4();
    idMap.set(row.id, newId);
    await Tappa.upsert({
      id:                   newId,
      luogo_id:             luogoUuid,
      titolo:               row.titolo || null,
      titolo_en:            row.titolo_en || null,
      difficolta:           row.difficolta || 'facile',
      indovinello:          row.indovinello,
      indovinello_en:       row.indovinello_en || null,
      risposta_corretta:    row.risposta_corretta,
      risposte_alternative: parseJson(row.risposte_alternative),
      suggerimento:         row.suggerimento || null,
      suggerimento_en:      row.suggerimento_en || null,
      approfondimento:      row.approfondimento || null,
      approfondimento_en:   row.approfondimento_en || null,
      attivo:               true,
    });
    console.log(`  ✓ Tappa: ${row.titolo}`);
  }

  // ── 3. Eventi ─────────────────────────────────────────────────────────────
  const eventiCsv = readCsv('Evento_export.csv');
  console.log(`\nImporto ${eventiCsv.length} eventi...`);
  for (const row of eventiCsv) {
    const luogoUuid = idMap.get(row.luogo_id);
    if (!luogoUuid) {
      console.warn(`  ✗ Evento "${row.nome}": luogo_id ${row.luogo_id} non trovato, salto`);
      continue;
    }
    const newId = uuidv4();
    idMap.set(row.id, newId);
    await Evento.upsert({
      id:               newId,
      nome:             row.nome,
      nome_en:          row.nome_en || null,
      luogo_id:         luogoUuid,
      data_inizio:      new Date(row.data_inizio),
      data_fine:        new Date(row.data_fine),
      descrizione:      row.descrizione || null,
      descrizione_en:   row.descrizione_en || null,
      attivo:           parseBoolean(row.attivo),
      concluso:         parseBoolean(row.concluso),
      email_gestori:    parseJson(row.email_gestori),
      og_image_url:     row.immagine_copertina || null,
    });
    console.log(`  ✓ Evento: ${row.nome}`);
  }

  // ── 4. ImpostazioniSito ───────────────────────────────────────────────────
  const settingsCsv = readCsv('ImpostazioniSito_export.csv');
  if (settingsCsv.length > 0) {
    console.log(`\nImporto impostazioni sito...`);
    const row = settingsCsv[0];
    await ImpostazioniSito.upsert({
      id:               uuidv4(),
      og_title:         row.site_title  || row.og_title  || null,
      og_description:   row.site_description || row.og_description || null,
      og_image_url:     row.site_image  || row.og_image_url || null,
      meta_description: row.site_description || null,
      site_name:        row.site_title  || null,
    });
    console.log('  ✓ ImpostazioniSito aggiornate');
  }

  console.log('\n✅ Import completato!');
  await sequelize.close();
}

main().catch((err) => { console.error('Errore durante l\'import:', err); process.exit(1); });
