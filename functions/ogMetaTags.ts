import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Leggi il payload JSON
    const payload = await req.json();
    const type = payload.type;
    const id = payload.id;

    let metaData = {
      title: 'NAVIGATE - Perdetevi nella città, giocando!',
      description: 'Scopri la città attraverso una caccia al tesoro interattiva. Risolvi indovinelli, esplora luoghi nascosti e vivi un\'avventura unica con NAVIGATE.',
      image: 'https://neunoi.it/wp-content/uploads/2025/12/Logo-neunoi.png',
      url: 'https://preview-sandbox--bd281adf02b29009309d6af3df766b0b.base44.app'
    };

    // Carica impostazioni SEO di default
    const seoSettings = await base44.asServiceRole.entities.ImpostazioniSito.filter({ chiave: 'seo_defaults' });
    if (seoSettings[0]) {
      metaData.title = seoSettings[0].site_title || metaData.title;
      metaData.description = seoSettings[0].site_description || metaData.description;
      metaData.image = seoSettings[0].site_image || metaData.image;
      metaData.url = seoSettings[0].site_url || metaData.url;
    }

    // Se è un evento, carica i dati dell'evento
    if (type === 'evento' && id) {
      const eventi = await base44.asServiceRole.entities.Evento.filter({ id });
      if (eventi[0]) {
        const evento = eventi[0];
        if (evento.og_title) metaData.title = evento.og_title;
        else if (evento.nome) metaData.title = evento.nome;
        
        if (evento.og_description) metaData.description = evento.og_description;
        else if (evento.descrizione) metaData.description = evento.descrizione.replace(/<[^>]*>/g, '').substring(0, 200);
        
        if (evento.immagine_copertina) metaData.image = evento.immagine_copertina;
        
        metaData.url = `https://preview-sandbox--bd281adf02b29009309d6af3df766b0b.base44.app#/DettaglioEvento?id=${id}`;
      }
    }

    const html = `
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${metaData.title}</title>
  <meta name="description" content="${metaData.description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="${type === 'evento' ? 'event' : 'website'}">
  <meta property="og:url" content="${metaData.url}">
  <meta property="og:title" content="${metaData.title}">
  <meta property="og:description" content="${metaData.description}">
  <meta property="og:image" content="${metaData.image}">
  
  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${metaData.url}">
  <meta property="twitter:title" content="${metaData.title}">
  <meta property="twitter:description" content="${metaData.description}">
  <meta property="twitter:image" content="${metaData.image}">
  
  <meta http-equiv="refresh" content="0;url=${metaData.url}">
</head>
<body>
  <p>Caricamento in corso...</p>
  <script>window.location.href = "${metaData.url}";</script>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});