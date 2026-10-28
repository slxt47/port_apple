# Portfolio – Apple-like

Meine Portfolio-Seite: **[slxt.dev](https://slxt.dev)** (auch unter port.slxt.org).

Eine einzige statische Seite ohne Frameworks und ohne fremde Server: keine Google Fonts,
keine Icon-CDNs, keine eingebettete Karte – beim Laden werden rund 20 KB übertragen.

## Was drin ist

- **Intro** mit Memoji und dem Leitsatz „I run my own server. Everything below lives on it.“
- **Projekte** als Kacheln (disslxt, Nexus, Webshop, El Gato Gordo, Rechner, slxt.org, Homelab)
  mit Hostname, Live-Punkt und Links zur Seite und zur Doku auf [doc.slxt.dev](https://doc.slxt.dev).
- **Journey**: Zeitleiste und Skills als Schlagwörter.
- **Kontakt** und eine eigene **SVG-Karte von Österreich** mit Graz-Pin
  (Grenzen aus [Natural Earth](https://www.naturalearthdata.com), gemeinfrei).

## Gestaltung

Geprüft gegen Apples Human Interface Guidelines:

- Systemschrift (SF Pro / SF Pro Rounded auf Apple-Geräten), Fließtext 17 px.
- Hell und dunkel automatisch nach Systemeinstellung, alle Kontraste ≥ 5,6 : 1.
- Tippflächen ≥ 44 px, sichtbarer Tastatur-Fokus, „Zum Inhalt springen“-Link.
- Animationen (Intro, gleitende Navigation, Lichtkegel auf Karten, Zeitleiste und Karte zeichnen
  sich) – bei **„Weniger Bewegung“** komplett aus. „Weniger Transparenz“ und „Mehr Kontrast“
  werden ebenfalls beachtet.

## Aufbau

```
index.html               Seite inkl. SVG-Icons und Karte
assets/css/site.css      Farben, Layout, Animationen
assets/js/site.js        aktive Navigation, Einblenden, Lichtkegel, Zeitleiste
assets/images/           Memoji (WebP 192/384 px), Favicon
```

Lokal ansehen:

```bash
python3 -m http.server 8000      # dann http://localhost:8000
```

> Wird die Seite hinter einem Cache (z. B. Cloudflare) ausgeliefert: Nach Änderungen an CSS/JS
> die Versionsnummer `?v=…` in der `index.html` erhöhen.

## Änderungen (Oktober 2026)

Komplett neu gebaut. Vorher war es die „vCard Personal Portfolio“-Vorlage mit Google Fonts,
Google Maps, Ionicons vom CDN, einem Kontaktformular, das nichts verschickt hat, und
Platzhalter-Projekten. Jetzt: echte Projekte, hell + dunkel, keine fremden Anfragen,
442 KB → ~20 KB.
