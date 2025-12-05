# Settings Modul Refaktorálási Terv - Befejezés

## 📊 Jelenlegi Állapot

- **Settings.tsx**: 3357 sor (cél: < 500 sor)
- **AdvancedTab komponens**: ✅ KÉSZ (~975 sor)
- **DataTab komponens**: ⏳ HIÁNYZIK (~960 sor)
- **LibraryTab komponens**: ⏳ HIÁNYZIK (~383 sor + modal)

## 🎯 Következő Lépések

### 1. DataTab Komponens Létrehozása
**Tartalom:**
- Backup/restore gombok
- Factory reset szekció
- Log Management (2 oszlopban)
  - Bal: Log beállítások + Log History
  - Jobb: Audit Log beállítások + Audit Log History
- System Diagnostics gomb
- Export/Import Data (2 oszlopban)

**Props szükségesek:**
- settings, onChange, theme, themeStyles, showToast
- printers, setPrinters, filaments, setFilaments, offers, setOffers
- logHistory, setLogHistory, loadLogHistory
- auditLogHistory, setAuditLogHistory, loadAuditLogHistory
- selectedLogFile, setSelectedLogFile, logViewerOpen, setLogViewerOpen
- selectedAuditLogFile, setSelectedAuditLogFile, auditLogViewerOpen, setAuditLogViewerOpen
- showFactoryResetProgress, setShowFactoryResetProgress
- showSystemDiagnostics, setShowSystemDiagnostics
- onFactoryReset
- openConfirmDialog

### 2. LibraryTab Komponens Létrehozása
**Tartalom:**
- Library header (cím, gombok)
- Duplicate groups banner
- Library filters és lista
- Export/Import storage gombok
- Library modal (már van a Settings.tsx-ben)

**Props szükségesek:**
- settings, theme, themeStyles, showToast, t
- useSettingsLibrary hook return értékei
- openConfirmDialog

### 3. Settings.tsx Integráció és Cleanup
- AdvancedTab integrálása
- DataTab integrálása
- LibraryTab integrálása
- Nem használt kód eltávolítása
- Modal-ok átmozgatása (vagy megmaradnak a Settings.tsx-ben)

## 📝 Megjegyzések

- Az AdvancedTab modal-ja (Autosave Info Modal) már benne van a komponensben
- A Library modal még a Settings.tsx-ben van, lehet hogy ott marad vagy átmegy a LibraryTab-ba
- A Log Viewer és Audit Log Viewer modal-ok maradhatnak a Settings.tsx-ben vagy átmegynek a DataTab-ba
- Factory Reset Progress modal marad a Settings.tsx-ben
- System Diagnostics modal marad a Settings.tsx-ben

## ✅ Várható Eredmény

**Settings.tsx**: ~3357 sor → ~400-500 sor (-2850+ sor, -85%!)

