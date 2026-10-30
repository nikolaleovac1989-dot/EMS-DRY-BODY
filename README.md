# X Body Expert – sajt

Statički sajt (HTML + CSS + JS), bez build koraka. Slike su u WebP formatu (`hero-trener.jpg` se koristi samo za pregled pri deljenju na mrežama).

## Kada domen bude poznat (OBAVEZNO)
Canonical, og:url, og:image, twitter:image, `robots.txt` (Sitemap linija) i `sitemap.xml` su namerno isključeni dok domen nije poznat.
Pokreni u ovom folderu (PowerShell):

    .\postavi-domen.ps1 -Domen https://www.tvojdomen.rs

Skripta uključuje te tagove i upisuje domen u index.html, robots.txt i sitemap.xml.
(Ručno: ukloni `<!-- DOMEN-BLOK-POCETAK` i `DOMEN-BLOK-KRAJ -->` u index.html i zameni `__DOMEN__` svuda.)

## Objava na GitHub Pages
1. Napravi repozitorijum i otpremi sve iz ovog foldera (index.html mora biti u korenu).
2. Settings → Pages → Branch: main, folder: / (root).

## Još za dopunu
- Forma: u script.js `CONFIG.formEndpoint` (npr. Formspree); ako je prazno, otvara se WhatsApp.
- Dodatne fotografije za galeriju.
