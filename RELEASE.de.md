# 📋 Versionshistorie - 3DPrinterCalcApp

Dieses Dokument enthält detaillierte Änderungsprotokolle für alle Versionen der 3D Printer Calculator App.

---

## v2.0.0 (2025) - 🚀 Performance-Überwachung & Audit-Log-System

### ⚡ Performance-Metriken-Protokollierung
- **Performance-Timer-Klasse** - Manuelle Zeitmessung für Operationen
- **Ladezeit-Messung** - Alle Modul-Ladezeiten werden aufgezeichnet (Settings, Printers, Filaments, Offers, Customers)
- **Betriebszeit-Messung** - Automatische Zeitmessung für asynchrone und synchrone Operationen
- **Speicherverbrauchs-Überwachung** - JavaScript-Heap-Speicher-Verfolgung und Protokollierung
- **CPU-Verbrauchs-Überwachung** - Regelmäßige CPU-Verbrauchs-Messung alle 5 Minuten
- **Performance-Zusammenfassung** - Aggregierte Statistiken für Lade- und Betriebszeiten
- **Strukturierte Log-Nachrichten** - Detaillierte Anzeige von CPU-Prozentsatz und Speicherwerten
- **Backend-Performance-Befehle** - `get_performance_metrics` Backend-Befehl für CPU- und Speicherdaten

### 🔐 Audit-Log-Implementierung
- **Audit-Log-Infrastruktur** - Separate Audit-Log-Datei (`audit-YYYY-MM-DD.json`)
- **Protokollierung kritischer Operationen**:
  - CRUD-Operationen (Erstellen/Aktualisieren/Löschen für Filaments, Printers, Offers, Customers)
  - Einstellungsänderungen (Theme, Sprache, Log-Einstellungen, Autosave, etc.)
  - Backup-Operationen (erstellen, wiederherstellen)
  - Factory-Reset-Operationen
  - Fehleraufzeichnung
- **Audit-Log-Viewer** - Virtuelles Scrollen für große Dateien mit Filter-, Such- und Export-Funktionen
- **Automatische Bereinigung** - Alte Audit-Log-Dateien werden automatisch basierend auf konfigurierbaren Aufbewahrungstagen gelöscht
- **Backend-Befehle** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Vollständige Lokalisierung** - Alle 13 unterstützten Sprachen

### 🎯 UI/UX-Verbesserungen
- **Audit-Log-Historie** - Zweispalten-Layout im Bereich Einstellungen → Log-Verwaltung
- **Performance-Metriken-Anzeige** - Im Systemdiagnose-Modal
- **Log-Viewer-Echtzeit-Updates** - Auto-Refresh-Toggle, Hash-basierte Änderungserkennung
- **Auto-Scroll-Verfeinerung** - Bewusstsein für Benutzer-Scroll-Position

### 🔧 Technische Verbesserungen
- **GitHub-Update-Check-Optimierung** - Beim Start und alle 5 Stunden (localStorage-basiert)
- **Beta-Tag-Format** - Separates `beta-v2.0.0` Tag für Beta-Releases (überschreibt nicht den Haupt-Release)
- **Versionsprüfer-Logik** - Beta-Versionssuche basierend auf `beta-v` Präfix

---

## v1.9.0 (2025) - 🔍 Systemdiagnose & Performance-Verbesserungen

### 🔍 Systemdiagnose
- **Umfassendes System-Gesundheitsprüf-Tool**:
  - Systeminformationen-Anzeige (CPU, Speicher, OS, GPU, Festplatte)
  - Dateisystem-Validierung (data.json, filamentLibrary.json, update_filament.json)
  - Modul-Verfügbarkeits-Prüfungen (Settings, Offers, Printers, Customers, Calculator, Home)
  - Datenspeicher-Verfügbarkeits-Prüfungen
  - Fortschrittsbalken mit detaillierten Statusmeldungen
  - Zusammenfassung mit Fehlern/Warnungen/erfolgreichen Zuständen
  - Wiederholungs-Button
- **Verschoben in den Bereich Log-Verwaltung** (logischere Platzierung)
- **Vollständige Lokalisierung** in allen 13 unterstützten Sprachen

### ⚡ Log-Viewer-Performance
- **Virtuelles Scrollen für große Log-Dateien**:
  - Benutzerdefinierte virtuelle Scroll-Implementierung für LogViewer-Komponente
  - Nur sichtbare Log-Einträge werden gerendert, was die Performance erheblich verbessert
  - Sanftes Scrollen und Suchen auch bei riesigen Log-Dateien (100k+ Zeilen)
  - Behält genaue Scrollbar-Position und -Höhe bei
  - Deutlich schnellere Such- und Filter-Operationen

### 🔔 Einheitliches Benachrichtigungssystem
- **Zentrale Benachrichtigungs-Service**:
  - Einzelner `notificationService` für sowohl Toast- als auch Plattform-Benachrichtigungen
  - Prioritäts-basierte Benachrichtigungs-Routing (hohe Priorität → Plattform-Benachrichtigung)
  - Automatische Entscheidungsfindung basierend auf App-Status (Vordergrund/Hintergrund)
  - Rückwärtskompatibel mit bestehenden Benachrichtigungs-Funktionen
  - Konfigurierbare Benachrichtigungseinstellungen (Toast ein/aus, Plattform-Benachrichtigung ein/aus, Prioritätsstufen)

### 🎯 UI/UX-Verbesserungen
- Systemdiagnose von Backup-Bereich in Log-Verwaltungs-Bereich verschoben (logischere Platzierung)
- TypeScript-Linter-Fehler behoben (ungenutzte Variablen, Typabweichungen)
- Verbesserte Code-Qualität und Wartbarkeit

---

## v1.8.0 (2025) - 📊 Erweiterte Protokollierungs-System & Factory-Reset-Verbesserungen

### 🔄 Factory-Reset-Fortschritts-Modal
- **Visueller Fortschritts-Indikator für Factory-Reset**:
  - 4-stufiger animierter Fortschritt (Backup-Löschung, Log-Löschung, Config-Löschung, Abschluss)
  - Echtzeit-Status-Updates mit Erfolgs-/Fehlermeldungen
  - 10-Sekunden-Countdown vor Sprachauswahl-Anzeige
  - Modal kann während Reset-Prozess nicht geschlossen werden
  - Vollständige Lokalisierung in allen 13 unterstützten Sprachen

### 📋 Vollständige Protokollierungs-System-Überarbeitung
- **Professionelle Protokollierungs-Infrastruktur**:
  - Plattformübergreifende Log-Datei-Pfade (plattformspezifische Datenverzeichnisse)
  - Systeminformationen-Protokollierung (CPU, Speicher, OS, GPU, Festplatte, App-Version)
  - Verzeichnis-Informationen-Protokollierung (Log- und Backup-Ordner, Dateianzahl, Größen)
  - Detaillierte Lade-Status-Protokollierung (Erfolg/Warnung/Fehler/kritisch)
  - Log-Level (DEBUG, INFO, WARN, ERROR) mit Filterung
  - Strukturiertes Log-Format-Unterstützung (Text und JSON)
  - Log-Rotation mit automatischer Bereinigung (konfigurierbare Aufbewahrungstage)
  - Log-Viewer-Modal mit Filterung, Suche, Hervorhebung und Export
  - Log-Konfiguration in Einstellungen (Format, Level, Aufbewahrungstage)
  - Log-Datei-Inhalt bleibt bei App-Neustart erhalten (Anhänge-Modus)

### 🔍 Systemdiagnose
- **System-Gesundheitsprüf-Modal**:
  - Systeminformationen-Anzeige und -Validierung
  - Speicherverbrauchs-Überwachung mit Warnungen
  - Datei-Existenz-Prüfungen
  - Modul-Verfügbarkeits-Prüfungen
  - Datenspeicher-Verfügbarkeits-Tests
  - Fortschrittsbalken und Zusammenfassungs-Anzeige
  - Vollständige Lokalisierung in allen 13 unterstützten Sprachen

### 🛠️ Technische Verbesserungen
- Protokollierung während Factory-Reset deaktiviert, um Log-Verschmutzung zu vermeiden
- data.json-Erstellung verzögert bis zur Sprachauswahl (saubererer Factory-Reset-Prozess)
- Log-Datei-Initialisierung verzögert bis zur Sprachauswahl
- Automatischer App-Neustart nach Sprachauswahl
- Backend-Befehle für Backup- und Log-Datei-Verwaltung
- Plattformübergreifende Pfad-Verarbeitung für Backups und Logs
- Behobene Speicherberechnung (sysinfo 0.31-Kompatibilität)
- React-Stil-Warnungen behoben (CSS-Kurzform-Konflikte)

---

## v1.7.0 (2025) - 💾 Backup-System, Ladebildschirm und Filament-Bibliothek-Verbesserungen

### 💾 Vollständige Backup-System-Implementierung
- **Automatisches Backup-System** - Eine Backup-Datei pro Tag (nur bei neuem Tag erstellt)
- **Backup-Erinnerungs-Hook und UI-Komponente** - Benachrichtigung, wenn kein Backup existiert
- **Backup-Historie-UI in Einstellungen** - Farbcodierte Liste (grün/gelb/rot/grau) für Backup-Datei-Alter und Lösch-Countdown
- **Autosave-Modal-Fenster** - Erklärung, wenn Autosave aktiviert ist
- **Autosave- und automatisches Backup-Synchronisation** - Automatisches Backup beim Autosave-Speichern
- **Factory-Reset mit automatischer Backup-Datei-Löschung**
- **Backup-Historie aktualisiert sich automatisch**, wenn Autosave aktiviert wird

### 🔧 Backup-System-Backend-Optimierung
- **Backend-Befehle hinzugefügt** zum Löschen alter Backups (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Frontend-Bereinigungs-Funktionen aktualisiert, um Backend-Befehle zu verwenden**, wodurch "forbidden path"-Fehler eliminiert werden
- **Alle Datei-Operationen (Erstellen, Löschen, Auflisten) erfolgen nun vom Backend**, um Tauri-Berechtigungsprobleme zu vermeiden

### ⚡ Backup-System-Performance-Optimierung
- `hasTodayBackup()` optimiert: verwendet `list_backup_files` Backend-Befehl, keine Notwendigkeit, alle Dateien zu lesen
- **Sperr-Mechanismus hinzugefügt**, um parallele Backups zu verhindern
- **Schnellere Operation** auch bei großer Anzahl von Backup-Dateien

### 📁 Backup-Verzeichnis-Öffnen und Log-Historie
- **Button hinzugefügt** im Bereich Einstellungen → Backup-Historie zum Öffnen des Backup-Ordners
- **Neuer Log-Historie-Bereich** in Einstellungen - Log-Dateien auflisten und öffnen
- **Automatische Log-Datei-Löschung** konfigurierbar nach Tagen
- **Plattformübergreifende Unterstützung** (macOS, Windows, Linux)

### 🎨 Vollständige Ladebildschirm-Überarbeitung
- **App-Logo integriert** als Hintergrund mit Glassmorphismus-Effekt
- **Festes Layout für Häkchen** - Automatisches Scrollen, nur 3 Module gleichzeitig sichtbar
- **Shimmer-Effekt, pulsierende Punkte-Animationen**
- **Scroll-Container** mit versteckter Scrollbar

### ⚙️ Lade-Prozess-Verbesserungen
- **Verlangsamtes Laden** (800ms Verzögerungen) - Lademeldungen sind lesbar
- **Fehlerbehandlung für alle Module** (try-catch-Blöcke)
- **Physische Log-Datei** für alle Status und Fehler
- **Lade-Zusammenfassung** am Ende

### 🎨 Filament-Bibliothek-Mehrsprachige-Unterstützung
- **Filament-Farben werden angezeigt** in allen unterstützten Sprachen (nicht nur Ungarisch/Deutsch/Englisch)
- **Fallback-Logik**: Englisch → Ungarisch → Deutsch → rohe Farbe/Name
- Settings, GlobalSearch und Filaments-Komponenten aktualisiert

### 🔄 Factory-Reset-Verbesserungen
- **Physische Datei-Löschung** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Store-Instanz-Reset** ohne Neuladen
- **Sprachauswahl-Anzeige** nach Factory-Reset

### 🎓 Tutorial-Update mit v1.7.0-Neuerungen
- Neue Schritte: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Demo-Daten erweitert: 6 Filamente → 11 Filamente, 3 Angebote → 5 Angebote
- Übersetzungsschlüssel für alle Sprachen hinzugefügt

---

## v1.6.0 (2025) - 📊 Interaktive Widgets & große Tabellen-Performance-Optimierung

### 🧠 Interaktive Diagramme und detaillierte Modal-Ansichten
- **Haupt-Dashboard-Diagramme verwenden einheitliche `InteractiveChart`-Komponente** mit klickbaren Datenpunkten und animierter detaillierter Modal-Ansicht
- **Tooltip und detaillierte Ansicht sind lokalisiert**, zeigen menschenlesbare Beschriftungen (Umsatz, Kosten, Netto-Gewinn, Angebotsanzahl)
- **Zeitraum kann direkt aus Trend-Diagramm eingestellt werden** (wöchentlich / monatlich / jährlich) mit Brush, geschnittene Daten fließen zu Home → Dashboard

### 🧵 Virtuelles Scrollen für große Listen
- **Benutzerdefiniertes virtuelles Scrollen** für Angebotsliste und Filament-Tabelle – nur sichtbare Zeilen werden gerendert, was sanftes Scrollen auch bei 10k+ Datensätzen gewährleistet
- **Einstellungen → Filament-Bibliothek** verwendet dasselbe Muster, hält die vollständige 12.000+ Farbpalette reaktionsfähig
- **Scrollbar-Position/-Höhe bleibt korrekt** dank Spacer-Elementen oberhalb und unterhalb des sichtbaren Bereichs

### 📋 Erweiterte Tabellen-Sortierung und -Filterung
- **Mehrspalten-Sortierung** auf Filament- und Angebotsseiten (Klick: aufsteigend/absteigend, Shift+Klick: Sortierkette erstellen – z.B. "Marke ↑, dann Preis/kg ↓")
- **Sortiereinstellungen in `settings` gespeichert**, sodass bevorzugte Reihenfolge nach Neustart erhalten bleibt
- **Filamente**: Spaltenebene-Filter für Marke, Material/Typ und Farbe/HEX-Wert
- **Angebote**: Betrags-Filter mit Min-/Max-Werten und Datumsbereich-Filter (von / bis)

---

**Zuletzt aktualisiert**: 1. Dezember 2025


