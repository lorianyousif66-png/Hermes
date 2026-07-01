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

1. **Alles bleibt in EINER Datei** `index.html` (HTML + CSS + Vanilla-JS inline).
   Kein npm, kein React, keine externen Libraries außer der Google-Fonts-Einbindung
   für "Inter". Kein Build-Schritt.
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
- `training` — Session-Logging (Sätze: Gewicht/Wdh./erledigt), Tag-Wechsel,
  Pausen-Timer, Notizfeld, Übungs-Anleitungen (`<details>`).
- `essen` — Ernährungs-Tracker: Tagesbedarf vs. Konsum (Makros + Mikros + Wasser),
  Essen aus Datenbank hinzufügen (`viewFoodPicker`), eigene Lebensmittel.
- `gewicht` — Gewicht eintragen, Verlaufskurve (selbstgezeichnetes SVG), Einträge löschen.
- `mehr` — Editor/Einstellungen als Akkordeon: Profil, Trainingsplan-Editor
  (inkl. Übungs-Bibliothek `viewLibrary`), Protein/Pause, Theme, Trainings-Verlauf,
  Daten-Export/Import/Reset.

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
```

## Datenmodelle

- **Plan-Tag:** `{ id, label, exercises: [...] }`
- **Übung:** `{ id, name, sets, reps, unit, steps:[...] }`
  - `unit`: `"kg"` | `"s"` (Sekunden, z. B. Plank) | `"bw"` (Körpergewicht, kein Gewichtsfeld)
  - `steps`: kurze Anleitungsschritte (aus der Bibliothek kopiert oder leer)
- **Session-Log-Übung:** wie Übung, aber `sets: [{ weight, reps, done }]`
- **Lebensmittel (DB):** kompaktes Array
  `[name, kcal, protein, kohlenh, fett, ballast, VitC, VitD, Ca, Fe, Mg, K]` pro 100 g.
  Reihenfolge = `FKEYS`. Werte sind Näherungswerte.
- **Food-Log-Eintrag:** `{ name, grams, n:{...absolute Nährwerte...} }`

## Wichtige Funktionen / Konstanten

- `EXLIB` — Übungs-Bibliothek nach Muskelgruppe, jede Übung `[name, schritt1, schritt2, …]`.
- `FOODS` / `FKEYS` / `foodObj()` — Lebensmittel-Datenbank.
- `NUT` — Nährstoff-Definitionen für die Fortschrittsbalken.
- `targets()` — berechnet Tagesbedarf aus Profil + aktuellem Gewicht:
  BMR (Mifflin-St Jeor) × Aktivität, ± Ziel; Protein aus `settings.protein` g/kg,
  Fett 0,8 g/kg, Rest Kohlenhydrate; Mikro-Richtwerte nach Geschlecht (DGE, ca.).
- `buildLog(dayId)` — erzeugt die Sätze für eine Trainingseinheit.
- `render()`, `wire()`, `bar()` (Fortschrittsbalken), `svgChart()` (Gewichtskurve).

## Fachliche Leitplanken (Trainings-/Ernährungslogik)

- Wiedereinsteiger: Ganzkörper 2–3×/Woche, moderat starten (2–3 Wdh. "im Tank").
- Fettabbau v. a. über Ernährung: leichtes Defizit (~500 kcal) + Protein 1,8–2,0 g/kg.
- Schicht-Empfehlungen: Früh → nachmittags trainieren; Spät → vormittags;
  Nacht → nur leicht/Cardio; Frei → beste Einheit, aber 1. Tag nach Nacht = Schlaf.
- Nährwerte sind Näherungen — im UI so kommuniziert, nicht als exakt verkaufen.

## Backlog / mögliche nächste Schritte (nur auf Wunsch)

- Mehr Lebensmittel + Suche/Barcode; Portionsvorlagen (Stück/Portion statt nur Gramm).
- Wochen-/Verlaufsansicht für Kalorien & Makros.
- PWA härten: echtes `manifest.json` + Service Worker für Offline-Nutzung
  (nötig für saubere Store-Verpackung via PWABuilder in Phase 2).
- Geräte-Sync (aktuell nur lokal) — bewusst später, eigener Schritt.
- Export als Datei (Download) zusätzlich zur Copy-Sicherung.

## Deploy

GitHub Pages: `index.html` im Repo-Root, Pages auf Branch `main` `/root`.
Nach Push ~1 Min live. Auf dem Handy ggf. Cache leeren / App neu öffnen,
damit Updates erscheinen.
