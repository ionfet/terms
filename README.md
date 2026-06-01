# TERMS a.s. — živý prototyp (responzivní, 375 → 1440)

Prototyp landing page podle Figma předlohy. Čisté HTML/CSS/JS, bez buildu a závislostí.
Plně responzivní: plynule se škáluje přes `clamp()` od mobilní (375) po desktopovou (1440) šířku; na `≤ 900px` se rozložení přeskládá do jednoho sloupce (podle mobilní předlohy) a menu se sbalí do celoobrazovkového hamburgeru.

## Jak otevřít

Stačí otevřít **`index.html`** dvojklikem v prohlížeči.

Nebo spustit lokální server (vhodné pro font/SVG bez CORS komplikací):

```bash
cd "/Users/ion/Documents/Work/Terms/Web"
python3 -m http.server 8080
# pak otevři http://localhost:8080
```

## Struktura

```
index.html        — značkování všech sekcí
styles.css        — design tokeny + styly
script.js         — interaktivita (akordeon, karusel, formulář, scroll animace)
assets/fonts/     — font ZedTextL-*.ttf (4 řezy)
assets/img/       — fotky (PNG/JPG) a loga/ikony (SVG)
```

## Font

Firemní **Zed Text L** — připojený soubory z `assets/fonts/` (4 řezy):
`ZedTextL-Regular`, `ZedTextL-Bold`, `ZedTextL-SemiWideRegular`, `ZedTextL-SemiWideBold`.

Rodina je v `@font-face` poskládaná tak, že si prohlížeč sám vybere soubor podle dvojice
**font-weight + font-stretch**: běžná šířka → `normal`, „Semi-Wide" (nadpisy) → `112.5%`.
Funguje i na počítači klienta — soubory leží vedle, není potřeba nic doinstalovávat.

## Co je „živé"

- **Hover stavy** tlačítek, karet, odkazů, chipů + plynulé objevení sekcí při scrollu.
- **Akordeon „Naše odvětví"** — klik rozbalí obor (single-open), `+` se otáčí na `×`.
- **Karusel „Naše realizace"** — šipky listují projekty, krajní stavy zhasínají tlačítka.
- **Formulář „Napište nám"** — validace povinných polí (backend není; místo pro reálné odeslání je vyznačené v `script.js`).
- **Menu** — na desktopu rozbalovací podmenu po najetí; na mobilu (≤900px) hamburger otevírá celoobrazovkové overlay menu. Plynulý scroll k sekcím po kliku.
- **Responzivita** — fluid typografie a odsazení přes `clamp()`; statistiky i karty „Proč nám věřit" se zalamují a centrují (3/4 → 2 → 1); karusel a formulář se přeskládají do jednoho sloupce; v „Naše odvětví" se na mobilu skrývá boční obrázek.
- Tlačítka jsou připravená pro vlastní animace: `.btn` má volné vrstvy `::before`/`::after` — doladí se zvlášť.

## Poznámky k obsahu (placeholdery z předlohy)

V původní Figmě je část obsahu jen výplň. Přenesl jsem „jak je", abych nic nevymýšlel:

- **„Proč nám věřit"** — všechny 3 karty mají stejný text (tak je to v předloze). Je potřeba finální texty/ikony.
- **„Naše realizace"** — popisy projektů jsou lorem ipsum.
- **Foto v „TERMS a.s."** — export assetu z Figmy přišel prázdný, proto je natažený čistý render budovy přímo z uzlu předlohy.
- **Copyright v patičce** byl v předloze „© 2026 Roboton" (zbytek šablony) — nahrazeno za „© 2026 TERMS a.s.".
