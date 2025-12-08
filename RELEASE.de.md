# 📋 Versionshistorie - 3DPrinterCalcApp

Dieses Dokument enthält detaillierte Änderungsprotokolle für alle Versionen der 3D Printer Calculator App.

---

## v3.0.3 (2025) - 🔧 Hotfix: Kundendaten-Verschlüsselung Fixes und UI-Verbesserungen

### 🐛 Fehlerbehebungen

#### Kundendaten-Verschlüsselung Fixes
- **Angebotsaktionen deaktiviert für verschlüsselte Daten** - Wenn Kundendaten verschlüsselt sind und kein Passwort bereitgestellt wird, sind Angebotsbearbeitung, Duplizierung und Statusänderungen jetzt deaktiviert
- **Doppelter Schlüssel-Fehler behoben** - Keine "Encountered two children with the same key" Fehler mehr in der Angebotsliste und Statusverlauf
- **Angebotszähler-Fix** - Der Kunden-Angebotszähler zählt jetzt auch nach `customerId`, nicht nur nach Name, funktioniert korrekt mit verschlüsselten Daten
- **Angebote aktualisieren nach Passworteingabe** - Wenn Passwort bereitgestellt wird und Kunden entschlüsselt werden, werden Kundennamen in Angeboten wiederhergestellt statt "VERSCHLÜSSELTE DATEN"
- **Statusverlaufsliste** - Statusverlaufsliste zeigt jetzt nur Kunden-ID, nicht Kundennamen, auch nach Passworteingabe (entsprechend Verschlüsselungsanforderungen)

#### Toast-Nachrichten Verbesserungen
- **Doppelte Toast-Nachrichten verhindert** - Toast-Nachrichten erscheinen jetzt nur einmal, auch wenn mehrfach aufgerufen
- **Toast schließt bei Button-Klick** - Beim Klicken auf den "Passwort eingeben" Button in der Toast-Nachricht schließt sich der Toast automatisch
- **Toast-Nachricht neu gestaltet** - Toast-Nachrichten haben jetzt ein saubereres, professionelleres Erscheinungsbild mit Spaltenlayout für Aktionsbuttons

#### Übersetzungsschlüssel hinzugefügt
- **Neue Übersetzungsschlüssel** - Hinzugefügt zu allen 13 Sprachen:
  - `encryption.passwordRequired` - "Verschlüsselungspasswort erforderlich"
  - `encryption.passwordRequiredForOfferEdit` - "Verschlüsselungspasswort erforderlich, um das Angebot zu bearbeiten"
  - `encryption.passwordRequiredForOfferDuplicate` - "Verschlüsselungspasswort erforderlich, um das Angebot zu duplizieren"
  - `encryption.passwordRequiredForOfferStatusChange` - "Verschlüsselungspasswort erforderlich, um den Angebotsstatus zu ändern"
  - `encryption.passwordRequiredForCustomerCreate` - "Verschlüsselungspasswort erforderlich, um einen neuen Kunden zu erstellen"
  - `encryption.passwordRequiredForCustomerEdit` - "Verschlüsselungspasswort erforderlich zum Bearbeiten"
  - `encryption.encryptedData` - "VERSCHLÜSSELTE DATEN"
  - `customers.id` - "Kunden-ID"
  - `customers.encryptedDataMessage` - "🔒 Verschlüsselte Daten - Passwort erforderlich zum Anzeigen"

### 📝 Technische Details

- **Version aktualisiert**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.3`
- **Hardcodierte Strings ersetzt**: Alle hardcodierten ungarischen Strings durch Übersetzungsschlüssel ersetzt
- **TypeScript-Typen aktualisiert**: Neue Übersetzungsschlüssel zum `TranslationKey`-Typ hinzugefügt
- **Toast Provider modifiziert**: Doppelter Toast-Check und automatisches Schließen hinzugefügt
- **Angebotsaktualisierungslogik**: Automatische Angebotsaktualisierung nach Kundenentschlüsselung bei Passwortbereitstellung

---

## v3.0.2 (2025) - 🔧 Hotfix: Tutorial-Fixes, Berechtigungen, Factory Reset-Protokollierung

### 🐛 Fehlerbehebungen

#### Tutorial-Fixes
- **Tutorial-Datenerhaltung** - Wenn das Tutorial bereits einmal ausgeführt wurde, werden vorhandene Daten nicht erneut gelöscht
- **Tutorial auf 18 Schritte erweitert** - Hinzugefügt: Projekte, Aufgaben, Kalender, Backup/Wiederherstellung Schritte
- **Tutorial-Übersetzungsschlüssel** - Fehlende Übersetzungsschlüssel zu allen Sprachdateien hinzugefügt

#### Berechtigungs-Fixes
- **customers.json Berechtigungen** - Berechtigungen für `customers.json` Dateilöschung hinzugefügt

#### Factory Reset-Protokollierung
- **Backend-Log-Datei schreiben** - Factory Reset-Schritte werden jetzt in die Backend-Log-Datei geschrieben
- **Detaillierte Protokollierung** - Jeder Factory Reset-Schritt wird detailliert protokolliert
- **Backend-Log-Löschung wiederhergestellt** - Backend-Log-Datei wird jetzt beim Factory Reset gelöscht

### 📝 Technische Details

- **Version aktualisiert**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Übersetzungen, Beta Build Workflow

### 🐛 Fehlerbehebungen

#### Factory Reset Fix
- **Factory Reset behoben** - Die `customers.json` Datei wird jetzt explizit während des Factory Reset gelöscht
- **Vollständige Löschung der Kundendaten** - Die verschlüsselte Kundendaten-Datei (`customers.json`) wird ebenfalls gelöscht, um eine vollständige Datenlöschung sicherzustellen

#### Fehlende Übersetzungsschlüssel
- **`encryption.noAppPassword` Schlüssel hinzugefügt** - Fehlender Übersetzungsschlüssel zu allen 14 Sprachen hinzugefügt
- **Backup-Nachrichten Übersetzungen** - Übersetzungen für "Noch keine automatischen Backup-Dateien vorhanden" Nachricht hinzugefügt
- **Log-Verwaltung Übersetzungen** - Übersetzungen für Log- und Audit-Log-Verwaltung hinzugefügt:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Kalender Übersetzungen** - Übersetzungen für Monats- und Tagesnamen hinzugefügt:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Hilfe-Menü Beschreibung** - Übersetzungen für "Show Help menu item in Sidebar" Beschreibung hinzugefügt

#### Beta Build Workflow Fix
- **Beta Branch expliziter Checkout** - Der Workflow verwendet jetzt explizit den neuesten Commit des `beta` Branches
- **Tag Commit Fix** - Der `beta-v3.0.1` Tag zeigt jetzt auf den richtigen Commit (nicht auf den alten Commit)
- **Source Code Datum Fix** - Das "Source code" Datum zeigt jetzt die Build-Zeit, nicht das alte Commit-Datum
- **Überprüfungsschritte hinzugefügt** - Git Pull und Commit SHA Überprüfung zum Workflow hinzugefügt

### 📝 Technische Details

- **Version aktualisiert**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Duplizierte Schlüssel gelöscht**: `settings.logs.openFolder` Duplikationen aus allen Sprachdateien entfernt
- **TypeScript-Typen aktualisiert**: `encryption.noAppPassword` zum `TranslationKey`-Typ hinzugefügt

---

## v3.0.0 (2025) - 🔒 Kundendatenverschlüsselung & DSGVO-Konformität + ⚡ Performance-Optimierung

### ⚡ Performance-Optimierung und Code Splitting

#### React.lazy() Dokumentation und Optimierung
- **React.lazy() Implementierungsdokumentation** - Vollständige Dokumentation erstellt (`docs/PERFORMANCE.md`)
- **Lade-Phase-Optimierung** - Während der Lade-Phase werden nur Daten geladen, Komponenten bei Bedarf
- **Suspense Fallback-Optimierung** - Optimierte Fallback-Komponenten in AppRouter.tsx
- **Error Boundary hinzugefügt** - LazyErrorBoundary.tsx Komponente für lazy geladene Komponenten

#### Route-basiertes Code Splitting
- **React Router Integration** - React Router v7.10.0 installiert und konfiguriert
- **URL-basierte Navigation** - Route-Struktur implementiert (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy Loading für Routen** - Jede Route automatisch in separate Dateien aufgeteilt
- **State-basiert → Routing-Umstellung** - `activePage` State auf URL-basiertes Routing umgestellt
- **Lesezeichenfähige Seiten** - Alle Seiten über direkte URL erreichbar
- **Browser-Navigation-Unterstützung** - Zurück/Vor-Tasten funktionieren, besseres UX

#### Code Splitting Feinabstimmung
- **Vite Build-Konfigurationsoptimierung** - `rollupOptions.output.manualChunks` konfiguriert
- **Vendor Chunk-Optimierung**:
  - React/React-DOM/React-Router separater Chunk (`vendor-react`)
  - Tauri APIs separater Chunk (`vendor-tauri`)
  - UI-Bibliotheken separate Chunks (`vendor-ui-framer`, `vendor-ui-charts`)
  - Andere node_modules (`vendor`)
- **Route-basiertes Chunking** - Automatisches Lazy Loading erstellt separate Chunks pro Route
- **Router-Dateien-Gruppierung** - Organisiert in `router`, `routes` Chunks
- **Gemeinsame Komponenten-Gruppierung** - `components-shared` Chunk
- **Chunk-Größen-Warnlimit** - Auf 1000 KB gesetzt

#### Modulare Architektur
- **Modulare Architektur-Dokumentation** - Vollständige Dokumentation (`docs/MODULAR_ARCHITECTURE.md`)
- **Pfad-Aliasse** - `@features`, `@shared`, `@core` Aliasse konfiguriert
- **Vite- und TypeScript-Konfiguration** - Aktualisiert mit Pfad-Alias-Unterstützung
- **Gemeinsame Module-Implementierung**:
  - Gemeinsame Komponenten (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Gemeinsame Hooks (useModal, useForm)
  - Gemeinsame Utilities (debounce, format, validation)
- **Feature-Module-Refaktorierung** - Vollständige Refaktorierung von 6 Modulen:
  - Calculator: 582 Zeilen → 309 Zeilen (-46.9%)
  - Settings: 5947 Zeilen → 897 Zeilen (-85%!)
  - Offers: 3985 Zeilen → 3729 Zeilen (-6.4%)
  - Home: 3454 Zeilen → 3308 Zeilen (-4.2%)
  - Filaments- und Printers-Module ebenfalls refaktoriert

### 🔒 Kundendatenverschlüsselung
- **AES-256-GCM-Verschlüsselung** - Verschlüsselte Speicherung von Kundendaten mit dem branchenüblichen AES-256-GCM-Algorithmus
- **PBKDF2-Passwort-Hashing** - Sichere Passwortspeicherung mit PBKDF2-Algorithmus (100.000 Iterationen, SHA-256)
- **Separate Dateispeicherung** - Verschlüsselte Kundendaten werden in einer separaten `customers.json`-Datei gespeichert
- **In-Memory-Passwortverwaltung** - Passwörter werden nur im Speicher gespeichert und beim Schließen der Anwendung gelöscht
- **App-Passwort-Integration** - Optional: Das App-Passwortschutz-Passwort kann auch für die Verschlüsselung verwendet werden
- **Passwort-Prompt-System** - Intelligente Passwortanfrage (erscheint nicht auf dem Ladebildschirm, nach der Willkommensnachricht)
- **Datenschutz** - Verschlüsselte Daten vor versehentlichem Löschen geschützt

### ✅ DSGVO/EU-konforme Datenschutzbestimmungen
- **Konformität**: Die Anwendung verarbeitet Kundendaten in Übereinstimmung mit der DSGVO (Datenschutz-Grundverordnung) und EU-Datenschutzbestimmungen
- **Branchenübliche Verschlüsselung**: Verwendung des AES-256-GCM-Algorithmus (erfüllt EU-Empfehlungen)
- **Sichere Passwortverwaltung**: PBKDF2-Hashing-Algorithmus (NIST-empfohlen)
- **Minimale Datensammlung**: Speichert nur die für die Anwendung erforderlichen Kundendaten
- **Datenaufbewahrung**: Der Benutzer hat vollständige Kontrolle über die Datenspeicherung und -löschung
- **Zugriffskontrolle**: Passwortgeschützter Zugriff auf Kundendaten

### 🎨 UI/UX-Verbesserungen
- **Verschlüsselungsaktivierungs-Modal** - Neues Modal-Dialogfeld zur Aktivierung der Verschlüsselung mit App-Passwort-Option
- **ConfirmDialog-Erweiterung** - customContent-Unterstützung für Modal-Komponenten
- **Passwort-Prompt-Timing** - Intelligente Anzeige (nicht auf dem Ladebildschirm)
- **Einstellungsintegration** - Verschlüsselungseinstellungen im Sicherheits-Tab

### 🔧 Technische Verbesserungen
- **Backend-Verschlüsselungsmodul** - In Rust implementierte Verschlüsselung (`src-tauri/src/encryption.rs`)
- **Frontend-Verschlüsselungs-Utilities** - TypeScript-Hilfsfunktionen zur Verschlüsselungsverwaltung
- **Passwort-Manager** - In-Memory-Passwortverwaltungssystem
- **Store-Integration** - saveCustomers/loadCustomers-Funktionen mit Verschlüsselungsintegration

### 📚 Sprachunterstützung
- **13 Sprachen aktualisiert** - Neue Verschlüsselungsübersetzungsschlüssel in allen Sprachdateien
- **Neue Schlüssel**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Performance-Überwachung & Audit-Log-System

### 🌐 Lokalisierung von Konsolennachrichten
- **Vollständige Konsolenlokalisierung** - Alle Konsolennachrichten werden in der ausgewählten Sprache angezeigt
- **Übersetzung von Speicheroperationen** - Lade- und Speichernachrichten (Drucker, Filamente, Einstellungen, Angebote, Kunden, Projekte, Aufgaben)
- **Übersetzung von Backup-Nachrichten** - Tägliche Backup-Prüfung, Backup-Erstellung, Rotationsnachrichten
- **Übersetzung von Log-Rotationsnachrichten** - Log- und Audit-Log-Rotationsnachrichten mit dynamischen Teilen
- **Übersetzung von Leistungsmetriken** - CPU- und Speichermetriken, regelmäßige Protokollnachrichten
- **Übersetzung von Systemnachrichten** - Anwendungsinitialisierung, Frontend-Log-Initialisierung, Willkommensnachricht
- **Übersetzung von mehrteiligen Nachrichten** - Übersetzung von Konsolennachrichtendatenteilen (Datum, Zeitstempel, Datei, Statusinformationen)
- **Unterstützung für 13 Sprachen** - Alle Konsolennachrichten übersetzt ins Englische, Ungarische, Deutsche, Spanische, Italienische, Polnische, Portugiesische, Russische, Ukrainische, Tschechische, Slowakische und Chinesische

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


