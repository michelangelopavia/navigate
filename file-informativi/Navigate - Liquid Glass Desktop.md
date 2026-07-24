# Navigate — Liquid Glass (Desktop)

## Palette
- Sfondo pagina: celeste pastello `oklch(88% 0.06 235)` con macchie sfumate del brand (celeste e arancione) in trasparenza
- Nero: `oklch(15% 0 0)` (testi, icone, bottoni primari)
- Arancione accento: `oklch(62% 0.19 45)` (bordi blocchi, badge, hover)
- Bianco: `oklch(99% 0 0)` (base dei pannelli vetro)
- Barra gradiente in cima: rosa → viola → celeste (invariata dall'originale)

## Font
Space Grotesk (400/500/600/700) — unico font in tutta la pagina

## Effetto Liquid Glass
- Pannelli e card in vetro traslucido: sfondo bianco semi-trasparente + `backdrop-filter: blur(28px) saturate(200%)`
- Bordo sottile chiaro + doppia ombra interna (rim-light in alto, ombra leggera in basso) per simulare lo spessore del vetro
- Riflesso lucido (sheen) in alto a sinistra su ogni card, tramite un overlay radiale bianco
- Bottoni scuri con la stessa trattazione vetro (`.glass-dark`), bordi arrotondati a pillola
- Card "Come Funziona" con icone su sfondo vetro scuro
- Header escluso dal riflesso lucido per non coprire logo/testo (fix di leggibilità)

## Struttura
Identica alla versione originale (vedi `Navigate - Restyling.md`): Header, Hero con "Come Funziona", CTA Classifiche, Eventi in Programma, Luoghi Disponibili, Footer.

## Sfondo Mappa (versione di riferimento)
Griglia sottile stile coordinate/mappa dietro le macchie di colore del brand (celeste e arancione), sfondo pagina celeste pastello. I pannelli e le card in vetro hanno un fondo quasi opaco (82%) così la griglia resta visibile solo sullo sfondo pagina, non dentro le card.

## File sorgente
`Navigate Restyle Liquid Glass.dc.html` (= `Navigate Restyle Liquid Glass - Sfondo Mappa.dc.html`, identico)
