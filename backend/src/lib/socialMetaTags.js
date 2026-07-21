const fs = require('fs');

const DEFAULT_TITLE = 'NAVIGATE - Perdetevi nella città, giocando!';
const DEFAULT_DESCRIPTION = 'Scopri la città attraverso una caccia al tesoro interattiva. Risolvi indovinelli, esplora luoghi nascosti e vivi un\'avventura unica con NAVIGATE.';

let cachedTemplate = null;

function readTemplate(indexPath) {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(indexPath, 'utf-8');
  }
  return cachedTemplate;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(value = '') {
  return String(value).replace(/<[^>]*>/g, '');
}

function buildMetaTagsHtml({ title, description, image, url, type }) {
  const tags = [
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<meta property="og:type" content="${escapeHtml(type)}">`,
    `<meta property="og:url" content="${escapeHtml(url)}">`,
    `<meta property="og:title" content="${escapeHtml(title)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
  ];
  if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}">`);
  tags.push('<meta property="twitter:card" content="summary_large_image">');
  tags.push(`<meta property="twitter:title" content="${escapeHtml(title)}">`);
  tags.push(`<meta property="twitter:description" content="${escapeHtml(description)}">`);
  if (image) tags.push(`<meta property="twitter:image" content="${escapeHtml(image)}">`);
  return tags.join('\n    ');
}

async function resolveMeta({ req, Evento, ImpostazioniSito, baseUrl }) {
  const settings = await ImpostazioniSito.findOne();
  const defaultMeta = {
    title: settings?.og_title || DEFAULT_TITLE,
    description: settings?.og_description || DEFAULT_DESCRIPTION,
    image: settings?.og_image_url || null,
    url: baseUrl + req.originalUrl,
    type: 'website',
  };

  if (req.path === '/DettaglioEvento' && req.query.id) {
    const evento = await Evento.findByPk(req.query.id);
    if (evento) {
      return {
        title: evento.og_title || evento.nome,
        description: evento.og_description || stripHtml(evento.descrizione || '').substring(0, 200) || defaultMeta.description,
        image: evento.og_image_url || defaultMeta.image,
        url: defaultMeta.url,
        type: 'event',
      };
    }
  }

  return defaultMeta;
}

async function renderIndexWithMetaTags({ indexPath, req, Evento, ImpostazioniSito }) {
  const template = readTemplate(indexPath);
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const meta = await resolveMeta({ req, Evento, ImpostazioniSito, baseUrl });
  const metaTagsHtml = buildMetaTagsHtml(meta);

  return template.replace(
    '<title>Navigate</title>',
    `<title>${escapeHtml(meta.title)}</title>\n    ${metaTagsHtml}`
  );
}

module.exports = { renderIndexWithMetaTags };
