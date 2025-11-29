# 🖨️ 3D Printer Calculator App

> **🌍 Sprachauswahl**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Eine moderne Desktop-Anwendung zur Berechnung von 3D-Druckkosten. Erstellt mit Tauri v2, React Frontend und Rust Backend.

## ✨ Funktionen

- 📊 **Kostenberechnung** - Automatische Berechnung von Filament-, Strom-, Trocknungs- und Verschleißkosten
- 🧵 **Filamentverwaltung** - Filamente hinzufügen, bearbeiten, löschen (Marke, Typ, Farbe, Preis)
- 🖨️ **Druckerverwaltung** - Drucker und AMS-Systeme verwalten
- 💰 **Gewinnberechnung** - Wählbarer Gewinnprozentsatz (10%, 20%, 30%, 40%, 50%)
- 📄 **Angebote** - Angebote speichern, verwalten und als PDF exportieren (Kundenname, Kontakt, Beschreibung)
- 📅 **Kalender-Integration** - Druckfälligkeitsdaten für Angebote festlegen, Kalenderansicht mit akzeptierten/abgeschlossenen/abgelehnten Angeboten, Statusindikatoren (akzeptiert ✅, abgelehnt ❌, abgeschlossen ✔️), Liste der anstehenden Drucke (heute und morgen), Benachrichtigung über überfällige Drucke
- 🧠 **Filter-Voreinstellungen** - Angebotsfilter speichern, schnelle Voreinstellungen anwenden, datums-/zeitbasierte automatische Filter
- 🗂️ **Status-Dashboard** - Statuskarten, schnelle Filter und Zeitachse der letzten Statusänderungen
- 📝 **Statusnotizen** - Jede Statusänderung mit optionalen Notizen und Verlaufprotokollierung
- 👁️ **PDF-Vorschau & Vorlagen** - Integrierte PDF-Vorschau, wählbare Vorlagen und Firmen-Branding-Blöcke
- 🎨 **Filament-Farbbibliothek** - Über 12.000 Fabrikfarben mit marken- und typspezifischen wählbaren Panels
- 💾 **Filament-Bibliothekseditor** - Modalbasierte Hinzufügung/Bearbeitung, Duplikatswarnungen und persistente Speicherung in `filamentLibrary.json`
- 🖼️ **Filamentbilder in PDF** - Anzeige von Filament-Logos und Farbmustern in generierten PDFs
- 🧾 **G-Code-Import & Entwurfserstellung** - G-Code/JSON-Exporte (Prusa, Cura, Orca, Qidi) aus Modal im Rechner laden, mit detaillierter Zusammenfassung und automatischer Angebotsentwurfsgenerierung
- 📈 **Statistiken** - Übersichtsdashboard für Filamentverbrauch, Umsatz, Gewinn
- 👥 **Kundendatenbank** - Kundenverwaltung mit Kontaktinformationen, Firmendaten und Angebotsstatistiken
- 📊 **Preisverlauf und Trends** - Verfolgung von Filamentpreisänderungen mit Diagrammen und Statistiken
- 🌍 **Mehrsprachig** - Vollständige Übersetzung in Ungarisch, Englisch, Deutsch, Französisch, Vereinfachtem Chinesisch, Tschechisch, Spanisch, Italienisch, Polnisch, Portugiesisch, Slowakisch, Ukrainisch und Russisch (14 Sprachen, 850+ Übersetzungsschlüssel pro Sprache)
- 💱 **Mehrere Währungen** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 Währungen)
- 🔄 **Automatische Updates** - Prüft GitHub Releases auf neue Versionen
- 🧪 **Beta-Versionen** - Beta-Branch und Beta-Build-Unterstützung
- ⚙️ **Beta-Prüfung** - Konfigurierbare Beta-Versionsprüfung
- 🎨 **Responsives Layout** - Alle Anwendungselemente passen sich dynamisch an die Fenstergröße an
- ✅ **Bestätigungsdialoge** - Bestätigungsanfrage vor dem Löschen
- 🔔 **Toast-Benachrichtigungen** - Benachrichtigungen nach erfolgreichen Vorgängen
- 🔍 **Suche & Filter** - Filamente, Drucker und Angebote durchsuchen
- 🔎 **Online-Preisvergleich** - Ein Klick öffnet Google/Bing-Suchergebnisse für ausgewähltes Filament, Preis sofort aktualisierbar
- 📋 **Duplizierung** - Einfache Angebotsduplizierung
- 🖱️ **Drag & Drop** - Angebote, Filamente und Drucker durch Ziehen neu anordnen
- 📱 **Kontextmenüs** - Rechtsklick-Menüs für schnelle Aktionen (bearbeiten, löschen, duplizieren, exportieren)
- 🍎 **Plattformspezifische Funktionen** - macOS Dock-Badge, native Benachrichtigungen, System-Tray-Integration

## 📋 Änderungsprotokoll (Changelog)

### v1.7.0 (2025) - 💾 Backup-System, Ladebildschirm und Filament-Bibliothek Verbesserungen

- 💾 **Vollständige Backup-System-Implementierung**
  - Automatisches Backup-System mit einer Backup-Datei pro Tag (wird nur an einem neuen Tag erstellt)
  - Backup-Erinnerung Hook und UI-Komponente - Benachrichtigung, wenn kein Backup existiert
  - Backup-Verlauf UI in Einstellungen - farbcodierte Liste (grün/gelb/rot/grau) mit Backup-Dateialter und Lösch-Countdown
  - Autosave-Modal-Fenster - Erklärung beim Aktivieren von Autosave
  - Autosave und automatisches Backup synchronisiert - automatisches Backup bei Autosave-Speicherung
  - Factory Reset löscht jetzt automatische Backup-Dateien
  - Backup-Verlauf aktualisiert sich automatisch, wenn Autosave aktiviert wird
- 🔧 **Backup-System-Backend-Optimierung**
  - Backend-Befehle zum Löschen alter Backups hinzugefügt (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
  - Frontend-Cleanup-Funktionen aktualisiert, um Backend-Befehle zu verwenden, wodurch "forbidden path"-Fehler eliminiert werden
  - Alle Dateioperationen (Erstellen, Löschen, Auflisten) erfolgen jetzt vom Backend aus, wodurch Tauri-Berechtigungsprobleme vermieden werden
- ⚡ **Backup-System-Leistungsoptimierung**
  - `hasTodayBackup()` optimiert: verwendet `list_backup_files` Backend-Befehl, keine Notwendigkeit, alle Dateien zu lesen
  - Sperrmechanismus hinzugefügt, um parallele Backup-Erstellung zu verhindern
  - Schnellere Bedienung auch bei großen Mengen von Backup-Dateien
- 📁 **Backup-Verzeichnis öffnen und Log-Verlauf**
  - Button in Einstellungen → Backup-Verlauf hinzugefügt, um den Backup-Ordner zu öffnen
  - Neuer Log-Verlauf-Bereich in Einstellungen - Log-Dateien auflisten und öffnen
  - Automatisches Löschen von Log-Dateien nach Tagen konfigurierbar
  - Plattformübergreifende Unterstützung (macOS, Windows, Linux)
- 🎨 **Vollständige Ladebildschirm-Neugestaltung**
  - App-Logo als Hintergrund mit Glassmorphismus-Effekten integriert
  - Fixes Layout für Häkchen - automatisches Scrollen, nur 3 Module gleichzeitig sichtbar
  - Shimmer-Effekte, pulsierende Punkt-Animationen
  - Scroll-Container mit versteckter Scrollbar
- ⚙️ **Ladevorgang-Verbesserungen**
  - Verlangsamtes Laden (800ms Verzögerungen) - Lademeldungen sind lesbar
  - Fehlerbehandlung für jedes Modul (try-catch-Blöcke)
  - Physische Log-Datei für alle Status und Fehler
  - Lade-Zusammenfassung am Ende
- 🎨 **Mehrsprachige Filament-Bibliothek-Unterstützung**
  - Filament-Farben werden in allen unterstützten Sprachen angezeigt (nicht nur Ungarisch/Deutsch/Englisch)
  - Fallback-Logik: Englisch → Ungarisch → Deutsch → rohe Farbe/Name
  - Einstellungen, Globale Suche und Filamente Komponenten aktualisiert
- 🔄 **Factory Reset Verbesserungen**
  - Physische Dateien-Löschung (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
  - Store-Instanz-Reset ohne Neuladen
  - Sprachauswahl wird nach Factory Reset angezeigt
- 🎓 **Tutorial mit v1.7.0-Funktionen aktualisiert**
  - Neue Schritte: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
  - Demo-Daten erweitert: 6 Filamente → 11 Filamente, 3 Angebote → 5 Angebote
  - Übersetzungsschlüssel für alle Sprachen hinzugefügt

### v1.6.0 (2025) - 📊 Interaktive Widgets & Leistung großer Tabellen

- 🧠 **Interaktive Diagramme & Detail-Modals**
  - Alle Haupt-Dashboard-Diagramme verwenden jetzt eine einheitliche `InteractiveChart`-Komponente mit klickbaren Datenpunkten und animierten Detail-Modals.
  - Tooltips und Modals zeigen lokalisierte, menschenlesbare Beschriftungen für Umsatz, Kosten, Gewinn und Anzahl der Angebote.
  - Trend-Diagramme unterstützen direktes Perioden-Filtering über den Brush (wöchentliche / monatliche / jährliche Segmente werden an das Dashboard gesendet).

- 🧵 **Virtuelles Scrollen für große Listen**
  - Benutzerdefiniertes virtuelles Scrollen für die Angebotsliste und die Filament-Tabelle – nur sichtbare Zeilen werden gerendert, wodurch das Scrollen auch bei 10k+ Elementen flüssig bleibt.
  - Einstellungen → Filament-Bibliothek verwendet dasselbe virtuelle Scroll-Muster, sodass die vollständigen 12.000+ Farbeinträge reaktionsfähig bleiben.
  - Scrollbar-Position und -Höhe bleiben genau, dank Spacer-Elementen oberhalb und unterhalb des sichtbaren Fensters.

- 📋 **Erweiterte Tabellensortierung & -filterung**
  - Mehrspalten-Sortierung für Filamente und Angebote (Klick für aufsteigend/absteigend, Shift+Klick zum Erstellen von Sortierketten wie "Marke ↑, dann Preis/kg ↓").
  - Sortierkonfiguration wird in den Einstellungen gespeichert, sodass die bevorzugte Reihenfolge beim nächsten Start wiederhergestellt wird.
  - Filamente: spaltenspezifische Filter für Marke, Material/Typ und Farbe/HEX.
  - Angebote: numerische Bereichsfilter für Gesamtbetrag (min/max) und Datumsbereichsfilter (von/bis).

### v1.5.0 (2025) - 🧠 Intelligentes Dashboard & Frist-Erinnerungen

- ⏱️ **Druckfrist-Erinnerungen** – Neues Erinnerungssystem für angenommene Angebote:
  - Das Widget „Geplante Aufgaben“ erhält automatisch Aufgaben aus Angeboten mit anstehenden Druckfristen
  - Im Header werden abwechselnd Hinweise im Stil „Heute / Morgen / Übermorgen“ für bevorstehende Druckaufträge angezeigt
  - Eine persistente Info-Toast warnt vor dringenden Fristen, bis der Benutzer sie manuell schließt
- 🧵 **Filament-Lagerverwaltung** – Neue, dedizierte Ansicht für den Filamentbestand:
  - Suche nach Marke / Typ / Farbe mit Statusfiltern (kritisch / niedrig / OK)
  - Einstellbare kritische und niedrige Schwellenwerte, Inline-Bestandsbearbeitung und schnelle +100g / −100g-Schaltflächen
  - Das „Filament Stock Alert“-Widget liest direkt aus diesen Schwellenwerten und den aktuellen Lagerständen
- 📊 **Dashboard-Verbesserungen** – Alle Widgets standardmäßig im Dashboard aktiviert:
  - Quick Actions, Recent Offers, Filament Stock Alerts, Financial Trends, Active Projects, Scheduled Tasks
  - Klassische Home-Ansicht und Widget-Dashboard verwenden jetzt ein konsistenteres Set an Statistiken und Diagrammen
- 🧱 **Angebots-UX-Verbesserungen** – Komfortablere Bearbeitung und Mehrfachauswahl:
  - Fälle behoben, in denen ein bearbeitetes Angebot nicht sofort in der Hauptliste aktualisiert wurde
  - Das Mehrfachauswahl-Kontrollkästchen wurde aus dem Titeltext heraus verschoben, sodass Kundennamen vollständig lesbar bleiben
- 🧭 **Header- & Layout-Feintuning**:
  - Die Breadcrumb-Leiste wurde aus der Kopfzeile entfernt, um die Oberfläche aufgeräumter zu machen
  - Minimale Fenstergröße (1280x720) wird nun auf Tauri-Ebene erzwungen, ohne horizontale Scrollbalken zu erzwingen

### v1.4.33 (2025) - 🔧 Widget-Layout & Drag-Verbesserungen + Tutorial Demo-Daten

- 📊 **Widget-Layout-Fixes** - Behobene Widget-Positionierung und Drag-Funktionalität:
  - Behobene automatische Positionierung von 6 kleinen "S"-Größen-Widgets, um nebeneinander ausgerichtet zu werden
  - Widgets behalten jetzt ihre Positionen nach manuellem Drag & Drop bei
  - Behobene Layout-Persistenz - Widgets springen nicht mehr zu ihren ursprünglichen Positionen zurück
  - Verbesserte Drag-Handle-Funktionalität - Widgets können vom Header oder Drag-Handle-Balken gezogen werden
  - Behobene Leerstellenprobleme unter Widgets nach Neupositionierung
  - Verbesserte Layout-Änderungsbehandlung, um manuelle Änderungen nicht zu überschreiben
- 🎓 **Tutorial Demo-Daten-System** - Automatische Demo-Daten-Generierung und -Bereinigung:
  - Demo-Daten werden automatisch generiert, wenn das Tutorial startet (wenn keine vorhandenen Daten vorhanden sind)
  - Demo-Daten enthalten Beispiel-Drucker, Filamente, Angebote und Kunden
  - Demo-Daten werden automatisch gelöscht, wenn das Tutorial abgeschlossen oder übersprungen wird
  - Anwendung startet automatisch nach dem Löschen der Demo-Daten neu, um den Speicher zu leeren
  - Einstellungen bleiben beim Löschen der Demo-Daten erhalten (Sprache, Tutorial-Status)
  - Behobenes Endlosschleifen-Problem - Tutorial startet nach Abschluss nicht mehr neu
- 🔧 **Main Build Release-Fix** - Verbesserte GitHub-Release-Erstellung:
  - Release-Datei-Überprüfung vor der GitHub-Release-Erstellung hinzugefügt
  - Verbesserte Release-Erstellung, um sicherzustellen, dass die neueste Version korrekt angezeigt wird
  - Behobenes Release-Namensformat für Konsistenz

### v1.3.12 (2025) - 🎨 Widget-System & Währungsverbesserungen

- 📊 **Widget-System Verbesserungen** - Erweiterte Widget-Funktionalität und Lokalisierung:
  - Neue Widgets hinzugefügt: Druckzeit-Diagramm, Kundenstatistik-Diagramm, Angebotsstatus-Diagramm
  - Widget-Export-Funktionalität behoben - alle Diagramm-Widgets jetzt als SVG exportierbar
  - Dynamische Widget-Titel-Übersetzung basierend auf ausgewählter Sprache
  - Lokalisierte Export-Dateinamen mit OS-kompatibler Benennung (Unterstriche, keine Sonderzeichen)
  - Widget-Sprachen aktualisieren sich sofort nach Sprachänderung
  - Toast-Benachrichtigungen für erfolgreiche Diagramm-Exporte
  - Alle Widget-Elemente und Ladezustände vollständig in allen 14 Sprachen übersetzt
- 💱 **Währungsunterstützung erweitert** - Erweiterte Währungsunterstützung:
  - Hinzugefügte Währungen: GBP (Britisches Pfund), PLN (Polnischer Zloty), CZK (Tschechische Krone), CNY (Chinesischer Yuan), UAH (Ukrainische Hryvnia), RUB (Russischer Rubel)
  - Währungssymbole und -bezeichnungen für alle neuen Währungen
  - Korrekte Währungsumrechnung und -anzeige in allen Komponenten
  - Währungsauswahl-Dropdown mit allen unterstützten Währungen aktualisiert
- 💰 **Kostenberechnungs-Präzisionsfix** - Gleitkomma-Präzisionsprobleme behoben:
  - Alle Kostenberechnungen (Filament, Strom, Trocknung, Nutzung, Gesamt) jetzt auf 2 Dezimalstellen gerundet
  - Lange Dezimalanzeigen eliminiert (z.B. `0.17500000000000002` → `0.18`)
  - Konsistente Zahlenformatierung in der gesamten Anwendung
- 🏢 **Firmeninformations-Dialog** - Verbesserte Firmeninfo-Verwaltung:
  - Firmeninformationsformular in modalen Dialog verschoben (ähnlich wie Waren/Filamente)
  - "Firmendaten" Button zum Öffnen/Bearbeiten von Firmeninformationen
  - Dialog kann über X-Button, Backdrop-Klick oder Escape-Taste geschlossen werden
  - Bessere UX mit animierten Modal-Übergängen
  - Alle Firmeninfo-Felder in organisiertem Dialog-Interface zugänglich

### v1.3.11 (2025) - 🎨 Widget Dashboard Verbesserungen

- 📊 **Widget Dashboard Verbesserungen** - Verbesserte Widget Dashboard Funktionalität:
  - Behobene Widget-Container-Padding und -Abstände für besseres Edge-to-Edge-Layout
  - Verbessertes Scroll-Verhalten - Widgets scrollen jetzt ordnungsgemäß, wenn der Inhalt die Ansicht überschreitet
  - Behobenes Widget-Schrumpfproblem bei Fenstergrößenänderung - Widgets behalten die Größe über alle Breakpoints hinweg
  - Konsistentes 12-Spalten-Layout für alle Bildschirmgrößen
  - Bessere Widget-Positionierung und -Abstände
- 🔧 **Layout-Fixes**:
  - Entferntes festes Container-Padding, das verhinderte, dass Widgets die App-Ränder erreichen
  - Behobene ResponsiveGridLayout-Höhenberechnung für ordnungsgemäßes Scrollen
  - Verbesserte Container-Overflow-Behandlung
  - Bessere Widget-Gruppen-Layout-Konsistenz

### v1.2.1 (2025) - 🎨 UI-Konsistenz und Spaltenverwaltung

- 📊 **Filament-Spaltenverwaltung** - Spaltensichtbarkeit und Sortierung zur Filamente-Komponente hinzugefügt:
  - Spaltensichtbarkeits-Toggle-Menü (wie bei Drucker-Komponente)
  - Sortierbare Spalten: Marke, Typ, Gewicht, Preis/kg
  - Spaltensichtbarkeits-Präferenzen in Einstellungen gespeichert
  - Konsistente UI mit Drucker-Komponente (Verwaltungsbutton, Dropdown-Menü, Sortierindikatoren)
- 🎨 **Themenfarben-Konsistenz** - Verbesserte Themenfarben-Nutzung in allen Komponenten:
  - Alle Buttons und Dropdown-Menüs verwenden jetzt konsistent Themenfarben (Filamente, Drucker, Rechner, Preistrends)
  - Entfernte hardcodierte Farben (graue Buttons durch primäre Themenfarbe ersetzt)
  - Header-Komponente passt sich vollständig an alle Themen und Farben an
  - Status-Info-Karte verwendet Themenfarben statt hardcodierter rgba-Werte
  - Konsistente Hover-Effekte mit themeStyles.buttonHover
- 🔧 **UI-Verbesserungen**:
  - "Spalten verwalten"-Button verwendet jetzt primäre Themenfarbe statt sekundärer
  - Preistrends-Select-Dropdown verwendet ordnungsgemäße Focus-Styles
  - Alle Dropdown-Menüs konsistent mit Themenfarben gestylt
  - Bessere visuelle Konsistenz auf allen Seiten

### v1.1.6 (2025) - 🌍 Vollständige Übersetzungsabdeckung

- 🌍 **Tutorial-Übersetzungen** - Fehlende Tutorial-Übersetzungsschlüssel zu allen Sprachdateien hinzugefügt:
  - 8 neue Tutorial-Schritte vollständig übersetzt (Status-Dashboard, PDF-Vorschau, Drag & Drop, Kontextmenü, Preishistorie, Online-Preisvergleich, Export/Import, Backup/Wiederherstellung)
  - Alle Tutorial-Inhalte sind jetzt in allen 14 unterstützten Sprachen verfügbar
  - Vollständige Tutorial-Erfahrung in Tschechisch, Spanisch, Französisch, Italienisch, Polnisch, Portugiesisch, Russisch, Slowakisch, Ukrainisch und Chinesisch
- 🎨 **Themennamen-Übersetzung** - Themennamen sind jetzt vollständig in allen Sprachen übersetzt:
  - 15 Themennamen zu allen Sprachdateien hinzugefügt (Hell, Dunkel, Blau, Grün, Wald, Lila, Orange, Pastell, Anthrazit, Mitternacht, Gradient, Neon, Cyberpunk, Sonnenuntergang, Ozean)
  - Themennamen werden dynamisch aus dem Übersetzungssystem geladen, anstatt hartcodierter Werte
  - Fallback-Mechanismus: Übersetzungsschlüssel → displayName → Themenname
  - Alle Themen werden jetzt in der vom Benutzer ausgewählten Sprache in den Einstellungen angezeigt

### v1.1.5 (2025) - 🎨 UI-Verbesserungen und Log-Verwaltung

- 🎨 **Filament-Hinzufügen-Dialog überarbeitet** - Verbessertes zweispaltiges Layout für bessere Organisation:
  - Linke Spalte: Grunddaten (Marke, Typ, Gewicht, Preis, Bild-Upload)
  - Rechte Spalte: Farbauswahl mit allen Farboptionen
  - Alle Eingabefelder haben konsistente Breite
  - Bessere visuelle Hierarchie und Abstände
  - Bild-Upload in die linke Spalte unter das Preis-Feld verschoben
- 📋 **Log-Dateien-Verwaltung** - Neuer Log-Verwaltungsbereich in den Datenverwaltungs-Einstellungen:
  - Konfigurierbare automatische Löschung alter Log-Dateien (5, 10, 15, 30, 60, 90 Tage oder nie)
  - Schaltfläche zum Öffnen des Log-Ordners im Dateimanager
  - Automatische Bereinigung bei Änderung der Einstellung
  - Plattformspezifisches Öffnen von Ordnern (macOS, Windows, Linux)
- 📦 **Export/Import-Layout** - Export- und Import-Bereiche jetzt nebeneinander:
  - Zweispaltiges responsives Layout
  - Bessere Raumnutzung
  - Verbesserte visuelle Balance
- 🍎 **macOS-Benachrichtigungswarnung** - Ausblendbare Warnung:
  - Erscheint nur auf macOS-Plattform
  - Zwei Ausblendoptionen: temporär (X-Schaltfläche) oder permanent (Schließen-Schaltfläche)
  - Temporäres Ausblenden: nur für die aktuelle Sitzung verborgen, erscheint nach Neustart wieder
  - Permanentes Ausblenden: in Einstellungen gespeichert, erscheint nie wieder
  - Klare visuelle Unterscheidung zwischen Ausblendtypen

### v1.1.4 (2025) - 🐛 Automatische Erstellung der Filament-Bibliothek-Update-Datei

- 🐛 **Automatische Update-Datei-Erstellung** - Behobenes Problem, bei dem `update_filamentLibrary.json` nicht automatisch erstellt wurde:
  - Datei wird jetzt automatisch aus `filamentLibrarySample.json` beim ersten Start erstellt
  - Stellt sicher, dass die Update-Datei immer für die Zusammenführung verfügbar ist
  - Erstellt nur, wenn die Datei nicht existiert (überschreibt vorhandene nicht)
  - Verbesserte Fehlerbehandlung und Protokollierung für Update-Datei-Operationen

### v1.1.3 (2025) - 🪟 Windows-Kompatibilitätsverbesserungen

- 🪟 **Windows-Kompatibilitätsverbesserung** - Filament-Bibliothek-Ladeverbesserungen:
  - Dynamischer Import für große JSON-Dateien (anstatt statischer Import)
  - Caching-Mechanismus zur Vermeidung mehrfacher Ladevorgänge
  - Verbesserte Fehlerbehandlung für Datei-nicht-gefunden-Fälle unter Windows
  - Plattformübergreifende Kompatibilität (Windows, macOS, Linux)
- 🔧 **Fehlerbehandlungsverbesserungen** - Erweiterte Fehlermeldungen:
  - Korrekte Behandlung von Windows-spezifischen Fehlermeldungen
  - Stille Behandlung von Datei-nicht-gefunden-Fällen (nicht als Warnungen)

### v1.1.2 (2025) - 🌍 Sprachauswahl und Verbesserungen

- 🌍 **Sprachauswahl beim ersten Start** - Moderner, animierter Sprachauswahl-Dialog beim ersten Start:
  - Unterstützung für 13 Sprachen mit Flaggen-Icons
  - Theme-bewusstes Design
  - Sanfte Animationen
  - Tutorial läuft in ausgewählter Sprache
- 🔄 **Werkseinstellungen zurücksetzen** - Funktion zum vollständigen Löschen von Daten:
  - Löscht alle gespeicherten Daten (Drucker, Filamente, Angebote, Kunden, Einstellungen)
  - Bestätigungsdialog für gefährliche Operationen
  - Anwendung startet neu wie beim ersten Start
- 🎨 **UI-Verbesserungen**:
  - Footer-Text-Kontrast-Fix (dynamische Farbauswahl)
  - Sofortiges Speichern bei Sprachänderung
  - Verbesserte Tooltip-Positionierung
- 📚 **Tutorial-Übersetzungen** - Vollständige Tutorial-Übersetzung in allen unterstützten Sprachen (Russisch, Ukrainisch, Chinesisch hinzugefügt)

### v1.1.1 (2025) - 🎨 Header-Layout-Verbesserungen

- 📐 **Header-Neuordnung** - Drei-teilige Header-Struktur:
  - Links: Menü + Logo + Titel
  - Mitte: Breadcrumb (dynamisch schrumpft)
  - Rechts: Schnellaktionen + Status-Info-Karte
- 📊 **Status-Info-Karte** - Kompakter, moderner Stil:
  - "Nächster Speichervorgang" (Label und Wert)
  - Datum und Uhrzeit (gestapelt)
  - Immer rechts positioniert
- 📱 **Responsives Design** - Verbesserte Breakpoints:
  - Breadcrumb ausblenden <1000px
  - Datum ausblenden <900px
  - "Nächster Speichervorgang" ausblenden <800px
  - Kompakte Schnellaktionen <700px
- 🔢 **Zahlenformatierungs-Fix** - Rundung der Lade-Fortschrittsprozentsätze

### v1.1.0 (2025) - 🚀 Feature-Update

- 🔍 **Globale Suche erweitert** - Erweiterte Suchfunktionen:
  - Angebote nach Kundennamen, ID, Status und Datum durchsuchen
  - Filamente aus der Datenbank (filamentLibrary) nach Marke, Typ und Farbe durchsuchen
  - Filamente mit einem Klick aus den Suchergebnissen zur gespeicherten Liste hinzufügen
  - Verbesserte Suchergebnisse mit Typindikatoren
- 💀 **Skeleton Loading System** - Spektakuläres Ladeerlebnis:
  - Animierte Skeleton-Komponenten mit Shimmer-Effekten
  - Fortschrittsverfolgung mit visuellen Indikatoren
  - Ladeschritte mit Häkchen für abgeschlossene Schritte
  - Sanfte Fade-in-Übergänge
  - Themenbewusste Skeleton-Farben
  - Seitenspezifische Skeleton-Loader
- 🎨 **UI/UX-Verbesserungen**:
  - Bessere Ladezustände
  - Verbesserte Benutzerrückmeldung beim Laden von Daten
  - Verbessertes visuelles Erlebnis

### v1.0.0 (2025) - 🎉 Erste stabile Version

- 🎨 **Moderne UI-Komponenten** - Komplette UI-Überarbeitung mit modernen Komponenten:
  - Empty State Komponente für bessere Benutzererfahrung
  - Card Komponente mit Hover-Effekten
  - Progress Bar Komponente für PDF-Export/Import-Operationen
  - Tooltip Komponente mit Theme-Integration
  - Breadcrumb-Navigation für klare Seitenhierarchie
- ⚡ **Schnellaktionen** - Header-Schnellaktions-Buttons für schnelleren Workflow:
  - Schnellhinzufügen-Buttons für Filamente, Drucker und Kunden
  - Dynamische Buttons basierend auf aktiver Seite
  - Tastenkürzel-Integration
- 🔍 **Globale Suche (Command Palette)** - Leistungsstarke Suchfunktion:
  - `Ctrl/Cmd+K` zum Öffnen der globalen Suche
  - Seiten und Schnellaktionen durchsuchen
  - Tastatur-Navigation (↑↓, Enter, Esc)
  - Theme-bewusste Gestaltung
- ⏪ **Rückgängig/Wiederholen-Funktion** - Verlauf-Verwaltung für Filamente:
  - `Ctrl/Cmd+Z` für Rückgängig
  - `Ctrl/Cmd+Shift+Z` für Wiederholen
  - Visuelle Rückgängig/Wiederholen-Buttons in der UI
  - 50-Schritte-Verlauf-Unterstützung
- ⭐ **Favoriten-Filamente** - Favoriten-Filamente markieren und filtern:
  - Stern-Symbol zum Umschalten des Favoriten-Status
  - Filter, um nur Favoriten anzuzeigen
  - Persistenter Favoriten-Status
- 📦 **Massenoperationen** - Effiziente Massenverwaltung:
  - Checkbox-Auswahl für mehrere Filamente
  - Alle auswählen / Auswahl aufheben Funktionalität
  - Massenlöschung mit Bestätigungsdialog
  - Visuelle Auswahlindikatoren
- 🎨 **Modal-Dialoge** - Moderne Modal-Erfahrung:
  - Verschwommene Hintergrund-Modals für Hinzufügen/Bearbeiten-Formulare
  - Feste Größe der Eingabefelder
  - Escape-Taste zum Schließen
  - Sanfte Animationen mit framer-motion
- ⌨️ **Tastenkürzel** - Erweiterte Tastenkürzel-Funktion:
  - Anpassbare Tastenkürzel
  - Tastenkürzel-Hilfe-Dialog (`Ctrl/Cmd+?`)
  - Tastenkürzel mit Tastenaufzeichnung bearbeiten
  - Persistente Tastenkürzel-Speicherung
- 📝 **Protokollierungssystem** - Umfassende Protokollierung:
  - Separate Protokolldateien für Frontend und Backend
  - Plattformunabhängige Protokollverzeichnis-Auflösung
  - Automatische Protokollrotation
  - Konsolen-Integration
- 🔔 **Benachrichtigungsverbesserungen** - Besseres Benachrichtigungssystem:
  - Kundenname in Angebotslöschungsbenachrichtigungen
  - Plattformübergreifende Benachrichtigungsunterstützung
  - Verbesserte Fehlerbehandlung
- 🎯 **UI/UX-Verbesserungen**:
  - Feste Größe der Eingabefelder
  - Bessere Formular-Layouts
  - Verbesserte Theme-Integration
  - Verbesserte Barrierefreiheit

### v0.6.0 (2025)

#### 🐛 Fehlerbehebungen
- **Protokollierungsoptimierung**: Reduzierung übermäßiger und doppelter Protokollierung
  - Informationsprotokolle erscheinen nur im Entwicklungsmodus (DEV)
  - Fehler werden weiterhin auch in Production-Builds protokolliert
  - FilamentLibrary-Initialisierung erfolgt still
- **Falsche Warnungen behoben**: Filament-Farbauflösung warnt nur, wenn die Bibliothek bereits geladen ist und die Farbe immer noch nicht gefunden wird
  - Verhindert falsche Warnungen während des asynchronen Bibliotheksladens
  - Warnungen erscheinen nur bei echten Problemen
- **Update Checker-Duplikation behoben**: Entfernung doppelter Update-Check-Aufrufe
- **Tastenkürzel-Protokollierung behoben**: Protokolliert nur, wenn ein Shortcut vorhanden ist, überspringt ungültige Kombinationen

#### ⚡ Leistungsverbesserungen
- Store-Operationen-Protokollierung optimiert (nur DEV-Modus)
- Weniger Konsolenoperationen in Production-Builds
- Sauberere Konsolenausgabe während der Entwicklung

## 📸 Screenshots

Die Anwendung enthält:
- Startseite-Dashboard mit Statistiken
- Filamentverwaltung
- Druckerverwaltung
- Kostenberechnungsrechner
- Angebotsliste und Detailansicht
- Status-Dashboard und Zeitachse
- PDF-Export und integrierte Vorschau

## 🚀 Installation

### Voraussetzungen

- **Rust**: [Rust installieren](https://rustup.rs/)
- **Node.js**: [Node.js installieren](https://nodejs.org/) (Version 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### macOS-spezifisch

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Linux-spezifisch (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Windows-spezifisch

- Visual Studio Build Tools (C++ Build-Tools)
- Windows SDK

## 📦 Build

### Ausführung im Entwicklungsmodus

```bash
cd src-tauri
cargo tauri dev
```

### Production Build (Erstellen einer eigenständigen Anwendung)

```bash
cd src-tauri
cargo tauri build
```

Die eigenständige Anwendung befindet sich unter:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` oder `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Beta-Build

Das Projekt enthält einen `beta`-Branch, der für separate Builds konfiguriert ist:

```bash
# Zum Beta-Branch wechseln
git checkout beta

# Lokaler Beta-Build
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Der Beta-Build setzt automatisch die Variable `VITE_IS_BETA=true`, sodass "BETA" im Menü erscheint.

**GitHub Actions**: Beim Pushen zum `beta`-Branch läuft automatisch der Workflow `.github/workflows/build-beta.yml`, der die Beta-Version für alle drei Plattformen erstellt.

Detaillierte Anleitung: [BUILD.md](BUILD.md) und [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Entwicklung

### Projektstruktur

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript Frontend
│   ├── src/
│   │   ├── components/    # React-Komponenten
│   │   ├── utils/        # Hilfsfunktionen
│   │   └── types.ts      # TypeScript-Typen
│   └── package.json
├── src-tauri/         # Rust Backend
│   ├── src/           # Rust-Quellcode
│   ├── Cargo.toml     # Rust-Abhängigkeiten
│   └── tauri.conf.json # Tauri-Konfiguration
└── README.md
```

### Frontend-Entwicklung

```bash
cd frontend
pnpm install
pnpm dev
```

### Abhängigkeiten

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (Datenspeicherung)
- tauri-plugin-log (Protokollierung)

## 📖 Verwendung

1. **Drucker hinzufügen**: Drucker-Menü → Neuen Drucker hinzufügen
2. **Filament hinzufügen**: Filamente-Menü → Neues Filament hinzufügen
3. **Kosten berechnen**: Rechner-Menü → Drucker und Filamente auswählen
4. **Angebot speichern**: Im Rechner auf die Schaltfläche "Als Angebot speichern" klicken
5. **PDF-Export**: Angebote-Menü → Ein Angebot auswählen → PDF-Export
6. **Beta-Versionen prüfen**: Einstellungen-Menü → Option "Beta-Updates prüfen" aktivieren

## 🔄 Versionsverwaltung und Updates

Die Anwendung prüft automatisch GitHub Releases auf neue Versionen:

- **Beim Start**: Prüft automatisch auf Updates
- **Alle 5 Minuten**: Prüft automatisch erneut
- **Benachrichtigung**: Wenn eine neue Version verfügbar ist, erscheint eine Benachrichtigung in der oberen rechten Ecke

### Beta-Versionsprüfung

Um Beta-Versionen zu prüfen:

1. Gehen Sie zum **Einstellungen**-Menü
2. Aktivieren Sie die Option **"Beta-Updates prüfen"**
3. Die Anwendung prüft sofort auf Beta-Versionen
4. Wenn eine neuere Beta-Version verfügbar ist, erscheint eine Benachrichtigung
5. Klicken Sie auf die Schaltfläche "Herunterladen", um zur GitHub Release-Seite zu gelangen

**Beispiel**: Wenn Sie eine RELEASE-Version verwenden (z. B. 0.1.0) und die Beta-Prüfung aktivieren, findet die Anwendung die neueste Beta-Version (z. B. 0.2.0-beta) und benachrichtigt Sie, wenn es eine neuere gibt.

Detaillierte Anleitung: [VERSIONING.md](VERSIONING.md)

## 🛠️ Technologie-Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Datenspeicherung**: Tauri Store Plugin (JSON-Dateien)
- **Styling**: Inline-Stile (commonStyles)
- **i18n**: Eigenes Übersetzungssystem
- **CI/CD**: GitHub Actions (automatische Builds für macOS, Linux, Windows)
- **Versionsverwaltung**: GitHub Releases API-Integration

## 📝 Lizenz

Dieses Projekt steht unter **MIT-Lizenz**, jedoch erfordert **kommerzielle Nutzung eine Genehmigung**.

Vollständiges Urheberrecht der Anwendung: **Lekszikov Miklós (LexyGuru)**

- ✅ **Persönliche und bildungsbezogene Nutzung**: Erlaubt
- ❌ **Kommerzielle Nutzung**: Nur mit ausdrücklicher schriftlicher Genehmigung

Details: [LICENSE](LICENSE) Datei

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Danksagungen

- [Tauri](https://tauri.app/) - Das plattformübergreifende Desktop-App-Framework
- [React](https://react.dev/) - Das Frontend-Framework
- [Vite](https://vitejs.dev/) - Das Build-Tool

## 📚 Zusätzliche Dokumentation

- [BUILD.md](BUILD.md) - Detaillierte Build-Anleitung für alle Plattformen
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Erstellen einer eigenständigen Anwendung
- [VERSIONING.md](VERSIONING.md) - Versionsverwaltung und Updates
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Erstellen des ersten GitHub Releases

## 🌿 Branch-Struktur

- **`main`**: Stabile Release-Versionen (RELEASE Build)
- **`beta`**: Beta-Versionen und Entwicklung (BETA Build)

Beim Pushen zum `beta`-Branch läuft automatisch der GitHub Actions Workflow, der die Beta-Version erstellt.

## 📋 Versionsgeschichte

### v1.1.1 (2025) - 🎨 Header-Layout-Verbesserungen

- 🎨 **Header-Neuentwurf** - Komplette Header-Layout-Überarbeitung:
  - Drei-Sektionen-Struktur (links: Logo/Menü, Mitte: Breadcrumb, rechts: Aktionen/Status)
  - Status-Info-Karte immer ganz rechts positioniert
  - Modernes Karten-Design für Statusinformationen
  - Verbesserte Abstände und Ausrichtung im Header
- 📱 **Responsive Design** - Bessere mobile und kleine Bildschirm-Erfahrung:
  - Dynamische Breakpoints für Element-Sichtbarkeit
  - Breadcrumb-Truncation-Fixes
  - Schnellaktionen passen sich der Bildschirmgröße an
  - Status-Info-Karte responsive Größenanpassung
- 🔧 **Layout-Fixes**:
  - Breadcrumb-Overflow- und Truncation-Probleme behoben
  - Status-Info-Karte Positionierungsverbesserungen
  - Besseres Flexbox-Layout-Management
  - Verbesserte Elementabstände und Lücken

### v1.1.0 (2025) - 🚀 Feature-Update

- 🔍 **Globale Suche erweitert** - Erweiterte Suchfunktionen
- 💀 **Skeleton Loading System** - Spektakuläres Ladeerlebnis
- 🎨 **UI/UX-Verbesserungen** - Bessere Ladezustände und visuelles Erlebnis

### v1.0.0 (2025) - 🎉 Erste stabile Version

- 🎨 **Moderne UI-Komponenten** - Komplette UI-Überarbeitung mit modernen Komponenten
- ⚡ **Schnellaktionen** - Header-Schnellaktionsschaltflächen
- 🔍 **Globale Suche** - Leistungsstarke Suchfunktionen
- ⏪ **Rückgängig/Wiederholen** - Verlaufverwaltung
- ⭐ **Lieblingsfilamente** - Filamente markieren und filtern
- 📦 **Massenoperationen** - Effiziente Massenverwaltung
- 🎨 **Modale Dialoge** - Modernes modales Erlebnis
- ⌨️ **Tastenkürzel** - Erweiterte Shortcut-Funktionen
- 📝 **Protokollierungssystem** - Umfassende Protokollierung
- 🔔 **Benachrichtigungsverbesserungen** - Besseres Benachrichtigungssystem

### v0.6.0 (2025)

- 👥 **Kundendatenbank** - Vollständiges Kundenverwaltungssystem mit:
  - Kunden hinzufügen, bearbeiten, löschen
  - Kontaktinformationen (E-Mail, Telefon)
  - Firmendaten (optional)
  - Adresse und Notizen
  - Kundenstatistiken (Gesamtangebote, letztes Angebotsdatum)
  - Suchfunktion
  - Integration mit Rechner für schnelle Kundenauswahl
- 📊 **Preisverlauf und Trends** - Verfolgung von Filamentpreisänderungen:
  - Automatische Preisverlaufsverfolgung bei Filamentpreisaktualisierungen
  - Preis-Trend-Visualisierung mit SVG-Diagrammen
  - Preisstatistiken (aktueller, durchschnittlicher, min, max Preis)
  - Trendanalyse (steigend, fallend, stabil)
  - Preisverlaufstabelle mit detaillierten Änderungsinformationen
  - Warnungen bei erheblichen Preisänderungen (10%+ Änderungen)
  - Preisverlaufsanzeige in der Filamente-Komponente während der Bearbeitung
- 🔧 **Verbesserungen**:
  - Erweiterter Rechner mit Kundenauswahl-Dropdown
  - Preisverlaufsintegration im Filament-Bearbeitungsformular
  - Verbesserte Datenspeicherung für Kunden und Preisverlauf

### v0.5.58 (2025)
- 🌍 **Ukrainische und Russische Sprachunterstützung** – Vollständige Übersetzungsunterstützung für Ukrainisch (uk) und Russisch (ru) hinzugefügt:
  - Vollständige Übersetzungsdateien mit allen 813 Übersetzungsschlüsseln für beide Sprachen
  - Ukrainische Locale-Unterstützung (uk-UA) für Datums-/Zeitformatierung
  - Russische Locale-Unterstützung (ru-RU) für Datums-/Zeitformatierung
  - Alle README-Dateien mit neuen Sprachen im Sprachmenü aktualisiert
  - Sprachanzahl von 12 auf 14 Sprachen aktualisiert
  - README.uk.md und README.ru.md Dokumentationsdateien erstellt

### v0.5.57 (2025)
- 🍎 **Platform-Specific Features** – Native platform integration for macOS, Windows, and Linux:
  - **macOS**: Dock badge support (numeric/textual badge on app icon), native Notification Center integration with permission management
  - **Windows**: Native Windows notifications
  - **Linux**: System tray integration, desktop notifications support
  - **All Platforms**: Native notification API integration with permission request system, platform detection and automatic feature enabling
- 🔔 **Notification System** – Native notification support with permission management:
  - Permission request system for macOS notifications
  - Notification test buttons in Settings
  - Automatic permission checking and status display
  - Platform-specific notification handling (macOS Notification Center, Windows Action Center, Linux desktop notifications)

### v0.5.56 (2025)
- 🌍 **Vollständige Sprachübersetzungen** – Vollständige Übersetzungen für 6 verbleibende Sprachdateien abgeschlossen: Tschechisch (cs), Spanisch (es), Italienisch (it), Polnisch (pl), Portugiesisch (pt) und Slowakisch (sk). Jede Datei enthält alle 813 Übersetzungsschlüssel, sodass die Anwendung nun vollständig in diesen Sprachen unterstützt wird.
- 🔒 **Tauri-Berechtigungen-Fix** – Die Datei `update_filamentLibrary.json` ist nun explizit für Lese-, Schreib- und Erstellungsvorgänge in der Tauri-Capabilities-Datei aktiviert, sodass Filament-Bibliotheksupdates zuverlässig funktionieren.

### v0.5.55 (2025)
- 🧵 **Angebotsbearbeitungsverbesserung** – Gespeicherte Angebote ermöglichen nun die direkte Druckerauswahl oder -änderung, wobei die Kosten automatisch zusammen mit Filamentänderungen neu berechnet werden.
- 🧮 **Genauigkeit und Protokollierung** – Detaillierte Protokollierung hilft, die Schritte der Kostenberechnung (Filament, Strom, Trocknung, Nutzung) zu verfolgen, was es einfacher macht, Fehler in importierten G-Code-Dateien zu finden.
- 🌍 **Übersetzungsergänzungen** – Neue i18n-Schlüssel und Beschriftungen für den Druckerauswähler hinzugefügt, sodass die Editor-UI in allen unterstützten Sprachen konsistent ist.
- 📄 **Dokumentationsupdate** – README mit Beschreibung neuer Funktionen erweitert, v0.5.55 Release zur Versionsgeschichte hinzugefügt.

### v0.5.11 (2025)
- 🗂️ **Sprachmodularisierung** – Erweiterung der App mit Übersetzungsdateien, die in einem neuen `languages/` Verzeichnis organisiert sind, was das Hinzufügen neuer Sprachen und die Verwaltung bestehender Texte erleichtert.
- 🌍 **Vereinheitlichte UI-Übersetzungen** – Die Slicer-Import-Oberfläche arbeitet jetzt vom zentralen Übersetzungssystem, alle Buttons, Fehlermeldungen und Zusammenfassungen sind lokalisiert.
- 🔁 **Sprachauswahl-Update** – In den Einstellungen lädt die Sprachauswahl basierend auf gefundenen Sprachdateien, sodass es in Zukunft ausreicht, eine neue Sprachdatei hinzuzufügen.
- 🌐 **Neue Sprachgrundlagen** – Übersetzungsdateien für Französisch, Italienisch, Spanisch, Polnisch, Tschechisch, Slowakisch, Brasilianisches Portugiesisch und Vereinfachtes Chinesisch vorbereitet (mit englischem Fallback), tatsächliche Übersetzungen können einfach ausgefüllt werden.

### v0.5.0 (2025)
- 🔎 **Filament-Preisvergleichs-Button** – Jedes benutzerdefinierte Filament hat jetzt ein Lupen-Symbol, das die Google/Bing-Suche basierend auf Marke/Typ/Farbe öffnet und schnelle Links zu aktuellen Preisen bietet.
- 💶 **Dezimalpreis-Unterstützung** – Filament-Preisfelder akzeptieren jetzt Dezimalzahlen (14,11 € etc.), die Eingabe wird automatisch validiert und formatiert beim Speichern.
- 🌐 **Umgekehrte Suche Fallback** – Wenn die Tauri-Shell den Browser nicht öffnen kann, öffnet die Anwendung automatisch einen neuen Tab, sodass die Suche auf allen Plattformen funktioniert.

### v0.4.99 (2025)
- 🧾 **Integrierter G-Code-Import im Rechner** – Neues modales `SlicerImportModal` oben im Rechner, das G-Code/JSON-Exporte mit einem Klick lädt, Druckzeit und Filamentmenge überträgt und einen Angebotsentwurf erstellt.
- 📊 **Slicer-Daten aus Header** – G-Code-Header `total filament weight/length/volume` Werte übernehmen automatisch die Zusammenfassungen und behandeln Farbwechselverluste genau.

### v0.4.98 (2025)
- 🧵 **Multicolor-Filament-Unterstützung** – Filamentbibliothek und Verwaltungs-UI markieren jetzt mehrfarbige (Regenbogen/Dual/Tricolor) Filamente separat mit Notizen und Regenbogen-Vorschau.
- 🌐 **Automatische Übersetzung beim CSV-Import** – Von externer Datenbank importierte Farbnamen erhalten ungarische und deutsche Labels, sodass die Farbauswahl mehrsprachig bleibt ohne manuelle Bearbeitung.
- 🔄 **Update-Bibliothek-Zusammenführung** – Der Inhalt der `update_filamentLibrary.json` Datei wird beim Start automatisch dedupliziert und mit der bestehenden Bibliothek zusammengeführt, ohne Benutzeränderungen zu überschreiben.
- 📁 **CSV-Konverter-Update** – Das `convert-filament-csv.mjs` Skript überschreibt nicht mehr die persistente `filamentLibrary.json`, sondern erstellt eine Update-Datei und generiert mehrsprachige Labels.
- ✨ **Animationserlebnis-Tuning** – Neue Seitenübergangsoptionen (Flip, Parallax), Mikrointeraktions-Stilauswahl, pulsierendes Feedback, Filamentbibliothek-Skeleton-Liste und fein abgestimmte Karten-Hover-Effekte.
- 🎨 **Theme-Werkstatt-Erweiterungen** – Vier neue integrierte Themes (Forest, Pastel, Charcoal, Midnight), sofortige Duplizierung des aktiven Themes für benutzerdefinierte Bearbeitung, verbesserte Gradient/Kontrast-Behandlung und vereinfachter Freigabeprozess.

### v0.4.0 (2025)
- 🧵 **Filament-Datenbank-Integration** – 2.000+ Werkfarben aus integrierter JSON-Bibliothek (filamentcolors.xyz Snapshot), nach Marke und Material organisiert
- 🪟 **Feste Größe Auswahlpanels** – Button-geöffnete, durchsuchbare, scrollbare Marken- und Typenlisten, die sich gegenseitig ausschließen, machen das Formular transparenter
- 🎯 **Farbauswahl-Verbesserungen** – Wenn Bibliothekselemente erkannt werden, werden Finish und Hex-Code automatisch gesetzt, separate Felder verfügbar beim Wechsel zum benutzerdefinierten Modus
- 💾 **Filament-Bibliothek-Editor** – Neue Einstellungsregisterkarte mit Popup-Formular, Duplikatbehandlung und Tauri-FS-basierter persistenter `filamentLibrary.json` Speicherung
- 📄 **Dokumentationsupdate** – Neuer Bullet in der Hauptfunktionsliste für die Filament-Farbbibliothek, README/FEATURE_SUGGESTIONS Bereinigung

### v0.3.9 (2025)
- 🔍 **Angebotsfilter-Presets** – Speicherbare, benennbare Filtereinstellungen, Standard-Schnellpresets (Heute, Gestern, Wöchentlich, Monatlich etc.) und Ein-Klick-Anwenden/Löschen
- 📝 **Statusänderungsnotizen** – Neues Modal für Angebotsstatusänderung mit optionaler Notiz, die in der Statusgeschichte gespeichert wird
- 🖼️ **PDF-Export-Erweiterung** – Mit Filamenten gespeicherte Bilder erscheinen in der PDF-Tabelle mit druckoptimiertem Styling
- 🧾 **Firmenbranding-Datenblatt** – Firmenname, Adresse, Steuernummer, Bankkonto, Kontakt und Logo-Upload; automatisch im PDF-Header enthalten
- 🎨 **PDF-Vorlagenauswahl** – Drei Stile (Modern, Minimalistisch, Professionell) zur Auswahl für das Angebotsaussehen
- 👁️ **Integrierte PDF-Vorschau** – Separater Button bei Angebotsdetails für sofortige visuelle Überprüfung vor dem Export
- 📊 **Status-Dashboard** – Statuskarten mit Zusammenfassung, schnelle Statusfilter und Timeline der letzten Statusänderungen bei Angeboten
- 📈 **Statistische Diagramme** – Umsatz/Kosten/Gewinn-Trenddiagramm, Filament-Verteilung-Kreisdiagramm, Umsatz pro Drucker-Balkendiagramm, alle im SVG/PNG-Format exportierbar und können auch als PDF gespeichert werden

### v0.3.8 (2025)
- 🐛 **Berichtsnummernformatierungs-Fix** - Formatierung auf 2 Dezimalstellen in Berichten:
  - Hauptstatistikkarten (Umsatz, Ausgaben, Gewinn, Angebote): `formatNumber(formatCurrency(...), 2)`
  - Werte über Diagrammen: `formatNumber(formatCurrency(...), 2)`
  - Detaillierte Statistiken (Durchschnittsgewinn/Angebot): `formatNumber(formatCurrency(...), 2)`
  - Jetzt konsistent mit der Startseite (z.B. `6.45` statt `6.45037688333333`)
- 🎨 **Einstellungen-Tab-Navigation-Fix** - Hintergrund- und Textfarbverbesserungen:
  - Tab-Navigationsbereich Hintergrund: `rgba(255, 255, 255, 0.85)` für Gradient-Themes + `blur(10px)`
  - Tab-Button-Hintergründe: Aktiv `rgba(255, 255, 255, 0.9)`, inaktiv `rgba(255, 255, 255, 0.7)` für Gradient-Themes
  - Tab-Button-Textfarbe: `#1a202c` (dunkel) für Gradient-Themes für Lesbarkeit
  - Hover-Effekte: `rgba(255, 255, 255, 0.85)` für Gradient-Themes
  - Backdrop-Filter: `blur(8px)` für Tab-Buttons, `blur(10px)` für Navigationsbereich

### v0.3.7 (2025)
- 🎨 **Design-Modernisierung** - Vollständige visuelle Transformation mit Animationen und neuen Themes:
  - Neue Themes: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 neue moderne Themes)
  - Framer Motion Animationen integriert (fadeIn, slideIn, stagger, Hover-Effekte)
  - Glassmorphismus-Effekt für Gradient-Themes (Blur + transparenter Hintergrund)
  - Neon-Glow-Effekt für Neon/Cyberpunk-Themes
  - Modernisierte Karten und Oberflächen (größeres Padding, abgerundete Ecken, bessere Schatten)
- 🎨 **Farbverbesserungen** - Besserer Kontrast und Lesbarkeit für alle Themes:
  - Dunkler Text (#1a202c) auf weißem/hellem Hintergrund für Gradient-Themes
  - Eingabefelder, Labels, h3-Färbung in allen Komponenten verbessert
  - Konsistente Farbbehandlung auf allen Seiten (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Textschatten für Gradient-Themes hinzugefügt für bessere Lesbarkeit
- 📊 **Tabellenstil-Verbesserungen** - Verschwommenerer Hintergrund und besserer Textkontrast:
  - Hintergrundfarbe: rgba(255, 255, 255, 0.85) für Gradient-Themes (vorher 0.95)
  - Backdrop-Filter: blur(8px) für verschwommeneren Effekt
  - Textfarbe: #333 (dunkelgrau) für Gradient-Themes für bessere Lesbarkeit
  - Zellenhintergründe: rgba(255, 255, 255, 0.7) für verschwommeneren Effekt
- 🎨 **Kartenhintergrundfarb-Verbesserungen** - Verschwommenerer Hintergrund, bessere Lesbarkeit:
  - Hintergrundfarbe: rgba(255, 255, 255, 0.75) für Gradient-Themes (vorher 0.95)
  - Backdrop-Filter: blur(12px) für stärkere Unschärfe
  - Opazität: 0.85 für matten Effekt
  - Textfarbe: #1a202c (dunkel) für Gradient-Themes
- 📈 **Startseite-Modernisierung** - Wöchentliche/monatliche/jährliche Statistiken und Zeitraumvergleich:
  - Zeitraumvergleichskarten (Wöchentlich, Monatlich, Jährlich) mit farbigen Akzentleisten
  - StatCard-Komponenten modernisiert (Icons mit farbigen Hintergründen, Akzentleisten)
  - Zusammenfassungsbereich in Karten mit Icons angeordnet
  - Zeitraumvergleichsbereich hinzugefügt
- 🐛 **Datumfilter-Fix** - Genauere Zeitraumfilterung:
  - Zeitrücksetzung (00:00:00) für genauen Vergleich
  - Obergrenze gesetzt (heute ist enthalten)
  - Wöchentlich: letzte 7 Tage (heute enthalten)
  - Monatlich: letzte 30 Tage (heute enthalten)
  - Jährlich: letzte 365 Tage (heute enthalten)
- 🎨 **Sidebar-Modernisierung** - Icons, Glassmorphismus, Neon-Glow-Effekte
- 🎨 **ConfirmDialog-Modernisierung** - Theme-Prop hinzugefügt, harmonisierte Farbgebung

### v0.3.6 (2025)
- 🎨 **Einstellungen-UI-Umorganisation** - Tab-System (Allgemein, Aussehen, Erweitert, Datenverwaltung) für bessere UX und sauberere Navigation
- 🌐 **Übersetzungsverbesserungen** - Alle hardcodierten ungarischen Texte in allen Komponenten übersetzt (HU/EN/DE):
  - Calculator: "3D-Druckkostenberechnung"
  - Filaments: "Filamente verwalten und bearbeiten"
  - Printers: "Drucker und AMS-Systeme verwalten"
  - Offers: "Gespeicherte Angebote verwalten und exportieren"
  - Home: Statistiktitel, Zusammenfassung, CSV-Export-Labels (Std/hrs, Stk/pcs)
  - VersionHistory: "Keine Versionsgeschichte verfügbar"
- 💾 **Versionsgeschichte-Cache-System** - Physische Speicherung in localStorage, GitHub-Prüfung alle 1 Stunde:
  - Checksummen-basierte Änderungserkennung (lädt nur bei neuen Releases)
  - Separater Cache pro Sprache (Ungarisch/Englisch/Deutsch)
  - Schneller Sprachwechsel aus Cache (keine Neuübersetzung)
  - Automatische Cache-Invalidierung bei neuem Release
- 🌐 **Intelligente Übersetzung** - Übersetzt nur neue Releases, verwendet alte Übersetzungen aus Cache:
  - Cache-Validierung (nicht cachieren, wenn gleicher Text)
  - MyMemory API Fallback, wenn Übersetzung fehlschlägt
  - Fehlerzähler Auto-Reset (setzt nach 5 Minuten zurück)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate entfernt** - Nur MyMemory API-Verwendung (400 Fehler eliminiert, GET-Request, kein CORS)
- 🔄 **Retry-Button-Refaktorierung** - Einfacherer Trigger-Mechanismus mit useEffect
- 🐛 **Build-Fehler-Fixes** - JSX-Einrückungsprobleme behoben (Settings.tsx Export/Import-Bereich)

### v0.3.5 (2025)
- ✅ **MyMemory API-Integration** - Kostenlose Übersetzungs-API statt LibreTranslate
- ✅ **GitHub Releases-Seite öffnen** - Button zum Öffnen der GitHub Releases-Seite bei Rate-Limit
- ✅ **Rate-Limit-Fehlerbehandlung-Verbesserung** - Klare Fehlermeldungen und Wiederholungsbutton
- 🐛 **Build-Fehler-Fixes** - Nicht verwendete Imports entfernt (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Eingabevalidierung-Verbesserung** - Zentrale Validierungs-Utility erstellt und in Calculator, Filaments, Printers Komponenten integriert
- ✅ **Validierungsfehlermeldungen** - Mehrsprachige (HU/EN/DE) Fehlermeldungen mit Toast-Benachrichtigungen
- ✅ **Performance-Optimierung** - Lazy Loading Komponenten (Code-Splitting), useMemo und useCallback-Optimierung
- ✅ **Plattformspezifische Initialisierung** - macOS, Windows, Linux plattformspezifische Initialisierungsgrundlagen
- 🐛 **Build-Fehler-Fix** - Printers.tsx Kontextmenü-Funktionen hinzugefügt

### v0.3.3 (2025)
- 🖱️ **Drag & Drop-Funktionen** - Angebote, Filamente und Drucker durch Ziehen neu ordnen
- 📱 **Kontextmenüs** - Rechtsklick-Menüs für schnelle Aktionen (bearbeiten, löschen, duplizieren, PDF-Export)
- 🎨 **Visuelles Feedback** - Opazität und Cursor-Änderung während Drag & Drop
- 🔔 **Toast-Benachrichtigungen** - Benachrichtigungen nach Neuordnung
- 🐛 **Build-Fehler-Fix** - Calculator.tsx theme.colors.error -> theme.colors.danger Fix

### v0.3.2 (2025)
- 📋 **Vorlagen-Funktionen** - Berechnungen als Vorlagen im Calculator-Komponenten speichern und laden
- 📜 **Historie/Versionierung für Angebote** - Angebotsversionierung, Historie anzeigen, Änderungen verfolgen
- 🧹 **Duplikats-Fix** - Doppelte CSV/JSON-Export/Import-Funktionen aus Filaments und Printers Komponenten entfernt (blieb in Settings)

### v0.3.1 (2025)
- ✅ **Eingabevalidierung-Verbesserung** - Negative Zahlen deaktiviert, Maximalwerte gesetzt (Filamentgewicht, Druckzeit, Leistung, etc.)
- 📊 **CSV/JSON-Export/Import** - Massenexport/Import von Filamenten und Druckern im CSV- und JSON-Format
- 📥 **Import/Export-Buttons** - Einfacher Zugang zu Export/Import-Funktionen auf Filaments- und Printers-Seiten
- 🎨 **Leere Zustände-Verbesserung** - Informative leere Zustände angezeigt, wenn keine Daten vorhanden sind

### v0.3.0 (2025)
- ✏️ **Angebotsbearbeitung** - Gespeicherte Angebote bearbeiten (Kundenname, Kontakt, Beschreibung, Gewinnprozentsatz, Filamente)
- ✏️ **Filamente in Angebot bearbeiten** - Filamente innerhalb des Angebots ändern, hinzufügen, löschen
- ✏️ **Bearbeiten-Button** - Neuer Bearbeiten-Button neben Löschen-Button in Angebotsliste
- 📊 **Statistik-Export-Funktion** - Statistiken im JSON- oder CSV-Format von der Startseite exportieren
- 📈 **Berichtsgenerierung** - Wöchentliche/monatliche/jährliche/alle Berichte im JSON-Format mit Zeitraumfilterung generieren
- 📋 **Versionsgeschichte-Anzeige** - Versionsgeschichte in Einstellungen anzeigen, GitHub Releases API-Integration
- 🌐 **GitHub Releases-Übersetzung** - Automatische Übersetzung Ungarisch -> Englisch/Deutsch (MyMemory API)
- 💾 **Übersetzungs-Cache** - localStorage-Cache für übersetzte Release-Notizen
- 🔄 **Dynamische Versionsgeschichte** - Beta- und Release-Versionen separat angezeigt
- 🐛 **Fehlerbehebungen** - Nicht verwendete Variablen entfernt, Code-Bereinigung, Linter-Fehler behoben

### v0.2.55 (2025)
- 🖥️ **Console/Log-Funktion** - Neuer Console-Menüpunkt zum Debuggen und Anzeigen von Logs
- 🖥️ **Console-Einstellung** - Console-Menüpunkt-Anzeige in Einstellungen aktivierbar
- 📊 **Log-Sammlung** - Automatische Aufzeichnung aller console.log, console.error, console.warn Nachrichten
- 📊 **Globale Fehleraufzeichnung** - Automatische Aufzeichnung von Window-Fehler und nicht behandelten Promise-Rejection-Ereignissen
- 🔍 **Log-Filterung** - Nach Ebene filtern (all, error, warn, info, log, debug)
- 🔍 **Log-Export** - Logs im JSON-Format exportieren
- 🧹 **Log-Löschung** - Logs mit einem Button löschen
- 📜 **Auto-Scroll** - Automatisches Scrollen zu neuen Logs
- 💾 **Vollständige Protokollierung** - Alle kritischen Operationen protokolliert (speichern, exportieren, importieren, löschen, PDF-Export, Update-Download)
- 🔄 **Update-Button-Fix** - Download-Button verwendet jetzt Tauri Shell-Plugin, funktioniert zuverlässig
- 🔄 **Update-Protokollierung** - Vollständige Protokollierung von Update-Prüfung und Download
- ⌨️ **Tastenkürzel** - `Ctrl/Cmd+N` (neu), `Ctrl/Cmd+S` (speichern), `Escape` (abbrechen), `Ctrl/Cmd+?` (Hilfe)
- ⌨️ **Tastenkürzel-macOS-Fix** - Cmd vs Ctrl Behandlung, Capture-Phase Event-Handling
- ⏳ **Ladezustände** - LoadingSpinner-Komponente für Ladezustände
- 💾 **Backup und Wiederherstellung** - Vollständige Datensicherung und -wiederherstellung mit Tauri-Dialog und fs-Plugins
- 🛡️ **Fehlergrenzen** - React ErrorBoundary für anwendungsweite Fehlerbehandlung
- 💾 **Auto-Save** - Gedrosseltes automatisches Speichern mit konfigurierbarem Intervall (Standard 30 Sekunden)
- 🔔 **Benachrichtigungseinstellungen** - Toast-Benachrichtigungen Ein/Aus und Dauer-Einstellung
- ⌨️ **Tastenkürzel-Hilfemenü** - Liste der Tastenkürzel im Modal-Fenster (`Ctrl/Cmd+?`)
- 🎬 **Animationen und Übergänge** - Sanfte Übergänge und Keyframe-Animationen (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Kontextuelle Hilfe für alle wichtigen Elemente beim Hover
- 🐛 **React-Render-Fehler-Fix** - Console-Logger asynchrone Operation, damit es das Rendering nicht blockiert
- 🔧 **num-bigint-dig-Update** - Auf v0.9.1 aktualisiert (Deprecation-Warnung behoben)

### v0.2.0 (2025)
- 🎨 **Theme-System** - 6 moderne Themes (Hell, Dunkel, Blau, Grün, Lila, Orange)
- 🎨 **Theme-Auswahl** - Auswählbares Theme in Einstellungen, wirkt sofort
- 🎨 **Vollständige Theme-Integration** - Alle Komponenten (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) verwenden Themes
- 🎨 **Dynamische Farben** - Alle hardcodierten Farben durch Theme-Farben ersetzt
- 🎨 **Responsives Theme** - Angebote und Sidebar-Footer verwenden auch Themes
- 💱 **Dynamische Währungsumrechnung** - Angebote werden jetzt in der aktuellen Einstellungswährung angezeigt (automatische Umrechnung)
- 💱 **Währungsänderung** - In Einstellungen geänderte Währung wirkt sich sofort auf die Angebotsanzeige aus
- 💱 **PDF-Währungsumrechnung** - PDF-Export wird auch in der aktuellen Einstellungswährung erstellt
- 💱 **Filament-Preisumrechnung** - Filamentpreise werden auch automatisch umgerechnet

### v0.1.85 (2025)
- 🎨 **UI/UX-Verbesserungen**:
  - ✏️ Doppelte Icons entfernt (Bearbeiten, Speichern, Abbrechen Buttons)
  - 📐 Export/Import-Bereiche im 2-Spalten-Layout (nebeneinander)
  - 💾 Native Speicher-Dialog für PDF-Speicherung verwendet (Tauri-Dialog)
  - 📊 Toast-Benachrichtigungen für PDF-Speicherung (Erfolg/Fehler)
  - 🖼️ Anwendungsfenstergröße: 1280x720 (vorher 1000x700)
- 🐛 **Fehlerbehebungen**:
  - Fehlende Informationen in PDF-Generierung hinzugefügt (customerContact, Gewinn in separater Zeile, Umsatz)
  - Übersetzungsschlüssel hinzugefügt (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **PDF-Export-Verbesserungen**:
  - Kundenkontakt (E-Mail/Telefon) im PDF angezeigt
  - Gewinnberechnung in separater Zeile mit Gewinnprozentsatz
  - Umsatz (Gesamtpreis) in separater Zeile, hervorgehoben
  - Vollständige Kostenaufschlüsselung im PDF

### v0.1.56 (2025)
- ✨ **Calculator-Layout-Verbesserungen**: Filament-Karten-Überlauf behoben, responsives Flexbox-Layout
- ✨ **Kostenaufschlüsselung responsiv**: Reagiert jetzt dynamisch auf Fenstergrößenänderungen
- 🐛 **Fehlerbehebung**: Inhalt läuft nicht über das Fenster beim Hinzufügen von Filament
- 🐛 **Fehlerbehebung**: Alle Calculator-Elemente reagieren richtig auf Fenstergrößenänderungen

### v0.1.55 (2025)
- ✨ **Bestätigungsdialoge**: Bestätigung vor dem Löschen angefordert (Filamente, Drucker, Angebote)
- ✨ **Toast-Benachrichtigungen**: Benachrichtigungen nach erfolgreichen Operationen (hinzufügen, aktualisieren, löschen)
- ✨ **Eingabevalidierung**: Negative Zahlen deaktiviert, Maximalwerte gesetzt
- ✨ **Ladezustände**: Lade-Spinner beim Anwendungsstart
- ✨ **Fehlergrenze**: Anwendungsweite Fehlerbehandlung
- ✨ **Suche und Filter**: Filamente, Drucker und Angebote durchsuchen
- ✨ **Duplizierung**: Einfache Angebotsduplizierung
- ✨ **Zusammenklappbare Formulare**: Filament- und Drucker-Hinzufügungsformulare sind zusammenklappbar
- ✨ **Angebots-Erweiterungen**: Kundenname, Kontakt- und Beschreibungsfelder hinzugefügt
- 🐛 **Console.log-Bereinigung**: Keine console.logs im Production-Build
- 🐛 **Beschreibungsfeld-Fix**: Lange Texte werden richtig umbrochen.

---

**Version**: 1.6.0

Wenn Sie Fragen haben oder einen Fehler finden, öffnen Sie bitte ein Issue im GitHub-Repository!

