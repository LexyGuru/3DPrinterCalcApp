import type { LanguageCode } from "./types";

type ConsoleLevel = "log" | "info" | "warn" | "error" | "debug";

export type ConsoleMessageKey =
  | "offers.delete.start"
  | "offers.delete.success"
  | "offers.duplicate.start"
  | "offers.duplicate.success"
  | "offers.edit.start"
  | "offers.save.start"
  | "offers.save.success"
  | "offers.noPrinter"
  | "offers.pdf.start"
  | "offers.pdf.windowBlocked"
  | "offers.pdf.windowReady"
  | "offers.pdf.contentWritten"
  | "offers.pdf.windowLoaded"
  | "offers.pdf.success"
  | "offers.pdf.completed"
  | "offers.pdf.fallbackTrigger"
  | "offers.pdf.fallbackSuccess"
  | "offers.pdf.fallbackCompleted"
  | "offers.pdf.fallbackError"
  | "offers.pdf.error"
  | "offers.pdf.startedForOffer"
  | "offers.reorder"
  | "stats.pngError"
  | "stats.pdfError"
  | "stats.export.start"
  | "stats.export.save"
  | "stats.export.success"
  | "stats.export.cancelled"
  | "stats.export.error"
  | "reports.generate.start"
  | "reports.generate.save"
  | "reports.generate.success"
  | "reports.generate.cancelled"
  | "reports.generate.error"
  | "update.rateLimit.active"
  | "update.check.start"
  | "update.rateLimit.exceeded"
  | "update.check.error"
  | "update.beta.result"
  | "update.stable.result"
  | "update.download.open"
  | "update.download.success"
  | "update.download.error"
  | "update.download.fallbackSuccess"
  | "update.download.fallbackError"
  | "offerCalc.missingElectricityPrice"
  | "offerCalc.noPrinter"
  | "offerCalc.filamentEntry"
  | "offerCalc.totalFilament"
  | "offerCalc.costsCalculated"
  | "filaments.add.invoked"
  | "filaments.image.optimizeError"
  | "filaments.library.sync"
  | "filaments.library.syncFailed"
  | "filaments.library.syncSkipped"
  | "filaments.edit.start"
  | "filaments.edit.success"
  | "filaments.addNew.start"
  | "filaments.addNew.success"
  | "filaments.delete.start"
  | "filaments.delete.success"
  | "filaments.priceSearch.error"
  | "filaments.reorder"
  | "settings.logo.optimizeError"
  | "settings.confirmDialog.error"
  | "settings.customTheme.exportFailed"
  | "settings.customTheme.copyFailed"
  | "settings.customTheme.duplicateFailed"
  | "settings.customTheme.importFailed"
  | "settings.customTheme.exportAllFailed"
  | "settings.library.load.start"
  | "settings.library.load.snapshot"
  | "settings.library.load.error"
  | "settings.library.subscribe.update"
  | "settings.library.subscribe.snapshot"
  | "settings.library.add.start"
  | "settings.library.add.missingFields"
  | "settings.library.add.missingBaseLabel"
  | "settings.library.add.translationFallback"
  | "settings.library.add.upserting"
  | "settings.library.add.updatedEntries"
  | "settings.library.add.persisting"
  | "settings.library.add.snapshotReceived"
  | "settings.library.add.persisted"
  | "settings.library.add.modalClosed"
  | "settings.library.add.persistFailed"
  | "settings.library.add.completed"
  | "settings.library.save.start"
  | "settings.library.save.error"
  | "settings.library.reset.error"
  | "settings.library.export.start"
  | "settings.library.export.snapshot"
  | "settings.library.export.cancelled"
  | "settings.library.export.error"
  | "settings.library.import.start"
  | "settings.library.import.cancelled"
  | "settings.library.import.parsed"
  | "settings.library.import.error"
  | "settings.dataExport.start"
  | "settings.dataExport.prepared"
  | "settings.dataExport.saving"
  | "settings.dataExport.success"
  | "settings.dataExport.cancelled"
  | "settings.dataExport.error"
  | "settings.dataImport.start"
  | "settings.dataImport.cancelled"
  | "settings.dataImport.invalidFile"
  | "settings.dataImport.loading"
  | "settings.dataImport.parsed"
  | "settings.dataImport.importFilaments"
  | "settings.dataImport.importPrinters"
  | "settings.dataImport.importOffers"
  | "settings.dataImport.success"
  | "settings.dataImport.error"
  | "settings.invalidElectricityPrice";

const englishMessages: Record<ConsoleMessageKey, string> = {
  "offers.delete.start": "🗑️ Deleting offer...",
  "offers.delete.success": "✅ Offer deleted successfully",
  "offers.duplicate.start": "📋 Duplicating offer...",
  "offers.duplicate.success": "✅ Offer duplicated successfully",
  "offers.edit.start": "✏️ Starting offer edit...",
  "offers.save.start": "💾 Saving offer...",
  "offers.save.success": "✅ Offer saved successfully",
  "offers.noPrinter": "⚠️ Cannot save offer because no printer is selected",
  "offers.pdf.start": "📄 Starting PDF export...",
  "offers.pdf.windowBlocked": "Window blocked, showing preview",
  "offers.pdf.windowReady": "📄 PDF window loaded, triggering print...",
  "offers.pdf.contentWritten": "PDF content injected into print window",
  "offers.pdf.windowLoaded": "📄 PDF window loaded, triggering print...",
  "offers.pdf.success": "✅ PDF export completed",
  "offers.pdf.completed": "✅ PDF export completed",
  "offers.pdf.fallbackTrigger": "📄 PDF export fallback: triggering print...",
  "offers.pdf.fallbackSuccess": "✅ PDF export completed (fallback)",
  "offers.pdf.fallbackCompleted": "✅ PDF export completed (fallback)",
  "offers.pdf.fallbackError": "❌ PDF export error (fallback)",
  "offers.pdf.error": "❌ PDF export error",
  "offers.pdf.startedForOffer": "📄 PDF export started for offer",
  "offers.reorder": "🔄 Offers reordered",
  "stats.pngError": "❌ PNG export error",
  "stats.pdfError": "❌ PDF export error",
  "stats.export.start": "📊 Starting statistics export...",
  "stats.export.save": "💾 Saving statistics...",
  "stats.export.success": "✅ Statistics export completed",
  "stats.export.cancelled": "ℹ️ Export cancelled",
  "stats.export.error": "❌ Statistics export error",
  "reports.generate.start": "📊 Generating report...",
  "reports.generate.save": "💾 Saving report...",
  "reports.generate.success": "✅ Report generated successfully",
  "reports.generate.cancelled": "ℹ️ Report generation cancelled",
  "reports.generate.error": "❌ Report generation error",
  "update.rateLimit.active": "⏳ GitHub rate limit active, update check will retry later.",
  "update.check.start": "🔍 Checking for updates...",
  "update.rateLimit.exceeded": "⚠️ GitHub API rate limit exceeded, update check failed.",
  "update.check.error": "❌ Update check error",
  "update.beta.result": "📊 Beta update check result",
  "update.stable.result": "📊 Stable update check result",
  "update.download.open": "🔄 Opening update download...",
  "update.download.success": "✅ Update download opened successfully",
  "update.download.error": "❌ Update download error",
  "update.download.fallbackSuccess": "✅ Update download opened via fallback",
  "update.download.fallbackError": "❌ Update download fallback error",
  "offerCalc.missingElectricityPrice": "⚠️ Electricity price is not set or is 0",
  "offerCalc.noPrinter": "⚠️ Cannot calculate offer costs because printer is missing",
  "offerCalc.filamentEntry": "[OfferCalc] Filament cost entry",
  "offerCalc.totalFilament": "[OfferCalc] Total filament cost",
  "offerCalc.costsCalculated": "[OfferCalc] Calculated offer costs",
  "filaments.add.invoked": "[Filaments] addFilament invoked",
  "filaments.image.optimizeError": "❌ Image optimization error",
  "filaments.library.sync": "[Filaments] Syncing color into library",
  "filaments.library.syncFailed": "[Filaments] Failed to sync filament with library",
  "filaments.library.syncSkipped": "[Filaments] Skipping library sync because color is empty",
  "filaments.edit.start": "✏️ Editing filament...",
  "filaments.edit.success": "✅ Filament updated successfully",
  "filaments.addNew.start": "➕ Adding new filament...",
  "filaments.addNew.success": "✅ Filament added successfully",
  "filaments.delete.start": "🗑️ Deleting filament...",
  "filaments.delete.success": "✅ Filament deleted successfully",
  "filaments.priceSearch.error": "[Filaments] Failed to open price search via shell plugin",
  "filaments.reorder": "🔄 Filaments reordered",
  "settings.logo.optimizeError": "❌ Logo optimization error",
  "settings.confirmDialog.error": "[Settings] Confirm dialog action failed",
  "settings.customTheme.exportFailed": "[Settings] Custom theme export failed",
  "settings.customTheme.copyFailed": "[Settings] Custom theme copy failed",
  "settings.customTheme.duplicateFailed": "[Settings] Custom theme duplicate failed",
  "settings.customTheme.importFailed": "[Settings] Custom theme import failed",
  "settings.customTheme.exportAllFailed": "[Settings] Exporting all custom themes failed",
  "settings.library.load.start": "[Settings] Loading library entries...",
  "settings.library.load.snapshot": "[Settings] Library snapshot loaded",
  "settings.library.load.error": "[Settings] Failed to load filament library snapshot",
  "settings.library.subscribe.update": "[Settings] Library update received",
  "settings.library.subscribe.snapshot": "[Settings] Library snapshot received",
  "settings.library.add.start": "[Settings] Preparing library entry",
  "settings.library.add.missingFields": "[Settings] Library entry missing required fields",
  "settings.library.add.missingBaseLabel": "[Settings] Library entry missing base label",
  "settings.library.add.translationFallback": "[Settings] Translation fallback",
  "settings.library.add.upserting": "[Settings] Upserting library entry",
  "settings.library.add.updatedEntries": "[Settings] Library entries updated",
  "settings.library.add.persisting": "[Settings] Persisting library entries",
  "settings.library.add.snapshotReceived": "[Settings] Library snapshot received",
  "settings.library.add.persisted": "[Settings] Library entries persisted",
  "settings.library.add.modalClosed": "[Settings] Library modal closed",
  "settings.library.add.persistFailed": "[Settings] Persisting library entries failed",
  "settings.library.add.completed": "[Settings] Library entry workflow completed",
  "settings.library.save.start": "[Settings] Saving library",
  "settings.library.save.error": "[Settings] Saving library failed",
  "settings.library.reset.error": "[Settings] Library reset failed",
  "settings.library.export.start": "[Settings] Starting library export",
  "settings.library.export.snapshot": "[Settings] Library snapshot prepared for export",
  "settings.library.export.cancelled": "[Settings] Library export cancelled",
  "settings.library.export.error": "[Settings] Library export failed",
  "settings.library.import.start": "[Settings] Starting library import",
  "settings.library.import.cancelled": "[Settings] Library import cancelled",
  "settings.library.import.parsed": "[Settings] Library import parsed",
  "settings.library.import.error": "[Settings] Library import failed",
  "settings.dataExport.start": "📤 Starting data export...",
  "settings.dataExport.prepared": "📊 Export data prepared",
  "settings.dataExport.saving": "💾 Saving export file...",
  "settings.dataExport.success": "✅ Data export completed",
  "settings.dataExport.cancelled": "ℹ️ Data export cancelled",
  "settings.dataExport.error": "❌ Data export error",
  "settings.dataImport.start": "📥 Starting import...",
  "settings.dataImport.cancelled": "ℹ️ Import cancelled",
  "settings.dataImport.invalidFile": "❌ Invalid file selection",
  "settings.dataImport.loading": "📂 Loading file...",
  "settings.dataImport.parsed": "📊 Parsed import data",
  "settings.dataImport.importFilaments": "✅ Importing filaments...",
  "settings.dataImport.importPrinters": "✅ Importing printers...",
  "settings.dataImport.importOffers": "✅ Importing offers...",
  "settings.dataImport.success": "✅ Import completed successfully",
  "settings.dataImport.error": "❌ Import error",
  "settings.invalidElectricityPrice": "⚠️ Loaded settings contain an invalid electricityPrice; using default value instead",
};

const hungarianMessages: Partial<Record<ConsoleMessageKey, string>> = {
  "offers.delete.start": "🗑️ Árajánlat törlése...",
  "offers.delete.success": "✅ Árajánlat sikeresen törölve",
  "offers.duplicate.start": "📋 Árajánlat duplikálása...",
  "offers.duplicate.success": "✅ Árajánlat sikeresen duplikálva",
  "offers.edit.start": "✏️ Árajánlat szerkesztése indítása...",
  "offers.save.start": "💾 Árajánlat mentése...",
  "offers.save.success": "✅ Árajánlat sikeresen mentve",
  "offers.noPrinter": "⚠️ Nem választható nyomtató, a mentés nem folytatható",
  "offers.pdf.start": "📄 PDF export indítása...",
  "offers.pdf.windowBlocked": "Ablak blokkolva, előnézet megjelenítése",
  "offers.pdf.windowReady": "📄 PDF ablak betöltve, nyomtatás indítása...",
  "offers.pdf.contentWritten": "PDF tartalom betöltve a nyomtatási ablakba",
  "offers.pdf.windowLoaded": "📄 PDF ablak betöltve, nyomtatás indítása...",
  "offers.pdf.success": "✅ PDF export sikeres",
  "offers.pdf.completed": "✅ PDF export sikeres",
  "offers.pdf.fallbackTrigger": "📄 PDF export fallback: nyomtatás indítása...",
  "offers.pdf.fallbackSuccess": "✅ PDF export sikeres (fallback)",
  "offers.pdf.fallbackCompleted": "✅ PDF export sikeres (fallback)",
  "offers.pdf.fallbackError": "❌ PDF export hiba (fallback)",
  "offers.pdf.error": "❌ PDF export hiba",
  "offers.pdf.startedForOffer": "📄 PDF export indítva az árajánlathoz",
  "offers.reorder": "🔄 Árajánlatok átrendezve",
  "stats.pngError": "❌ PNG export hiba",
  "stats.pdfError": "❌ PDF export hiba",
  "stats.export.start": "📊 Statisztikák exportálás indítása...",
  "stats.export.save": "💾 Statisztikák mentése...",
  "stats.export.success": "✅ Statisztikák exportja sikeres",
  "stats.export.cancelled": "ℹ️ Export megszakítva",
  "stats.export.error": "❌ Statisztikák export hiba",
  "reports.generate.start": "📊 Riport generálása...",
  "reports.generate.save": "💾 Riport mentése...",
  "reports.generate.success": "✅ Riport generálás sikeres",
  "reports.generate.cancelled": "ℹ️ Riport generálás megszakítva",
  "reports.generate.error": "❌ Riport generálás hiba",
  "update.rateLimit.active": "⏳ GitHub rate limit aktív, a frissítés ellenőrzés később újra próbálkozik.",
  "update.check.start": "🔍 Frissítés ellenőrzése...",
  "update.rateLimit.exceeded": "⚠️ GitHub API korlát miatt nem sikerült a frissítés ellenőrzése.",
  "update.check.error": "❌ Frissítés ellenőrzés hiba",
  "update.beta.result": "📊 Beta frissítés ellenőrzés eredménye",
  "update.stable.result": "📊 Stabil frissítés ellenőrzés eredménye",
  "update.download.open": "🔄 Frissítés letöltése megnyitása...",
  "update.download.success": "✅ Frissítés letöltés sikeresen megnyitva",
  "update.download.error": "❌ Frissítés letöltés hiba",
  "update.download.fallbackSuccess": "✅ Frissítés letöltés fallback módon megnyitva",
  "update.download.fallbackError": "❌ Frissítés letöltés fallback hiba",
  "offerCalc.missingElectricityPrice": "⚠️ Áram ár nincs beállítva vagy 0",
  "offerCalc.noPrinter": "⚠️ Nem számolható ki az ajánlat költsége, mert hiányzik a nyomtató",
  "offerCalc.filamentEntry": "[OfferCalc] Filament költség sor",
  "offerCalc.totalFilament": "[OfferCalc] Összesített filament költség",
  "offerCalc.costsCalculated": "[OfferCalc] Ajánlat költségei kiszámolva",
  "filaments.add.invoked": "[Filaments] addFilament meghívva",
  "filaments.image.optimizeError": "❌ Kép optimalizálási hiba",
  "filaments.library.sync": "[Filaments] Szín szinkronizálása a könyvtárba",
  "filaments.library.syncFailed": "[Filaments] Nem sikerült a könyvtári szinkron",
  "filaments.library.syncSkipped": "[Filaments] A könyvtári szinkron kihagyva, mert a szín üres",
  "filaments.edit.start": "✏️ Filament szerkesztése...",
  "filaments.edit.success": "✅ Filament sikeresen frissítve",
  "filaments.addNew.start": "➕ Új filament hozzáadása...",
  "filaments.addNew.success": "✅ Filament sikeresen hozzáadva",
  "filaments.delete.start": "🗑️ Filament törlése...",
  "filaments.delete.success": "✅ Filament sikeresen törölve",
  "filaments.priceSearch.error": "[Filaments] Nem sikerült megnyitni az árkeresést a shell pluginnal",
  "filaments.reorder": "🔄 Filamentek átrendezve",
  "settings.logo.optimizeError": "❌ Logo optimalizálási hiba",
  "settings.confirmDialog.error": "[Settings] Megerősítő párbeszéd művelete sikertelen",
  "settings.customTheme.exportFailed": "[Settings] Egyedi téma export sikertelen",
  "settings.customTheme.copyFailed": "[Settings] Egyedi téma másolása sikertelen",
  "settings.customTheme.duplicateFailed": "[Settings] Egyedi téma duplikálása sikertelen",
  "settings.customTheme.importFailed": "[Settings] Egyedi téma importálása sikertelen",
  "settings.customTheme.exportAllFailed": "[Settings] Egyedi témák exportja sikertelen",
  "settings.library.load.start": "[Settings] Könyvtár bejegyzések betöltése...",
  "settings.library.load.snapshot": "[Settings] Könyvtári pillanatkép betöltve",
  "settings.library.load.error": "[Settings] Nem sikerült betölteni a filament könyvtár pillanatképet",
  "settings.library.subscribe.update": "[Settings] Könyvtár frissítés érkezett",
  "settings.library.subscribe.snapshot": "[Settings] Könyvtári pillanatkép érkezett",
  "settings.library.add.start": "[Settings] Könyvtár bejegyzés előkészítése",
  "settings.library.add.missingFields": "[Settings] A könyvtári bejegyzésből kötelező mezők hiányoznak",
  "settings.library.add.missingBaseLabel": "[Settings] A könyvtári bejegyzéshez nincs alap címke",
  "settings.library.add.translationFallback": "[Settings] Fordítás fallback",
  "settings.library.add.upserting": "[Settings] Könyvtár bejegyzés upsert",
  "settings.library.add.updatedEntries": "[Settings] Könyvtári bejegyzések frissítve",
  "settings.library.add.persisting": "[Settings] Könyvtári bejegyzések mentése folyamatban",
  "settings.library.add.snapshotReceived": "[Settings] Könyvtári pillanatkép fogadva",
  "settings.library.add.persisted": "[Settings] Könyvtári bejegyzések elmentve",
  "settings.library.add.modalClosed": "[Settings] Könyvtár modal bezárva",
  "settings.library.add.persistFailed": "[Settings] Könyvtári bejegyzések mentése sikertelen",
  "settings.library.add.completed": "[Settings] Könyvtári bejegyzés folyamat befejezve",
  "settings.library.save.start": "[Settings] Könyvtár mentése",
  "settings.library.save.error": "[Settings] Könyvtár mentése sikertelen",
  "settings.library.reset.error": "[Settings] Könyvtár visszaállítása sikertelen",
  "settings.library.export.start": "[Settings] Könyvtár export indítása",
  "settings.library.export.snapshot": "[Settings] Könyvtár export pillanatkép elkészítve",
  "settings.library.export.cancelled": "[Settings] Könyvtár export megszakítva",
  "settings.library.export.error": "[Settings] Könyvtár export sikertelen",
  "settings.library.import.start": "[Settings] Könyvtár import indítása",
  "settings.library.import.cancelled": "[Settings] Könyvtár import megszakítva",
  "settings.library.import.parsed": "[Settings] Könyvtár import adat betöltve",
  "settings.library.import.error": "[Settings] Könyvtár import sikertelen",
  "settings.dataExport.start": "📤 Export indítása...",
  "settings.dataExport.prepared": "📊 Export adatok előkészítve",
  "settings.dataExport.saving": "💾 Fájl mentése...",
  "settings.dataExport.success": "✅ Export sikeresen befejezve",
  "settings.dataExport.cancelled": "ℹ️ Export megszakítva",
  "settings.dataExport.error": "❌ Export hiba",
  "settings.dataImport.start": "📥 Import indítása...",
  "settings.dataImport.cancelled": "ℹ️ Import megszakítva",
  "settings.dataImport.invalidFile": "❌ Érvénytelen fájl kiválasztás",
  "settings.dataImport.loading": "📂 Fájl betöltése...",
  "settings.dataImport.parsed": "📊 Import adatok betöltve",
  "settings.dataImport.importFilaments": "✅ Filamentek importálása...",
  "settings.dataImport.importPrinters": "✅ Nyomtatók importálása...",
  "settings.dataImport.importOffers": "✅ Árajánlatok importálása...",
  "settings.dataImport.success": "✅ Import sikeres",
  "settings.dataImport.error": "❌ Import hiba",
  "settings.invalidElectricityPrice": "⚠️ Betöltött beállításokban az electricityPrice érvénytelen, alapértelmezett értéket használunk",
};

const localizedMessages: Partial<Record<LanguageCode, Partial<Record<ConsoleMessageKey, string>>>> = {
  hu: hungarianMessages,
};

export function getConsoleMessage(language: LanguageCode | undefined, key: ConsoleMessageKey): string {
  if (language) {
    const localized = localizedMessages[language]?.[key];
    if (localized) {
      return localized;
    }
  }
  return englishMessages[key] ?? key;
}

export function logWithLanguage(
  language: LanguageCode | undefined,
  level: ConsoleLevel,
  key: ConsoleMessageKey,
  ...args: unknown[]
) {
  const message = getConsoleMessage(language, key);
  const consoleMethod = console[level] as (...methodArgs: unknown[]) => void;
  if (args.length > 0) {
    consoleMethod(message, ...args);
  } else {
    consoleMethod(message);
  }
}

