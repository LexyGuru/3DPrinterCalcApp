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

## 🌿 Branch-Struktur

- **`main`**: Stabile Release-Versionen (RELEASE Build)
- **`beta`**: Beta-Versionen und Entwicklung (BETA Build)

Beim Pushen zum `beta`-Branch läuft automatisch der GitHub Actions Workflow, der die Beta-Version erstellt.

## 📋 Versionsgeschichte

For detailed version history and changelog, please see [RELEASE.de.md](RELEASE.de.md).

---

**Version**: 1.6.0

Wenn Sie Fragen haben oder einen Fehler finden, öffnen Sie bitte ein Issue im GitHub-Repository!

