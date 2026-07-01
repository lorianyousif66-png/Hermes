# Hermes — Trainings- & Ernährungs-App

Kontext-Datei für Claude Code. Bitte vor jeder Änderung lesen.

## Was ist das

Hermes ist eine persönliche Trainings- und Ernährungs-App für einen Schichtarbeiter
(rotierende Schichten: Früh / Spät / Nacht / Frei). Ziele des Nutzers: Muskelaufbau
+ Fettabbau nach längerer Trainingspause (Wiedereinstieg, "muscle memory").

Die App ist eine **einzige `index.html`** — kein Build, kein Framework, keine
Abhängigkeiten. Sie wird auf GitHub Pages gehostet und auf dem Handy per
"Zum Home-Bildschirm hinzufügen" wie eine echte App installiert (PWA).

## Harte Regeln (nicht brechen)

1. **Die App-Logik bleibt in EINER Datei** `index.html` (HTML + CSS + Vanilla-JS inline).
   Kein npm, kein React, keine externen Libraries außer der Google-Fonts-Einbindung
   für "Inter". Kein Build-Schritt.
   *Ausnahme (bewusst, Phase 2 aus dem Backlog):* für echte Offline-Nutzung liegen
   drei kleine statische Begleitdateien daneben — `manifest.json`, `icon.svg` und
   `sw.js` (Service Worker). Diese enthalten **keine** App-Logik, nur PWA-Shell.
   Keine weiteren Dateien hinzufügen.
   *Externe Runtime-Dienste (kein Build):* der Barcode-Scanner nutzt die **Open Food
   Facts**-API (`world.openfoodfacts.org`) für die Produktsuche — reiner `fetch`-Aufruf,
   nur online. Zum Kamera-Lesen: Android verwendet die eingebaute `BarcodeDetector`-API;
   auf iPhone/Safari (kein `BarcodeDetector`) wird **ZXing** (`@zxing/library`) bei Bedarf
   einmalig vom CDN (`cdn.jsdelivr.net`) nachgeladen und danach vom Service Worker offline
   gecacht. Das ist die **einzige bewusst erlaubte JS-Library** (kein npm/Build, nur ein
   `<script>`-Nachladen zur Laufzeit) — sonst keine Libraries einbauen.
2. **Kein `localStorage`-Ersatz nötig** — läuft echt im Browser, `localStorage` ist
   erlaubt und gewollt (Daten liegen nur auf dem Gerät).
3. **Design: schlicht, Schwarz-Weiß (monochrom).** Zwei Themes: `obsidian` (dunkel）
   und `marmor` (hell). KEINE Akzentfarben. Klare, moderne Schrift (Inter).
4. **Name = "Hermes", sonst KEIN griechisch-mythologisches Vokabular.** Frühere
   Versionen hatten Begriffe wie "Arena", "Tempel", "Anapausis", Götternamen,
   griechische Buchstaben — das wurde bewusst entfernt. Bitte nicht wieder einbauen.
   Normale deutsche Begriffe verwenden (Training, Gewicht, Mehr, Pause …).
5. **Sprache der Oberfläche: Deutsch, informell.**
6. Änderungen möglichst **klein und lokal** halten. Nach Änderungen die Datei im
   Browser testen (nicht nur Syntax).

## Wie testen

- Datei einfach im Browser öffnen (`open index.html` / Doppelklick) oder
  `python3 -m http.server` im Ordner und `localhost:8000` aufrufen.
- Syntax-Check des Inline-JS bei Bedarf:
  ```bash
  # Script extrahieren und prüfen
  node --check <(python3 -c "import re;print(re.search(r'<script>(.*)</script>',open('index.html').read(),re.S).group(1))")
  ```
- Mobile-first testen (Ansicht ~390px breit). Die App ist auf max. 480px zentriert.

## Architektur (Vanilla-JS)

- **Ein globales `state`-Objekt** hält den kompletten Zustand.
- **`render()`** rendert den aktiven Tab, indem es HTML-Strings in `#main` schreibt,
  danach `renderNav()` und `wire()` aufruft. Kein virtuelles DOM.
- **`wire()`** hängt nach jedem Render die Event-Handler an (`onclick`, `oninput` …)
  über `data-*`-Attribute.
- **Muster gegen Fokusverlust:** Text-/Zahlen-Eingaben schreiben per `oninput` direkt
  in `state`, OHNE `render()` aufzurufen. Nur strukturelle Änderungen
  (Tab-Wechsel, Hinzufügen/Löschen, Speichern) lösen ein volles `render()` aus.
  Bei Suchfeldern werden Listen per `style.display` gefiltert statt neu gerendert.
- Persistenz: kleine Helfer `load(key, fallback)` und `save(key, value)`.

## Tabs / Views

- `heute` — Schicht wählen → Empfehlung; Mini-Stats; Mini-Ernährungsübersicht.
- `training` — Unternavigation (`state.trainView`: `log` | `plan` | `hist`, via `trainNav()`):
  - **Einheit** (`log`): Session-Logging (Sätze: Gewicht/Wdh./erledigt), Tag-Wechsel,
    Pausen-Timer, Notizfeld, Übungs-Anleitungen (`<details>`).
  - **Plan** (`plan`): **Plan-Assistent** (`wizEditor`, generiert Plan nach Ziel + Tagen)
    + **Plan bearbeiten** (`planEditor`, inkl. Übungs-Bibliothek `viewLibrary`).
  - **Verlauf** (`hist`): Trainings-Historie (`histEditor`).
- `essen` — Ernährungs-Tracker: Tagesbedarf vs. Konsum (Makros + Mikros + Wasser),
  Essen aus Datenbank hinzufügen (`viewFoodPicker`, inkl. Portions-Chips **und
  Barcode-Scan**), eigene Lebensmittel, 7-Tage-Wochenverlauf (`weekCard`) und
  14-Tage-Makro-Verlaufskurve (`trendCard`, umschaltbar kcal/Protein/KH/Fett).
- `gewicht` — Gewicht eintragen, Verlaufskurve (selbstgezeichnetes SVG), Einträge löschen.
- `mehr` — **nur Einstellungen** als Akkordeon: Darstellung (Theme), Profil & Ziel
  (`profileEditor`, inkl. Ernährungsziel), Feineinstellungen Protein/Pause (`goalsEditor`),
  Daten sichern (Datei-Download/-Upload + Copy-Export/Import/Reset). Trainingsplan &
  Verlauf liegen bewusst NICHT hier, sondern im Tab „Training".

## localStorage-Keys (`K`-Objekt) — NICHT umbenennen (sonst Datenverlust)

```
hermes:plan      Trainingsplan (Tage + Übungen)
hermes:settings  { theme, rest, protein }
hermes:profile   { sex, age, height, activity, goal }
hermes:bw        Gewichtsverlauf [{date, kg}]
hermes:hist      Trainings-Historie
hermes:last      letzte Bestwerte pro Übung (für "Letztes Mal")
hermes:next      ID des nächsten Trainingstags (Rotation)
hermes:shifts    { "YYYY-MM-DD": shiftKey }
hermes:food      { "YYYY-MM-DD": [foodEntries] }
hermes:water     { "YYYY-MM-DD": ml }
hermes:custom    eigene Lebensmittel
hermes:pr        persönliche Rekorde { übungsname: {score, weight, reps, unit, date} }
hermes:rota      Schichtrhythmus { start: "YYYY-MM-DD", seq: [shiftKey, …] }
```

## Datenmodelle

- **Plan-Tag:** `{ id, label, exercises: [...] }`
- **Übung:** `{ id, name, sets, reps, unit, steps:[...] }`
  - `unit`: `"kg"` | `"s"` (Sekunden, z. B. Plank) | `"bw"` (Körpergewicht, kein Gewichtsfeld)
    | `"min"` (Minuten, Cardio — kein Gewichtsfeld)
  - `steps`: kurze Anleitungsschritte (aus der Bibliothek kopiert oder leer)
- **Session-Log-Übung:** wie Übung, aber `sets: [{ weight, reps, done }]`
- **Lebensmittel (DB):** kompaktes Array
  `[name, kcal, protein, kohlenh, fett, ballast, VitC, VitD, Ca, Fe, Mg, K]` pro 100 g.
  Reihenfolge = `FKEYS`. Werte sind Näherungswerte.
- **Food-Log-Eintrag:** `{ name, grams, n:{...absolute Nährwerte...} }`
- **Profil-Ziel** (`profile.goal`): `"abnehmen"` (−500 kcal) | `"halten"` | `"aufbau"`
  (+250) | `"recomp"` (Body Recomp: −200 kcal + Protein mind. 2,0 g/kg).

## Wichtige Funktionen / Konstanten

- `EXLIB` — Übungs-Bibliothek nach Muskelgruppe (~110 Übungen inkl. Po, Bizeps/Trizeps
  getrennt, Ganzkörper/Zuhause, Mobility), jede Übung `[name, schritt1, schritt2, …]`.
  Bestehende Übungsnamen NICHT umbenennen (Pläne/Rekorde referenzieren sie per Name).
- `setScore()` / `checkPRs()` / `prCard()` / `prTxt()` — persönliche Rekorde:
  bei `kg` zählt geschätztes 1RM (Epley), sonst beste Wdh./Sek./Min. Neue Rekorde werden
  beim Speichern erkannt (`state.lastPRs` → Anzeige in `viewDone`), Liste unter
  Training → Verlauf, Anzeige „★ Rekord" in der Übungskarte.
- `NAVICONS` / `kcalRing()` — monochrome SVG-Icons in der Tab-Leiste, Kalorien-Ring im Essen-Tab.
- `rotaShift(date)` / `effShift(date)` / `rotaEditor()` / `rotaApplied()` — Schichtrhythmus
  (`hermes:rota`): wiederholender Zyklus ab Startdatum, Editor unter „Mehr" → Schichtplan
  (Tag antippen = Schicht durchwechseln, Vorlage 2-2-2-2). „Heute" nutzt `effShift`
  (manuelle Wahl in `hermes:shifts` überschreibt tagesweise; erneutes Antippen des aktiven
  Chips löscht den Override). Rhythmus-Änderungen entfernen Overrides ab heute
  (`rotaApplied`). 7-Tage-Vorschau im Heute-Tab.
- `dateKey(d)` / `todayKey()` — Datums-Schlüssel in LOKALER Zeit (nicht UTC/ISO)!
  Wichtig für Nachtschicht um Mitternacht. Nie durch `toISOString().slice(0,10)` ersetzen.
- `openExInfo(name)` / `bodySVG()` / `MUSCLE_MAP` / `findExMeta()` — Übungs-Info-Fenster
  (Bottom-Sheet `#exmodal`, statisch im Body, imperativ): Muskel-Grafik (Vorder-/Rückseite,
  beanspruchte Muskeln hervorgehoben), eigene Werte (Rekord/letztes Mal), Anleitung.
  Öffnet per Tipp auf Übungsnamen (Training-Log + Bibliothek, `data-exinfo`).
- Im Session-Log: „+ Satz" / „− Satz" je Übung (`data-addset`/`data-delset`, nur Session,
  ändert den Plan nicht).
- `render()` merkt sich die Ansicht (`lastViewSig`): Re-Render in derselben Ansicht behält
  die Scroll-Position, nur echte Ansichtswechsel scrollen nach oben.
- `FOODS` / `FKEYS` / `foodObj()` — Lebensmittel-Datenbank.
- `PORTIONS` — optionale Portionsvorlagen je Lebensmittel `{ name: [[label, gramm], …] }`.
  Werden im Food-Picker als Ein-Tipp-Chips angezeigt.
- `allFoods()` — Custom-Lebensmittel zuerst, dann `FOODS` (frisch gescannte/eigene oben).
- `openScanner()` / `loadZXing()` / `lookupBarcode(code)` / `initScanner()` — Barcode-Scan.
  Kamera: `BarcodeDetector` (Android) bzw. ZXing `decodeFromConstraints` (iPhone). Treffer
  → Open Food Facts → Custom-Food (`hermes:custom`). Overlay `#scanoverlay` liegt statisch
  im Body und wird imperativ gesteuert (nicht via `render()`).
- `NUT` — Nährstoff-Definitionen für die Fortschrittsbalken.
- `targets()` — berechnet Tagesbedarf aus Profil + aktuellem Gewicht:
  BMR (Mifflin-St Jeor) × Aktivität, ± Ziel; Protein aus `settings.protein` g/kg,
  Fett 0,8 g/kg, Rest Kohlenhydrate; Mikro-Richtwerte nach Geschlecht (DGE, ca.).
- `weekStats()` / `weekCard()` — 7-Tage-Verlauf (kcal-Balken + Ø kcal/Protein) im Essen-Tab.
- `dayTotals()` / `trendCard()` / `trendChart()` — 14-Tage-Makro-Verlaufskurve (SVG-Linie
  mit Zielmarke), umschaltbar über `state.trendMetric` (kcal/p/c/f).
- `PLAN_TEMPLATES` / `generatePlan(focus, days)` — Plan-Assistent unter „Mehr". `focus`:
  `"aufbau"` (Muskelaufbau) | `"fettabbau"` (+ Cardio-Finisher) | `"beides"`; `days` 2–4.
  Steuert Wdh.-Bereich, Sätze und Cardio. UI-Zustand liegt in `state.wiz`.
- `buildLog(dayId)` — erzeugt die Sätze für eine Trainingseinheit.
- `doDownload()` / `doFileImport()` / `applyImportObj()` — Backup als Datei speichern/laden
  (zusätzlich zur Copy-Sicherung `doExport`/`doImport`).
- `render()`, `wire()`, `bar()` (Fortschrittsbalken), `svgChart()` (Gewichtskurve).

## Fachliche Leitplanken (Trainings-/Ernährungslogik)

- Wiedereinsteiger: Ganzkörper 2–3×/Woche, moderat starten (2–3 Wdh. "im Tank").
- Fettabbau v. a. über Ernährung: leichtes Defizit (~500 kcal) + Protein 1,8–2,0 g/kg.
- Body Recomp (Fett ↓ + Muskel ↑ gleichzeitig): nahe Erhaltung (~−200 kcal), Protein
  hoch (≥ 2,0 g/kg) — passt gut für Wiedereinsteiger ("muscle memory").
- Schicht-Empfehlungen: Früh → nachmittags trainieren; Spät → vormittags;
  Nacht → nur leicht/Cardio; Frei → beste Einheit, aber 1. Tag nach Nacht = Schlaf.
- Nährwerte sind Näherungen — im UI so kommuniziert, nicht als exakt verkaufen.

## Backlog / mögliche nächste Schritte (nur auf Wunsch)

Erledigt: Portionsvorlagen · größere Lebensmittel-DB · Wochen-Verlauf Kalorien/Makros ·
PWA offline (manifest.json + Service Worker) · Datei-Export/-Import · Plan-Assistent
(Muskelaufbau/Fettabbau/Beides + Tage 2–4) · Barcode-Scan (Open Food Facts) ·
14-Tage-Makro-Verlaufskurve · Ziel „Body Recomp".

Offen:
- Noch mehr eingebaute Lebensmittel-Einträge.
- Verlaufsansicht über längere Zeiträume (30/90 Tage) wählbar machen.
- Geräte-Sync (aktuell nur lokal) — bewusst später, eigener Schritt.

## Deploy

GitHub Pages: `index.html` (+ `manifest.json`, `icon.svg`, `sw.js`) im Repo-Root,
Pages auf Branch `main` `/root`. Nach Push ~1 Min live.

**Updates:** Der Service Worker lädt die App-Seite (`index.html`) **"Netzwerk zuerst"** —
installierte Geräte bekommen mit Internet beim Öffnen automatisch die neueste Version
(offline die zuletzt gespeicherte). Ein `CACHE`-Bump in `sw.js` (`hermes-v2` → `v3` …)
ist nur bei größeren Änderungen nötig (z. B. an `manifest.json`/`icon.svg` oder der
SW-Logik selbst), damit alte Caches sauber weichen.
