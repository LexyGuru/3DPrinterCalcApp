# 🖨️ 3D Printer Calculator App

> **🌍 Sprachauswahl**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

Eine moderne Desktop-Anwendung zur Berechnung von 3D-Druckkosten. Erstellt mit Tauri v2, React Frontend und Rust Backend.

## ✨ Funktionen

- 📊 **Kostenberechnung** - Automatische Berechnung von Filament-, Strom-, Trocknungs- und Verschleißkosten
- 🧵 **Filamentverwaltung** - Filamente hinzufügen, bearbeiten, löschen (Marke, Typ, Farbe, Preis)
- 🖨️ **Druckerverwaltung** - Drucker und AMS-Systeme verwalten
- 💰 **Gewinnberechnung** - Wählbarer Gewinnprozentsatz (10%, 20%, 30%, 40%, 50%)
- 📄 **Angebote** - Angebote speichern, verwalten und als PDF exportieren (Kundenname, Kontakt, Beschreibung)
- 🧠 **Filter-Voreinstellungen** - Angebotsfilter speichern, schnelle Voreinstellungen anwenden, datums-/zeitbasierte automatische Filter
- 🗂️ **Status-Dashboard** - Statuskarten, schnelle Filter und Zeitachse der letzten Statusänderungen
- 📝 **Statusnotizen** - Jede Statusänderung mit optionalen Notizen und Verlaufprotokollierung
- 👁️ **PDF-Vorschau & Vorlagen** - Integrierte PDF-Vorschau, wählbare Vorlagen und Firmen-Branding-Blöcke
- 🎨 **Filament-Farbbibliothek** - Über 2000 Fabrikfarben mit marken- und typspezifischen wählbaren Panels
- 💾 **Filament-Bibliothekseditor** - Modalbasierte Hinzufügung/Bearbeitung, Duplikatswarnungen und persistente Speicherung in `filamentLibrary.json`
- 🖼️ **Filamentbilder in PDF** - Anzeige von Filament-Logos und Farbmustern in generierten PDFs
- 🧾 **G-Code-Import & Entwurfserstellung** - G-Code/JSON-Exporte (Prusa, Cura, Orca, Qidi) aus Modal im Rechner laden, mit detaillierter Zusammenfassung und automatischer Angebotsentwurfsgenerierung
- 📈 **Statistiken** - Übersichtsdashboard für Filamentverbrauch, Umsatz, Gewinn
- 🌍 **Mehrsprachig** - Vollständige Übersetzung in Ungarisch, Englisch, Deutsch, Französisch, Vereinfachtem Chinesisch, Tschechisch, Spanisch, Italienisch, Polnisch, Portugiesisch und Slowakisch (12 Sprachen, 813 Übersetzungsschlüssel pro Sprache)
- 💱 **Mehrere Währungen** - EUR, HUF, USD
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

### v0.5.56 (2025)
- 🌍 **Vollständige Sprachübersetzungen** – Vollständige Übersetzungen für 6 verbleibende Sprachdateien abgeschlossen: Tschechisch (cs), Spanisch (es), Italienisch (it), Polnisch (pl), Portugiesisch (pt) und Slowakisch (sk). Jede Datei enthält alle 813 Übersetzungsschlüssel, sodass die Anwendung nun vollständig in diesen Sprachen unterstützt wird.
- 🔒 **Tauri-Berechtigungen-Fix** – Die Datei `update_filamentLibrary.json` ist nun explizit für Lese-, Schreib- und Erstellungsvorgänge in der Tauri-Capabilities-Datei aktiviert, sodass Filament-Bibliotheksupdates zuverlässig funktionieren.

### v0.5.55 (2025)
- 🧵 **Angebotsbearbeitungsverbesserung** – Gespeicherte Angebote ermöglichen nun die direkte Druckerauswahl oder -änderung, wobei die Kosten automatisch zusammen mit Filamentänderungen neu berechnet werden.
- 🧮 **Genauigkeit und Protokollierung** – Detaillierte Protokollierung hilft, die Schritte der Kostenberechnung (Filament, Strom, Trocknung, Nutzung) zu verfolgen, was es einfacher macht, Fehler in importierten G-Code-Dateien zu finden.
- 🌍 **Übersetzungsergänzungen** – Neue i18n-Schlüssel und Beschriftungen für den Druckerauswähler hinzugefügt, sodass die Editor-UI in allen unterstützten Sprachen konsistent ist.
- 📄 **Dokumentationsupdate** – README mit Beschreibung neuer Funktionen erweitert, v0.5.55 Release zur Versionsgeschichte hinzugefügt.

---

**Version**: 0.5.56

Wenn Sie Fragen haben oder einen Fehler finden, öffnen Sie bitte ein Issue im GitHub-Repository!

