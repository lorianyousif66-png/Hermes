# Hermes — Trainings- & Ernährungs-App

Kontext-Datei für Claude Code. Bitte vor jeder Änderung lesen.

## Was ist das

Hermes ist eine persönliche Trainings-, Ernährungs- und Tagesplan-App. Der Nutzer
arbeitet derzeit nicht; Schichtplanung ist eine optionale Einstellung. Ziele: Muskelaufbau
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
3. **Design: schlicht, standardmäßig monochrom.** `obsidian` (dunkel) und `marmor`
   (hell) behalten ihre ursprünglichen Farbwerte. Seit 4.0 auf ausdrücklichen Nutzerwunsch
   optionale Paletten `ocean`, `forest`, `purple` sowie ein persönliches Hintergrundbild.
   Obsidian bleibt Standard. Alle Farben aus Theme-Variablen, klare Schrift (Inter).
4. **Name = "Hermes", sonst KEIN griechisch-mythologisches Vokabular.** Frühere
   Versionen hatten Begriffe wie "Arena", "Tempel", "Anapausis", Götternamen,
   griechische Buchstaben — das wurde bewusst entfernt. Bitte nicht wieder einbauen.
   Normale deutsche Begriffe verwenden (Training, Gewicht, Mehr, Pause …).
5. **Sprache der Oberfläche: Deutsch, informell.**
6. Änderungen möglichst **klein und lokal** halten. Nach Änderungen die Datei im
   Browser testen (nicht nur Syntax).

## Wie testen

### Hermes 4 (Oktober 2026)

- 4.4: Tab „Gewicht“ heißt „Fortschritt“, interne ID `gewicht` bleibt erhalten.
  Drei Bereiche Training/Ernährung/Körper; 7/30/90 Tage oder Gesamt. Bestehende
  Trainings-, Essens- und Gewichtsdaten werden nur gelesen, nicht migriert/ersetzt.
  `progressWorkouts` rekonstruiert Bestwerte über die gesamte Historie vor Zeitfilterung;
  erste Bestwerte separat, Verbesserungen je Übung/Einheit-Art. Volumen nur erledigte
  kg-Arbeitssätze ohne Aufwärmen. Charts: Tagesvolumen/Sätze, Übungsleistung (geschätztes
  1RM bei kg), Kalorien/Makros, Gewicht und sieben Umfangsstellen. SVGs ohne Bibliothek,
  echte Datumsabstände, Werte auch als Tabelle zugänglich. Ernährungslücken nicht als 0.
  Ernährungsdurchschnitt nur über Tage mit Einträgen, keine Mangeldiagnose/Gesundheitsscore.
  `knownNutrients` als Snapshot bei neuen Food-Logs; alte Einträge konservativ ausgewertet:
  positive bekannte Werte/integrierte Lebensmittel vs. unbekannte Custom-Mikronährstoffe.
  Fehlende Angaben nicht mit Null verwechseln, bei Teildaten keine %-Bedarfsdeckung.
  Quellen/Erwachsenenreferenzen und Vitamin-D-/Eisen-Grenzen stehen direkt im UI.
  `hermes:measures`: [{date,values:{waist,belly,hip,chest,arm,thigh,calf}}], optionale
  cm-Werte 1–300, eindeutiges gültiges Kalenderdatum. Formular: Datum/Bestandswerte,
  Bearbeiten/Bestätigungs-Löschen, transaktionales Speichern; unsaved Formulardaten
  bleiben bei Chartwechsel im UI-Entwurf erhalten. Backup/Import/Reset/Reload integriert.
  Gewichtsschreibvorgänge ebenfalls erst nach erfolgreichem Speichern übernehmen.
  `test-progress.cjs` außerhalb Repo prüft Berechnungen, Zeiträume, lokale Tagesgrenzen,
  Datenlücken, Messungen/Quota/Backups/offline sowie 60 Theme/Breite/Bereich-Kombinationen.
  Cache v14. Heutige Überschrift ist weiterhin das aktuelle Datum ohne doppelte Zeile.
- 4.3: Lebensmittel/Marken über explizites „Online suchen“ oder Enter finden. Lokaler
  Filter bleibt sofort/offline, keine Online-Anfragen beim Tippen. OFF-Legacy-Volltextsuche
  (`/cgi/search.pl`), da der neuere Suchdienst bei Live-Prüfung kein Browser-CORS erlaubt.
  OFF selbst lieferte beim Live-Test 503; keine Umgehungs-Proxys oder Backend-Abhängigkeit.
  15-s-Timeout, Abbruch veralteter Anfragen, 5-min-Sitzungscache, maximal 8 Anfragen/Minute
  und mindestens 6,5 s Abstand; explizite weitere Seiten. Offline/Fehler/429/Leerzustand.
  Vorschau mit Herkunft/ODbL; erst „Übernehmen“ speichert transaktional unter `hermes:custom`,
  Barcode-/Namens-Deduplizierung. Danach gewohnte Mengenansicht, keine automatische Buchung.
  Nur vollständige Kalorien/Makros, valide Zahlen, kJ-Umrechnung; unbekannte Mikros markiert.
  Gramm-Portionen aus Verpackungsangabe, keine Gleichsetzung von ml und g. Metadaten bleiben
  nach Backup/Reload erhalten. Tests außerhalb Repo: `test-food-online.cjs`; Cache v13.
- 4.2: Lebensmittel-Zeilen öffnen ein natives Detail-Bottom-Sheet mit Menge/Einheit,
  Portionsauswahl (auch halbe/mehrere Portionen), live berechneten Makros, Mahlzeitenwahl
  und Hinzufügen. Nährwerte pro 100 g und Nährstoffprofil bleiben aufklappbar verfügbar.
  Portions-Chips öffnen eine Vorauswahl und buchen nicht mehr sofort. Das schnelle +
  bleibt erhalten. Klicks auf Eingaben/+ lösen kein zusätzliches Öffnen aus.
- `lastFoodAmount` liest die zuletzt protokollierte gültige Grammmenge je Lebensmittel
  direkt aus `hermes:food` (Datum und Eintragsreihenfolge). Liste und Detailansicht werden
  damit vorbelegt; ohne Historie die erste bekannte Portion oder 100 g. Kein neuer
  Speicherschlüssel, daher auch nach Reload, Backup und offline verfügbar. Nur tatsächlich
  gespeicherte Einträge zählen: `addFood` aktualisiert den Zustand erst nach erfolgreichem
  Speichern. Mengen/Nährwerte werden vor Speicherung geprüft und passend skaliert.
- `test-food-details.cjs` prüft UI, Portionsrechnen, Mahlzeiten, letzte Menge, eigene
  Lebensmittel, Speicherfehler, Backup/Offline sowie fünf Paletten bei 320/390 px. Cache v12.
- Training abbrechen: × in der angehefteten Leiste und Button unter „Einheit speichern“.
  `confirmCancelWorkout` fragt per Bottom-Sheet nach. Weitertrainieren/Escape erhalten
  den Entwurf; Bestätigen leert nur die aktive Einheit, stoppt den Timer und entfernt
  `hermes:draft`/Satz-Undo. Vorlage, Verlauf, Rekorde und Rotation bleiben erhalten.
  Noch laufende Löschanimationen können den verworfenen Entwurf nicht wiederherstellen.
- 4.1: Seitenanimationen werden bei jedem echten Ansichtswechsel neu gestartet
  (`animateViewEntrance`/Web Animations). Vorher konnte die unverändert gesetzte
  CSS-Klasse einen erneuten Start verhindern. Kurze Staffelung der ersten Karten,
  deutlichere Menü-/Satz-/Timer-Übergänge. Keine animierte Transformation des gesamten
  Main-Containers, damit angeheftete Steuerelemente stabil bleiben.
- Mehr → Darstellung → Animation testen zeigt eine Vorschau und erklärt, wenn das
  Gerät reduzierte Bewegung fordert. Diese Einstellung bleibt respektiert; keine
  erzwungenen Animationen und keine neue gespeicherte Präferenz. Laufende Animationen
  werden bei Aktivierung reduzierter Bewegung abgebrochen. Cache v11.
- Versionsnummer ausschließlich unten unter Mehr/Einstellungen (`APP_VERSION`),
  nicht in Seitenüberschriften. Der Offline-Hinweis in der Kopfzeile bleibt erhalten.
- Schichtmodus samt Auswahl und Rhythmus in Mehr → Tagesplanung, standardmäßig
  eingeklappt unter den Feineinstellungen. Keine herausgestellte Tagesplanung-Karte.
- Darstellung unter Mehr: fünf Paletten mit Vorschau; `readSettings` migriert alte
  Einstellungen ohne Änderung des bisherigen Themes. `haptics` standardmäßig true,
  `backgroundVisibility` 25 (10–60). `buzz` respektiert die Einstellung für alle Aufrufe;
  differenzierte Impulse für Auswahl, Abschluss, Löschen/Undo. Ohne Browser-Vibration
  nur visuelles Feedback, kein vorgetäuschter Erfolg. Reduzierte Bewegung respektieren.
- Nutzerfoto wird lokal dekodiert, auf maximal 1440 px verkleinert und als JPEG unter
  800.000 Zeichen in `hermes:background` gespeichert. Keine Uploads, keine neue Library.
  Optionaler Farb-Scrim erhält die Lesbarkeit. Sichtbarkeit per Regler, Entfernen jederzeit.
  Backup/Import/Reset unterstützen den neuen Schlüssel; Import erlaubt nur begrenzte
  JPEG/PNG/WebP-Daten, keine SVGs/URLs. Bei Speicherfehler bleibt das vorige Foto erhalten.
- Swipe malt höchstens einmal je Animationsframe, löscht mit kurzer Ausblend-/Höhenanimation
  und bindet die Löschung an das ursprüngliche Satzobjekt. Abbruch/vertikal/letzter Satz
  bleiben geschützt; andere Zeilen rücken flüssig nach. Offenliegende Löschaktion schließt
  bei Tipp außerhalb. `removingSets` + `flushSetRemovals` schließen vorgemerkte Änderungen
  vor Trainingsabschluss oder Verlassen der App ab, damit die Animation keine Daten verliert.
- `workoutSummary` zeigt echte Dauer (bei Alt-Daten „—“), trainierte Übungen, erledigte Sätze,
  Anteil und kg-Volumen aus erledigten Arbeitssätzen ohne Aufwärmen. Körpergewicht/Zeit und
  unerledigte Sätze werden nicht als kg gezählt. Zuspruch und Rekorde beim Abschluss;
  gespeicherte Zusammenfassungen auch über den Verlauf abrufbar. Zurück zur Workout-Übersicht
  erzeugt keinen neuen laufenden Entwurf. Keine doppelten Einheiten bei erneutem Abschluss.
- `test-personalisation.cjs`: echte Bildauswahl/Komprimierung, Reload, Backup, ungültiger Import,
  Speicherplatzfehler, Haptik-Schalter, fünf Paletten, Zusammenfassungswerte und mobile Breiten.
  Bestehende Touch-/Vorlagen-/Tagesplan-/Offline-Prüfungen weiterhin nutzen. Cache v10.

### Hermes 3 (Oktober 2026)

- 3.1: Training → Vorlagen zeigt Karten statt des Tabellen-Editors. `templateDraft`
  ist eine separate Kopie; erst Speichern schreibt in `hermes:plan`. Ungespeicherte
  Änderungen werden beim Verlassen bestätigt. Neue Vorlagen, Duplikate und Löschen
  über Kartenmenü; aktive Vorlagen und die letzte Vorlage können nicht gelöscht werden.
  Der Assistent fügt Vorlagen hinzu, ohne vorhandene Vorlagen/aktive Einheiten zu ersetzen.
- Tipp auf Vorlagen-Übungsnamen öffnet `showTemplateExercise`: Ersetzen, Sätze/Ziel/Einheit,
  Reihenfolge und Entfernen. `openExercisePicker` als natives Bottom-Sheet bietet Suche,
  Muskelgruppen, Mehrfachauswahl zum Hinzufügen und eigene Übungen. Speichern einer
  Vorlage lässt eine laufende Einheit unverändert. Keine neuen Speicherschlüssel.
- Auch in der aktiven Einheit öffnet der Übungsname das Optionsmenü. Ersetzen gilt nur
  für diese Einheit, fragt vor Verwerfen bereits eingegebener Satzwerte und bleibt nach
  Reload erhalten. Alte Historie/Rekorde und die Vorlage bleiben unverändert. Cache v9.
- `test-templates.cjs` prüft den gesamten Vorlagenablauf, Abbruch, Übungen ersetzen,
  aktive Entwürfe, Wiederherstellung, beide Themes und schmale Handyansichten.
- Beide Farbpaletten unverändert. Kürzere Seitenüberschriften, ruhigere Flächen,
  einheitliche Navigation und Bedienelemente. Ernährung: Trends/Mikronährstoffe
  aufklappbar; Plan-Assistent ebenfalls. `render` erhält geöffnete `data-disclosure`
  bei Änderungen in derselben Ansicht.
- Training startet mit Workout-Karten (`trainingHome`). `data-begin` öffnet und startet
  die gewählte Einheit; ein vorhandener Entwurf wird fortgesetzt. Wechsel zu einem
  anderen Workout erfordert weiterhin die bestehende Verwerfen-Bestätigung.
- `workoutFocused` blendet während der Einheit App-Kopf und Hauptnavigation aus.
  Die angeheftete Leiste enthält Minimieren, Dauer/Übungsauswahl und Beenden.
  Minimieren erhält den Entwurf und die Scrollposition; Fortsetzen stellt sie wieder her.
  `workoutOpen`, `workoutMinimized`, `workoutScroll` sind nur UI-Zustand.
- Übungskarten zeigen kompakte Sätze, vorherige Werte und einklappbare Notizen.
  Optionen (···) öffnen ein natives Dialog-Bottom-Sheet mit Anleitung, Verlauf,
  Notiz und Satzentfernung. N/F/W/D öffnet eine direkte Satztyp-Auswahl statt Durchschalten.
  Swipe/Undo, Dauer, Rekorde, Entwürfe und alle Speicherformate bleiben erhalten.
- Pausentimer aktualisiert nur Text/Balken: Buttons werden bei Ticks nicht ersetzt,
  damit Tastaturfokus und Klicks erhalten bleiben. Offline-Shell: Service Worker v8.
- Browserprüfung außerhalb des Repos: `test-redesign.cjs`, `test-swipes.cjs`,
  `test-hermes.cjs`: Start/Minimieren/Fortsetzen, Navigation, Dialoge, Speicherung,
  echte Touch-Swipes, alle Tabs, beide Themes, 320/390/560/1024 px und Offline.

### Hermes 2 (September 2026)

- Beide ursprünglichen Farbpaletten bleiben unverändert. Neue Gestaltung: Seitenüberschriften,
  Fokus-Karte, Schnellaktionen, Makro-Übersicht, Wasser-Schnelleingabe, schwebende Navigation,
  größere Bedienelemente und sichtbarer Tastaturfokus. Zoom und reduzierte Bewegung werden unterstützt.
- Tagesplan: eigenes Formular (`taskEditorForm`) zum Hinzufügen/Bearbeiten, `dayUndo` für die
  letzte Änderung, eindeutige Treffer bei Textbefehlen, Sprache erst als bestätigbarer Entwurf.
  `data-taskdelete` gehört ausschließlich zum Tagesplan; `data-daydel` bleibt dem Trainingsplan vorbehalten.
- Schichtmodus ist standardmäßig aus, auch bei alten Einstellungen ohne `shiftMode`.
  Unter Mehr → Tagesplanung lässt er sich aktivieren. `effShift` ignoriert gespeicherte Schichten,
  solange der Modus aus ist; Heute zeigt dann normale Tagesplanung und Training/Erholung.
  Schichtauswahl, Wochenvorschau und Rhythmus-Editor erscheinen nur unter Mehr bei aktivem Modus.
  Heute bleibt in beiden Modi neutral: keine Schichtkarte, keine schichtbezogenen Fokus-Texte und keine
  automatisch vorgegebenen Arbeitsblöcke. Alte Schicht-Einträge werden im sichtbaren Tagesplan ausgelassen,
  ohne gespeicherte Termine zu löschen. Gespeicherte Schichtdaten bleiben erhalten.
  Tagespläne speichern `mode` und `savedModes`: Beim Wechsel wird der bisherige Plan aufgehoben,
  persönliche Termine werden in eine neue Vorlage übernommen; Rückwechsel stellt den anderen Plan wieder her.
  `source: template/custom` unterscheidet künftig automatisch erzeugte von selbst bearbeiteten Punkten.
- Nachtschicht-Einträge können `dayOffset: 1` für den Folgetag enthalten; Sortierung berücksichtigt
  diesen Wert. Automatische Vorlagen respektieren den ersten freien Tag nach Nacht und Training am Vortag.
  Ein angepasster Plan bleibt bei Schichtänderungen erhalten und zeigt einen Hinweis auf die neue Vorlage.
- Tageswechsel wird beim Wiederöffnen und alle 30 Sekunden in der sichtbaren App erkannt.
- `hermes:draft` speichert laufende Trainingseinheiten. `persistWorkout` / `restoreWorkout`
  erhalten Satzwerte und Notizen nach Reload. Beim Abschluss wird der Entwurf entfernt.
  Vor Wechsel zu einer anderen Einheit wird bei ungespeicherten Eingaben nachgefragt.
- Pausen basieren auf einer Endzeit statt auf gezählten Intervallen; Hintergrundpausen verfälschen sie nicht.
- Training → Einheit: Satz nach links wischen (kurz = Löschbutton, weit = direkt entfernen).
  Alternativ die Satznummer antippen. Pointer Events mit Richtungsbindung und `touch-action: pan-y pinch-zoom`
  lassen vertikales Scrollen zu; Abbruch und kurze Wischbewegungen löschen nichts.
  `removeTrainingSet` / `undoTrainingSet` ändern nur die laufende Einheit (mindestens ein Satz bleibt).
  Undo erscheint kurz unten und dauerhaft oben in der Einheit; Gewichte, Wiederholungen und Erledigt-Status
  werden vollständig wiederhergestellt. Auch leere, strukturell geänderte Einheiten werden zwischengespeichert.
- Training → Einheit: Startzeit und Dauer laufen ab „Starten“ oder der ersten Eingabe und werden im Entwurf
  gespeichert. Der Verlauf enthält die Dauer neuer Einheiten; alte Einträge bleiben lesbar.
  „Vorher“ zeigt pro Satz den gleich positionierten, erledigten Satz aus der letzten Einheit dieser Übung.
  Satztyp wechselt N (Normal) → F (Muskelversagen) → W (Aufwärmen) → D (Dropsatz);
  Aufwärmsätze zählen nicht für Rekorde oder „Letztes Mal“. Der Pausen-Timer kann pausiert, fortgesetzt,
  um ±15 Sekunden geändert, neu gestartet und übersprungen werden. „Übungsverlauf ansehen“ öffnet
  im Übungsfenster die letzten Bestwerte und eine monochrome Leistungskurve. Übungseinstellungen/Notizen
  (z. B. „Sitz 5“) werden je Einheit gespeichert und beim nächsten Mal aus der letzten Einheit vorbelegt.
  Die Farbschemata bleiben unverändert.
- Lebensmittelauswahl: zuletzt verwendete Einträge priorisieren, 12 Ergebnisse zunächst anzeigen,
  Suchfilter und leere Treffer erklären; Einzelzutaten mit kurzem Status statt Overlay bestätigen.
- Backups werden vollständig validiert, bevor Daten geschrieben werden. Die Gewichtskurve verwendet
  tatsächliche Datumsabstände. Service Worker v7 überschreibt die Offline-App nicht mit HTTP-Fehlerseiten
  und validiert die App-Seite bei Online-Aufrufen neu, damit alte HTTP-Caches kein Update verdecken.
- Browser-Regressionsprüfung außerhalb des Repositories: beide Themes, 320/390/560/1024 px,
  alle Tabs und Unteransichten, Tagesplan/Undo, Entwurfswiederherstellung, Import, Tageswechsel und Offline.

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

- `heute` — **oben Übersicht** (`ovrCard`): Kalorien-Ring + „Gegessen"/„Verbraucht"
  daneben, Buttons „+ Aktivität" / „Essen". Darunter Trainings-Empfehlung, Mini-Stats
  (inkl. Essens-Serie `foodStreak()`). Die Fokus-Karte richtet sich nur nach Training/Erholung.
  Schichtbedienung gehört ausschließlich in die Einstellungen; bei aktiviertem Modus kann
  `isRestAfterNight` weiterhin die Uhrzeiten der Tagesvorlage anpassen.
  „+ Aktivität" öffnet den Aktivitäten-Picker (`viewActivityPicker`, `state.actAdding`):
  Aktivität + Dauer → geschätzter Kalorienverbrauch (`ACTS` MET-Werte, `actKcal`),
  Tagesverbrauch via `burnedToday()`.
- `training` — Unternavigation (`state.trainView`: `log` | `plan` | `hist`, via `trainNav()`):
  - **Workouts** (`log`): Workout-Karten, danach fokussiertes Session-Logging
    (Sätze: Gewicht/Wdh./erledigt), Pausen-Timer, Notizen, Übungsoptionen als Bottom-Sheet.
  - **Vorlagen** (`plan`): Vorlagen-Karten und separater Editor (`planEditor`),
    Übungsoptionen/Übungsbibliothek als Bottom-Sheets. Optionaler Assistent (`wizEditor`).
  - **Verlauf** (`hist`): Trainings-Historie (`histEditor`).
- `essen` — Ernährungs-Tracker: Tagesbedarf vs. Konsum (Makros + Mikros + Wasser).
  Einträge sind in **Mahlzeiten** gruppiert (`MEALS`: Frühstück/Mittag/Abend/Snacks,
  Feld `meal` am Food-Log-Eintrag; alte Einträge ohne `meal` → Snacks). Je Mahlzeit
  „+ Hinzufügen" (öffnet `viewFoodPicker` mit Vorauswahl `state.mealFor`) und
  „↺ Wie gestern" (`data-copymeal`, kopiert die gestrige Mahlzeit). Beim Hinzufügen
  Belohnungs-Animation (`showReward`, `QUOTES`, Overlay `#reward` statisch im Body).
  Tipp auf Zutat im Picker → Nährwert-/Gesundheits-Info (`openFoodInfo`, `foodHealth`).
  Fehlt das Gewicht, bietet der Platzhalter die Gewichtseingabe direkt an.
  Außerdem: Barcode-Scan, Portions-Chips, eigene Lebensmittel, 7-Tage-Wochenverlauf
  (`weekCard`), Makro-Verlaufskurve (`trendCard`, Metrik `state.trendMetric` und
  Zeitraum `state.trendDays` 14/30/90 umschaltbar).
- `gewicht` — „Fortschritt“: Training/Ernährung/Körper mit Zeitraumfilter, Diagrammen
  und Auswertungen. Gewicht eintragen, Verlauf (inkl. Ø kg/Woche ab 7 Tagen), Umfangs-
  messungen pro Datum eintragen/bearbeiten/löschen. Bestehende Navigation-ID bleibt.
- `mehr` — **nur Einstellungen** als Akkordeon: Darstellung (Theme), Profil & Ziel
  (`profileEditor`, inkl. Ernährungsziel), Feineinstellungen Protein/Pause (`goalsEditor`),
  Daten sichern (Datei-Download/-Upload + Copy-Export/Import/Reset). Trainingsplan &
  Verlauf liegen bewusst NICHT hier, sondern im Tab „Training".

## localStorage-Keys (`K`-Objekt) — NICHT umbenennen (sonst Datenverlust)

```
hermes:plan      Trainingsplan (Tage + Übungen)
hermes:settings  { theme, rest, protein, shiftMode, haptics, backgroundVisibility }
hermes:background lokal verkleinertes Hintergrundbild (Data-URL, optional)
hermes:profile   { sex, age, height, activity, goal }
hermes:bw        Gewichtsverlauf [{date, kg}]
hermes:measures  Körperumfänge [{date, values:{waist,belly,hip,chest,arm,thigh,calf}}] in cm
hermes:hist      Trainings-Historie
hermes:last      letzte Bestwerte pro Übung (für "Letztes Mal")
hermes:next      ID des nächsten Trainingstags (Rotation)
hermes:shifts    { "YYYY-MM-DD": shiftKey }
hermes:food      { "YYYY-MM-DD": [foodEntries] }
hermes:water     { "YYYY-MM-DD": ml }
hermes:acts      { "YYYY-MM-DD": [{name, min, kcal}] }  Aktivitäten/Kalorienverbrauch
hermes:custom    eigene Lebensmittel
hermes:pr        persönliche Rekorde { übungsname: {score, weight, reps, unit, date} }
hermes:rota      Schichtrhythmus { start: "YYYY-MM-DD", seq: [shiftKey, …] }
hermes:dayplans  automatisch erzeugte Tagespläne je Datum inkl. manueller Änderungen
```

## Datenmodelle

- **Plan-Tag:** `{ id, label, exercises: [...] }`
- **Übung:** `{ id, name, sets, reps, unit, steps:[...] }`
  - `unit`: `"kg"` | `"s"` (Sekunden, z. B. Plank) | `"bw"` (Körpergewicht, kein Gewichtsfeld)
    | `"min"` (Minuten, Cardio — kein Gewichtsfeld)
  - `steps`: kurze Anleitungsschritte (aus der Bibliothek kopiert oder leer)
- **Session-Log-Übung:** wie Übung, aber `note` (Übungseinstellung) und `sets: [{ weight, reps, done, type }]`,
  wobei `type` für ältere Daten fehlen darf (dann `normal`).
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
  (`rotaApplied`). Auswahl und 7-Tage-Vorschau unter Mehr, nicht im Heute-Tab.
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
- `dayTotals()` / `trendCard()` / `trendChart()` — Makro-Verlaufskurve (SVG-Linie mit
  Zielmarke), umschaltbar über `state.trendMetric` (kcal/p/c/f) und `state.trendDays`
  (14/30/90 Tage).
- `MEALS` / `showReward()` / `QUOTES` — Mahlzeiten-Gruppen im Essen-Tab + Belohnungs-
  Animation (Haken + wechselnder Spruch, Overlay `#reward` statisch im Body, imperativ).
- `openFoodInfo(idx)` / `foodHealth(f)` — Lebensmittel-Detail über das native
  Bottom-Sheet (`trainingSheet`): Portion/Menge, berechnete Makros, Mahlzeit und Hinzufügen;
  aufklappbar Nährwerte pro 100 g und Nährstoffprofil, auch für eigene Lebensmittel.
- `prevShift(date)` / `isRestAfterNight(date)` — „1. Tag nach Nacht = Schlaf" im Heute-Tab.
- `foodStreak()` — Serie aufeinanderfolgender Tage mit Essens-Einträgen (Heute-Kachel).
- `ACTS` / `actKcal(met,min,kg)` / `burnedToday()` / `viewActivityPicker()` — Aktivitäten
  im Heute-Tab: `ACTS` = `[Name, MET]`, Verbrauch = MET × kg × h (Gewicht `latestKg()||75`).
  Einträge in `hermes:acts`; Anzeige „Verbraucht" in der Übersicht (`ovrCard`).
- `buzz(pattern)` — kurze Bestätigungs-Vibration (Android; sonst No-Op): Satz-Haken,
  Belohnung, Wasser, Einheit speichern.
- `PLAN_TEMPLATES` / `generatePlan(focus, days)` — Plan-Assistent unter „Mehr". `focus`:
  `"aufbau"` (Muskelaufbau) | `"fettabbau"` (+ Cardio-Finisher) | `"beides"`; `days` 2–4.
  Steuert Wdh.-Bereich, Sätze und Cardio. UI-Zustand liegt in `state.wiz`.
- `buildLog(dayId)` — erzeugt die Sätze für eine Trainingseinheit.
- `doDownload()` / `doFileImport()` / `applyImportObj()` — Backup als Datei speichern/laden
  (zusätzlich zur Copy-Sicherung `doExport`/`doImport`).
- `render()`, `wire()`, `bar()` (Fortschrittsbalken), `svgChart()` (Gewichtskurve).
- `dayPlanTemplate()` / `ensureDayPlan()` / `applyDayCommand()` — erzeugt im Heute-Tab
  pro Kalendertag einen normalen, optional schichtabhängigen Tagesplan. Freie deutsche Kurzbefehle können
  Punkte hinzufügen, verschieben, erledigen oder entfernen; Spracheingabe nutzt optional
  die eingebaute Web-Speech-API des Browsers.

## Fachliche Leitplanken (Trainings-/Ernährungslogik)

- Wiedereinsteiger: Ganzkörper 2–3×/Woche, moderat starten (2–3 Wdh. "im Tank").
- Fettabbau v. a. über Ernährung: leichtes Defizit (~500 kcal) + Protein 1,8–2,0 g/kg.
- Body Recomp (Fett ↓ + Muskel ↑ gleichzeitig): nahe Erhaltung (~−200 kcal), Protein
  hoch (≥ 2,0 g/kg) — passt gut für Wiedereinsteiger ("muscle memory").
- Schicht-Empfehlungen: Früh → nachmittags trainieren; Spät → vormittags;
  Nacht → nur leicht/Cardio; Frei → beste Einheit, aber 1. Tag nach Nacht = Schlaf.
- Nährwerte sind Näherungen — im UI so kommuniziert, nicht als exakt verkaufen.

## Backlog / mögliche nächste Schritte (nur auf Wunsch)

Erledigt: Portionsvorlagen · größere Lebensmittel-DB (~90 Einträge) · Wochen-Verlauf
Kalorien/Makros · PWA offline (manifest.json + Service Worker) · Datei-Export/-Import ·
Plan-Assistent (Muskelaufbau/Fettabbau/Beides + Tage 2–4) · Barcode-Scan (Open Food
Facts) · Makro-Verlaufskurve 14/30/90 Tage wählbar · Ziel „Body Recomp" ·
Mahlzeiten-Kategorien + Belohnungs-Animation · Zutaten-Info (Nährwerte + „Warum
gesund") · „Wie gestern"-Kopie je Mahlzeit · Essens-Serie · Schlaf-Empfehlung nach
Nachtblock · Ø kg/Woche · Tipp-Feedback + Vibration · Heute-Übersicht mit Kalorien-Ring ·
Aktivitäten-Tracking (Kalorienverbrauch, MET-basiert).

Offen:
- Noch mehr eingebaute Lebensmittel-Einträge.
- Geräte-Sync (aktuell nur lokal) — bewusst später, eigener Schritt.

## Deploy

GitHub Pages: `index.html` (+ `manifest.json`, `icon.svg`, `sw.js`) im Repo-Root,
Pages auf Branch `main` `/root`. Nach Push ~1 Min live.

**Updates:** Der Service Worker lädt die App-Seite (`index.html`) **"Netzwerk zuerst"** —
installierte Geräte bekommen mit Internet beim Öffnen automatisch die neueste Version
(offline die zuletzt gespeicherte). Ein `CACHE`-Bump in `sw.js` (`hermes-v2` → `v3` …)
ist nur bei größeren Änderungen nötig (z. B. an `manifest.json`/`icon.svg` oder der
SW-Logik selbst), damit alte Caches sauber weichen.
