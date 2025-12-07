# DataTab Komponens Létrehozási Terv

## 📋 Tartalom

A DataTab komponens tartalmazza:
1. **Backup/Restore** (~60 sor)
2. **Factory Reset** (~45 sor)
3. **Log Management** (~300 sor - 2 oszlopban)
   - Bal: Log beállítások + Log History
   - Jobb: Audit Log beállítások + Audit Log History
4. **System Diagnostics** (~40 sor)
5. **Export/Import Data** (~200 sor - 2 oszlopban)

## 🔧 Props Szükségesek

```typescript
interface DataTabProps {
  // Alap props
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
  
  // Data props
  printers: Printer[];
  setPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  filaments: Filament[];
  setFilaments: React.Dispatch<React.SetStateAction<Filament[]>>;
  offers: Offer[];
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  
  // Log props
  logHistory: LogHistoryItem[];
  setLogHistory: React.Dispatch<React.SetStateAction<LogHistoryItem[]>>;
  loadLogHistory: () => Promise<void>;
  auditLogHistory: AuditLogHistoryItem[];
  setAuditLogHistory: React.Dispatch<React.SetStateAction<AuditLogHistoryItem[]>>;
  loadAuditLogHistory: () => Promise<void>;
  
  // Log viewer props
  selectedLogFile: { path: string; name: string } | null;
  setSelectedLogFile: React.Dispatch<React.SetStateAction<{ path: string; name: string } | null>>;
  logViewerOpen: boolean;
  setLogViewerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedAuditLogFile: { path: string; name: string } | null;
  setSelectedAuditLogFile: React.Dispatch<React.SetStateAction<{ path: string; name: string } | null>>;
  auditLogViewerOpen: boolean;
  setAuditLogViewerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Factory reset props
  showFactoryResetProgress: boolean;
  setShowFactoryResetProgress: React.Dispatch<React.SetStateAction<boolean>>;
  onFactoryReset?: () => void;
  
  // System diagnostics props
  showSystemDiagnostics: boolean;
  setShowSystemDiagnostics: React.Dispatch<React.SetStateAction<boolean>>;
  
  // Confirm dialog
  openConfirmDialog: (config: ConfirmDialogConfig) => void;
}
```

## 📝 Megjegyzések

- Az export/import state-ek (exportFilaments, importFilaments, stb.) a komponensben lesznek kezelve
- A handleExport és handleImport függvények a komponensben lesznek
- A modal komponensek (LogViewer, AuditLogViewer, FactoryResetProgress, SystemDiagnostics) maradnak a Settings.tsx-ben

## ✅ Következő Lépések

1. DataTab komponens létrehozása
2. Settings.tsx integráció
3. LibraryTab komponens létrehozása
4. Final cleanup

