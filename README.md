# Portfolio – Apple-like

Meine Portfolio-Seite: **[slxt.dev](https://slxt.dev)** (auch unter port.slxt.org).

Eine einzige statische Seite ohne Frameworks und ohne fremde Server: keine Google Fonts,
keine Icon-CDNs, keine eingebettete Karte – beim Laden werden rund 20 KB übertragen; die bewegten Projekt-Bilder
(animiertes WebP, je nach Bildschirm 480 oder 960 px, nur im aktuellen Modus, zusammen ≈ 0,35 MB am Handy /
0,9 MB am PC) kommen erst beim Hinscrollen dazu.

## Was drin ist

- **Intro** mit Memoji und dem Leitsatz „I run my own server. Everything below lives on it.“
- **Projekte** als Kacheln (disslxt, Nexus, Webshop, El Gato Gordo, Rechner, slxt.org, Dashboard, Homelab)
  mit Hostname, Live-Punkt und Links zur Seite und zur Doku auf [doc.slxt.dev](https://doc.slxt.dev).
  Jede Kachel zeigt die Seite **bewegt im Mini-Browser** (animiertes WebP in `assets/images/projekte/`, hell und
  dunkel – die Seiten selbst sind im jeweiligen Modus aufgenommen): disslxt und Nexus mit einem **gestellten Chat**
  (erfundene Nutzer in Wegwerf-Instanzen: disslxt über die E2E-Datenbank mit `e2e/tests/portfolio-bilder.spec.ts`,
  Nexus mit den Prod-Images, aber eigener DB + Mailpit), Rechner tippt, slxt.org wirft das Glasfenster, Dashboard und
  Docs suchen, Shop blättert. Je Modus ein eigenes `<picture>` (CSS zeigt nur das zum Modus passende, das andere wird nicht geladen),
  „Weniger Bewegung“ wählt per `media` das Standbild (`*-still.webp`) – ganz ohne JavaScript. El Gato Gordo: eigene, gezeichnete SVG-Szene (schwebende, geworfene Katzen-Karten,
  Sternschnuppe) – die Katzen-GIFs kommen von GIPHY und werden nur dort eingebettet, nie kopiert.
- **Journey**: Zeitleiste und Skills als Schlagwörter.
- **Kontaktformular** unter [`/contact/`](https://slxt.dev/contact/) („Email me“ führt dorthin): Thema, Name, E-Mail,
  Betreff, Nachricht, optional Firma/Schule, Telefon und Website. Die Nachricht geht per Mail an mich (Antworten
  gehen per „Antworten“ direkt an den Absender), gespeichert wird nichts. Schutz: Einmal-Token mit Mindest-Ausfüllzeit,
  Honigtopf-Feld, Drosselung pro IP, Prüfung im Browser und auf dem Server. Fällt der Versand aus, zeigt die Seite
  die Mail-Adresse. Der kleine Mail-Dienst dahinter (Python, nur Standardbibliothek) liegt nicht in diesem Repo,
  sondern beim Server-Setup (`compose/port_apple/kontakt/`).
- **Kontakt** und eine eigene **SVG-Karte von Österreich** mit Graz-Pin
  (Grenzen aus [Natural Earth](https://www.naturalearthdata.com), gemeinfrei). Beim Hinscrollen startet sie auf
  Europa (Österreich leuchtet) und zoomt hinein; Europa liegt in `assets/images/europe.svg` und wird erst
  nachgeladen, wenn man zur Karte scrollt (bei „Weniger Bewegung“ gar nicht).

## Gestaltung

Geprüft gegen Apples Human Interface Guidelines:

- Systemschrift (SF Pro / SF Pro Rounded auf Apple-Geräten), Fließtext 17 px.
- Standard dunkel, Schalter oben rechts für hell (Wahl bleibt im Browser gespeichert), alle Kontraste ≥ 5,6 : 1.
- Tippflächen ≥ 44 px, sichtbarer Tastatur-Fokus, „Zum Inhalt springen“-Link.
- Sternenhimmel wie auf slxt.org und dem Dashboard (dunkel: Sterne in zwei Ebenen mit Parallax,
  funkelnde Sterne, Sternschnuppen, Klick in den Himmel = eigene Sternschnuppe, sanftes Polarlicht;
  hell: Abenddämmerung). Hell/Dunkel-Wechsel als wachsender Kreis vom Schalter (View Transitions).
- Seit 10.11.2026: Karten neigen sich beim Zeigen nur noch sanft (≈ ⅓), blenden mit Feder und leichter Skalierung ein, Screenshots ziehen sich von oben auf,
  laden mit Schimmer, „spähen“ beim Zeigen nach oben und haben leichten Parallax; Abschnittstrenner zeichnen sich
  von der Mitte aus; Wechsel zur Kontaktseite und zurück als View Transition (Kopfleiste bleibt stehen).
- Animationen (Intro, gleitende Navigation, Fortschrittsbalken, Hero-Parallax, 3D-Neigung und
  Lichtrand auf Karten, magnetische Knöpfe mit Welle, Zeiger-Licht, Zeitleiste und Karte zeichnen
  sich) – nur `transform`/`opacity`, ein gemeinsamer `requestAnimationFrame`-Takt, der im Ruhezustand
  stoppt. Bei **„Weniger Bewegung“** komplett aus. „Weniger Transparenz“ und „Mehr Kontrast“
  werden ebenfalls beachtet.

## Aufbau

```
index.html               Seite inkl. SVG-Icons und Karte
assets/css/style.css     Farben, Layout, Animationen
assets/js/site.js        aktive Navigation, Einblenden, Lichtkegel, Neigung, Zeitleiste
assets/js/himmel.js      Sternenhimmel, Sternschnuppen, Kreisblende beim Moduswechsel (auch /contact/)
assets/js/contact.js     Kontaktformular (Token holen, prüfen, senden)
contact/index.html       Kontaktseite
assets/images/           Memoji (WebP 192/384 px), Favicon
assets/images/projekte/  Projekt-Bilder <name>-<dunkel|hell>-<480|960>[-still].webp (animiert + Standbild,
                         Bild für Bild mit Playwright aufgenommen, 1280×800, mit Pillow zu WebP)
```

Lokal ansehen:

```bash
python3 -m http.server 8000      # dann http://localhost:8000
```

> Wird die Seite hinter einem Cache (z. B. Cloudflare) ausgeliefert: Cloudflare ignoriert `?v=…`.
> Nach größeren Änderungen an CSS/JS den Dateinamen ändern (oder den Cache leeren).

## Änderungen (Oktober 2026)

Komplett neu gebaut. Vorher war es die „vCard Personal Portfolio“-Vorlage mit Google Fonts,
Google Maps, Ionicons vom CDN, einem Kontaktformular, das nichts verschickt hat, und
Platzhalter-Projekten. Jetzt: echte Projekte, hell + dunkel, keine fremden Anfragen,
442 KB → ~20 KB.
