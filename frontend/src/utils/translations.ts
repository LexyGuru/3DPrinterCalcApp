import type { Settings } from "../types";

export type TranslationKey = 
  // Home
  | "home.title"
  | "home.welcome"
  | "home.about"
  | "home.description"
  | "home.features"
  | "home.features.printers"
  | "home.features.filaments"
  | "home.features.calculator"
  | "home.features.settings"
  | "home.version"
  // Filaments
  | "filaments.title"
  | "filaments.addTitle"
  | "filaments.brand"
  | "filaments.type"
  | "filaments.weight"
  | "filaments.pricePerKg"
  | "filaments.add"
  | "filaments.delete"
  | "filaments.empty"
  | "filaments.action"
  | "filaments.edit"
  | "filaments.save"
  | "filaments.cancel"
  // Printers
  | "printers.title"
  | "printers.addTitle"
  | "printers.name"
  | "printers.type"
  | "printers.power"
  | "printers.usageCost"
  | "printers.add"
  | "printers.delete"
  | "printers.empty"
  | "printers.action"
  // Calculator
  | "calculator.title"
  | "calculator.parameters"
  | "calculator.printer"
  | "calculator.filament"
  | "calculator.printTime"
  | "calculator.printTimeLabel"
  | "calculator.filamentUsed"
  | "calculator.filaments"
  | "calculator.selectPrinter"
  | "calculator.selectFilament"
  | "calculator.costBreakdown"
  | "calculator.filamentCost"
  | "calculator.electricityCost"
  | "calculator.usageCost"
  | "calculator.totalCost"
  | "calculator.fillFields"
  | "calculator.maxFilaments"
  | "calculator.hours"
  | "calculator.minutes"
  | "calculator.seconds"
  | "calculator.totalTime"
  | "calculator.hoursUnit"
  | "calculator.addFilament"
  | "calculator.usedGrams"
  | "calculator.selectFilamentOption"
  | "calculator.filterNeeded"
  | "calculator.filterChangeTime"
  | "calculator.filterChangePower"
  | "calculator.filterCost"
  | "calculator.dryingNeeded"
  | "calculator.dryingTime"
  | "calculator.dryingPower"
  | "calculator.dryingCost"
  | "calculator.profit"
  | "calculator.revenue"
  | "calculator.totalPrice"
  | "filaments.color"
  // Printers - AMS
  | "printers.amsCount"
  | "printers.ams"
  | "printers.amsSystems"
  | "printers.edit"
  | "printers.save"
  | "printers.amsBrand"
  | "printers.amsName"
  | "printers.amsPower"
  // Sidebar
  | "sidebar.menu"
  | "sidebar.offers"
  // Settings
  | "settings.title"
  | "settings.language"
  | "settings.currency"
  | "settings.electricityPrice"
  | "settings.checkForBetaUpdates"
  | "settings.checkForBetaUpdatesDescription"
  | "settings.exportData"
  | "settings.importData"
  | "settings.exportTitle"
  | "settings.importTitle"
  | "settings.exportDescription"
  | "settings.importDescription"
  | "settings.selectExportItems"
  | "settings.selectImportItems"
  | "settings.exportFilaments"
  | "settings.exportPrinters"
  | "settings.exportOffers"
  | "settings.importFilaments"
  | "settings.importPrinters"
  | "settings.importOffers"
  | "settings.exportButton"
  | "settings.importButton"
  | "settings.exportSuccess"
  | "settings.importSuccess"
  | "settings.exportError"
  | "settings.importError"
  | "settings.noFileSelected"
  | "settings.invalidFile"
  | "settings.theme"
  | "settings.themeDescription"
  | "settings.showConsole"
  | "settings.showConsoleDescription"
  | "settings.autosave"
  | "settings.autosaveDescription"
  | "settings.autosaveInterval"
  | "settings.autosaveIntervalDescription"
  | "settings.notificationEnabled"
  | "settings.notificationEnabledDescription"
  | "settings.notificationDuration"
  | "settings.notificationDurationDescription"
  | "settings.backup"
  | "settings.backupCreate"
  | "settings.backupRestore"
  | "settings.shortcuts"
  | "settings.shortcutsDescription"
  // Console
  | "console.title"
  | "console.filter"
  | "console.all"
  | "console.error"
  | "console.warn"
  | "console.info"
  | "console.log"
  | "console.debug"
  | "console.autoScroll"
  | "console.clear"
  | "console.export"
  | "console.exported"
  | "console.exportError"
  | "console.cleared"
  | "console.empty"
  | "console.total"
  | "console.errors"
  | "console.warnings"
  // Offers
  | "offers.title"
  | "offers.save"
  | "offers.empty"
  | "offers.delete"
  | "offers.exportPDF"
  | "offers.downloadPDF"
  | "offers.print"
  | "offers.customerName"
  | "offers.customerContact"
  | "offers.description"
  | "offers.profitPercentage"
  | "offers.date"
  | "offers.printer"
  | "offers.printTime"
  | "offers.filaments"
  | "calculator.saveAsOffer"
  // Common
  | "common.delete"
  | "common.add"
  | "common.confirm"
  | "common.cancel"
  | "common.yes"
  | "common.no"
  | "common.confirmDelete"
  | "common.confirmDeleteFilament"
  | "common.confirmDeletePrinter"
  | "common.confirmDeleteOffer"
  | "common.offerDuplicated"
  | "common.printerUpdated"
  // Shortcuts
  | "shortcuts.title"
  | "shortcuts.noShortcuts"
  | "shortcuts.closeHint"
  // Backup
  | "backup.create"
  | "backup.restore"
  | "backup.createSuccess"
  | "backup.restoreSuccess"
  | "backup.restoreError"
  | "backup.invalidFile"
  | "backup.confirmRestore"
  | "common.success"
  | "common.error"
  | "common.filamentAdded"
  | "common.filamentUpdated"
  | "common.filamentDeleted"
  | "common.printerAdded"
  | "common.printerUpdated"
  | "common.printerDeleted"
  | "common.offerSaved"
  | "common.offerDeleted"
  | "common.loading"
  | "common.duplicate"
  | "common.offerDuplicated"
  | "common.close"
  // Sidebar
  | "sidebar.home"
  | "sidebar.filaments"
  | "sidebar.printers"
  | "sidebar.calculator"
  | "sidebar.settings"
  | "sidebar.console";

export const translations: Record<Settings["language"], Record<TranslationKey, string>> = {
  hu: {
    // Home
    "home.title": "Üdvözöllek a 3DPrinterCalcApp-ban!",
    "home.welcome": "Üdvözöllek",
    "home.about": "Az alkalmazásról",
    "home.description": "Ez az alkalmazás segít kiszámítani a 3D nyomtatási költségeket, figyelembe véve a filament árát, az áramfelhasználást és a nyomtató kopását.",
    "home.features": "Funkciók:",
    "home.features.printers": "Nyomtatók kezelése: Add hozzá a nyomtatóidat és azok paramétereit",
    "home.features.filaments": "Filamentek kezelése: Kezeld a filament kollekciódat árral együtt",
    "home.features.calculator": "Kalkulátor: Számítsd ki a nyomtatási költségeket",
    "home.features.settings": "Beállítások: Állítsd be a pénznemet és az áram árát",
    "home.version": "Verzió:",
    // Filaments
    "filaments.title": "Filamentek kezelése",
    "filaments.addTitle": "Új filament hozzáadása",
    "filaments.brand": "Márka:",
    "filaments.type": "Típus:",
    "filaments.weight": "Súly (g):",
    "filaments.pricePerKg": "Ár (€/kg):",
    "filaments.add": "Hozzáadás",
    "filaments.delete": "❌ Törlés",
    "filaments.empty": "Nincs hozzáadott filament. Add hozzá az elsőt!",
    "filaments.action": "Művelet",
    "filaments.edit": "✏️ Szerkesztés",
    "filaments.save": "💾 Mentés",
    "filaments.cancel": "❌ Mégse",
    // Printers
    "printers.title": "Nyomtatók kezelése",
    "printers.addTitle": "Új nyomtató hozzáadása",
    "printers.name": "Név:",
    "printers.type": "Típus:",
    "printers.power": "Teljesítmény (W):",
    "printers.usageCost": "Kopás (€/óra):",
    "printers.add": "Hozzáadás",
    "printers.delete": "❌ Törlés",
    "printers.empty": "Nincs hozzáadott nyomtató. Add hozzá az elsőt!",
    "printers.action": "Művelet",
    "printers.amsCount": "AMS száma (0-4):",
    "printers.ams": "AMS",
    "printers.amsSystems": "AMS rendszerek",
    "printers.edit": "Szerkesztés",
    "printers.save": "Mentés",
    "printers.amsBrand": "Márka",
    "printers.amsName": "Név",
    "printers.amsPower": "Teljesítmény (W)",
    // Calculator
    "calculator.title": "3D Nyomtatási Költség Kalkulátor",
    "calculator.parameters": "Számítási paraméterek",
    "calculator.printer": "Nyomtató:",
    "calculator.filament": "Filament:",
    "calculator.printTime": "Nyomtatási idő (óra):",
    "calculator.printTimeLabel": "Nyomtatási idő:",
    "calculator.filamentUsed": "Felhasznált filament (gramm):",
    "calculator.filaments": "Filamentek",
    "calculator.selectPrinter": "-- Válassz nyomtatót --",
    "calculator.selectFilament": "-- Válassz filamentet --",
    "calculator.costBreakdown": "Költség bontás",
    "calculator.filamentCost": "Filament költség:",
    "calculator.electricityCost": "Áram költség:",
    "calculator.usageCost": "Használati költség:",
    "calculator.totalCost": "Összes költség:",
    "calculator.fillFields": "Töltsd ki az összes mezőt a kalkuláció megjelenítéséhez.",
    "calculator.maxFilaments": "Maximális filamentek:",
    "calculator.hours": "Óra:",
    "calculator.minutes": "Perc:",
    "calculator.seconds": "Másodperc:",
    "calculator.totalTime": "Összesen:",
    "calculator.hoursUnit": "óra",
    "calculator.addFilament": "+ Filament hozzáadása",
    "calculator.usedGrams": "Felhasznált (g):",
    "calculator.selectFilamentOption": "-- Válassz filamentet --",
    "calculator.filterNeeded": "Szűrő csere szükséges",
    "calculator.filterChangeTime": "Szűrő csere ideje (óra):",
    "calculator.filterChangePower": "Teljesítmény (W):",
    "calculator.filterCost": "Szűrő csere költség:",
    "calculator.dryingNeeded": "Szárítás szükséges",
    "calculator.dryingTime": "Szárítási idő (óra):",
    "calculator.dryingPower": "Szárítás teljesítménye (W):",
    "calculator.dryingCost": "Szárítás költség:",
    "calculator.saveAsOffer": "💾 Mentés árajánlatként",
    "calculator.profit": "Profit",
    "calculator.revenue": "Bevétel",
    "calculator.totalPrice": "Összes ár",
    "filaments.color": "Szín:",
    // Settings
    "settings.title": "Beállítások",
    "settings.language": "Nyelv:",
    "settings.currency": "Pénznem:",
    "settings.electricityPrice": "Áram ára:",
    "settings.checkForBetaUpdates": "Beta verziók ellenőrzése:",
    "settings.checkForBetaUpdatesDescription": "Ha bekapcsolod, az alkalmazás beta release-eket is ellenőrizni fog, nem csak a stabil verziókat.",
    "settings.exportData": "Adatok exportálása",
    "settings.importData": "Adatok importálása",
    "settings.exportTitle": "Exportálás",
    "settings.importTitle": "Importálás",
    "settings.exportDescription": "Válaszd ki, hogy mit szeretnél exportálni:",
    "settings.importDescription": "Válaszd ki, hogy mit szeretnél importálni:",
    "settings.selectExportItems": "Válassz ki az exportálandó elemeket:",
    "settings.selectImportItems": "Válassz ki az importálandó elemeket:",
    "settings.exportFilaments": "Filamentek",
    "settings.exportPrinters": "Nyomtatók",
    "settings.exportOffers": "Árajánlatok",
    "settings.importFilaments": "Filamentek",
    "settings.importPrinters": "Nyomtatók",
    "settings.importOffers": "Árajánlatok",
    "settings.exportButton": "💾 Exportálás",
    "settings.importButton": "📥 Importálás",
    "settings.exportSuccess": "Adatok sikeresen exportálva!",
    "settings.importSuccess": "Adatok sikeresen importálva!",
    "settings.exportError": "Hiba történt az exportálás során!",
    "settings.importError": "Hiba történt az importálás során!",
    "settings.noFileSelected": "Nincs fájl kiválasztva!",
    "settings.invalidFile": "Érvénytelen fájl formátum!",
    "settings.theme": "Téma:",
    "settings.themeDescription": "Válassz egy témát az alkalmazás megjelenéséhez. A változtatás azonnal érvénybe lép.",
    "settings.showConsole": "Console/Log megjelenítése:",
    "settings.showConsoleDescription": "Ha bekapcsolod, megjelenik egy Console menüpont a menüben, ahol láthatod a hibákat és logokat.",
    "settings.autosave": "Automatikus mentés:",
    "settings.autosaveDescription": "Ha bekapcsolod, az alkalmazás automatikusan menti az adatokat.",
    "settings.autosaveInterval": "Automatikus mentés intervallum (másodperc):",
    "settings.autosaveIntervalDescription": "Adja meg, hogy hány másodpercenként történjen az automatikus mentés (minimum 5 másodperc).",
    "settings.notificationEnabled": "Értesítések engedélyezése:",
    "settings.notificationEnabledDescription": "Ha bekapcsolod, az alkalmazás értesítéseket jelenít meg a műveletekről.",
    "settings.notificationDuration": "Értesítés időtartama (ms):",
    "settings.notificationDurationDescription": "Adja meg, hogy hány milliszekundumig jelenjen meg az értesítés (minimum 1000ms).",
    "settings.backup": "Backup",
    "settings.backupCreate": "Backup létrehozása",
    "settings.backupRestore": "Backup visszaállítása",
    "settings.shortcuts": "Gyorsbillentyűk megjelenítése:",
    "settings.shortcutsDescription": "Nyomd meg a Ctrl/Cmd+? billentyűt a gyorsbillentyűk listájának megjelenítéséhez.",
    // Console
    "console.title": "Console / Log",
    "console.filter": "Szűrő:",
    "console.all": "Összes",
    "console.error": "Hibák",
    "console.warn": "Figyelmeztetések",
    "console.info": "Információk",
    "console.log": "Logok",
    "console.debug": "Debug",
    "console.autoScroll": "Automatikus görgetés",
    "console.clear": "Törlés",
    "console.export": "Export",
    "console.exported": "Logok exportálva!",
    "console.exportError": "Hiba az exportálás során!",
    "console.cleared": "Logok törölve!",
    "console.empty": "Nincs log üzenet",
    "console.total": "Összesen",
    "console.errors": "hiba",
    "console.warnings": "figyelmeztetés",
    // Offers
    "offers.title": "Árajánlatok",
    "offers.save": "Mentés",
    "offers.empty": "Nincs mentett árajánlat.",
    "offers.delete": "❌ Törlés",
    "offers.exportPDF": "📄 PDF Export",
    "offers.downloadPDF": "💾 PDF Letöltés",
    "offers.print": "🖨️ Nyomtatás",
    "offers.customerName": "Ügyfél neve:",
    "offers.customerContact": "Kapcsolat:",
    "offers.description": "Leírás:",
    "offers.profitPercentage": "Profit százalék:",
    "offers.date": "Dátum:",
    "offers.printer": "Nyomtató:",
    "offers.printTime": "Nyomtatási idő:",
    "offers.filaments": "Filamentek:",
    // Common
    "common.delete": "Törlés",
    "common.add": "Hozzáadás",
    "common.confirm": "Megerősítés",
    "common.cancel": "Mégse",
    "common.yes": "Igen",
    "common.no": "Nem",
    "common.confirmDelete": "Biztosan törölni szeretnéd?",
    "common.confirmDeleteFilament": "Biztosan törölni szeretnéd ezt a filamentet?",
    "common.confirmDeletePrinter": "Biztosan törölni szeretnéd ezt a nyomtatót?",
    "common.confirmDeleteOffer": "Biztosan törölni szeretnéd ezt az árajánlatot?",
    "common.success": "Sikeres",
    "common.error": "Hiba",
    "common.filamentAdded": "Filament sikeresen hozzáadva!",
    "common.filamentUpdated": "Filament sikeresen frissítve!",
    "common.filamentDeleted": "Filament sikeresen törölve!",
    "common.printerAdded": "Nyomtató sikeresen hozzáadva!",
    "common.printerUpdated": "Nyomtató sikeresen frissítve!",
    "common.printerDeleted": "Nyomtató sikeresen törölve!",
    "common.offerSaved": "Árajánlat sikeresen mentve!",
    "common.offerDeleted": "Árajánlat sikeresen törölve!",
    "common.loading": "Betöltés...",
    "common.duplicate": "Duplikálás",
    "common.offerDuplicated": "Árajánlat sikeresen duplikálva!",
    "common.close": "Bezárás",
    // Shortcuts
    "shortcuts.title": "Gyorsbillentyűk",
    "shortcuts.noShortcuts": "Nincsenek regisztrált gyorsbillentyűk",
    "shortcuts.closeHint": "Nyomd meg az Escape-t vagy Ctrl/Cmd+? a bezáráshoz",
    // Backup
    "backup.create": "Backup létrehozása",
    "backup.restore": "Backup visszaállítása",
    "backup.createSuccess": "Backup sikeresen létrehozva!",
    "backup.restoreSuccess": "Backup sikeresen visszaállítva!",
    "backup.restoreError": "Hiba a backup visszaállításakor",
    "backup.invalidFile": "Érvénytelen backup fájl",
    "backup.confirmRestore": "Biztosan vissza szeretnéd állítani a backup-ot? Ez felülírja az aktuális adatokat.",
    // Sidebar
    "sidebar.menu": "Menü",
    "sidebar.home": "Kezdőlap",
    "sidebar.filaments": "Filamentek",
    "sidebar.printers": "Nyomtatók",
    "sidebar.calculator": "Kalkulátor",
    "sidebar.offers": "Árajánlatok",
    "sidebar.settings": "Beállítások",
    "sidebar.console": "Console",
  },
  en: {
    // Home
    "home.title": "Welcome to 3DPrinterCalcApp!",
    "home.welcome": "Welcome",
    "home.about": "About the Application",
    "home.description": "This application helps calculate 3D printing costs, taking into account filament price, electricity consumption and printer wear.",
    "home.features": "Features:",
    "home.features.printers": "Printer Management: Add your printers and their parameters",
    "home.features.filaments": "Filament Management: Manage your filament collection with prices",
    "home.features.calculator": "Calculator: Calculate printing costs",
    "home.features.settings": "Settings: Set your currency and electricity price",
    "home.version": "Version:",
    // Filaments
    "filaments.title": "Filament Management",
    "filaments.addTitle": "Add New Filament",
    "filaments.brand": "Brand:",
    "filaments.type": "Type:",
    "filaments.weight": "Weight (g):",
    "filaments.pricePerKg": "Price (€/kg):",
    "filaments.add": "Add",
    "filaments.delete": "❌ Delete",
    "filaments.empty": "No filaments added. Add the first one!",
    "filaments.action": "Action",
    "filaments.edit": "✏️ Edit",
    "filaments.save": "💾 Save",
    "filaments.cancel": "❌ Cancel",
    // Printers
    "printers.title": "Printer Management",
    "printers.addTitle": "Add New Printer",
    "printers.name": "Name:",
    "printers.type": "Type:",
    "printers.power": "Power (W):",
    "printers.usageCost": "Wear (€/hour):",
    "printers.add": "Add",
    "printers.delete": "❌ Delete",
    "printers.empty": "No printers added. Add the first one!",
    "printers.action": "Action",
    "printers.amsCount": "AMS Count (0-4):",
    "printers.ams": "AMS",
    "printers.amsSystems": "AMS Systems",
    "printers.edit": "Edit",
    "printers.save": "Save",
    "printers.amsBrand": "Brand",
    "printers.amsName": "Name",
    "printers.amsPower": "Power (W)",
    // Calculator
    "calculator.title": "3D Printing Cost Calculator",
    "calculator.parameters": "Calculation Parameters",
    "calculator.printer": "Printer:",
    "calculator.filament": "Filament:",
    "calculator.printTime": "Print Time (hours):",
    "calculator.printTimeLabel": "Print Time:",
    "calculator.filamentUsed": "Filament Used (grams):",
    "calculator.filaments": "Filaments",
    "calculator.selectPrinter": "-- Select Printer --",
    "calculator.selectFilament": "-- Select Filament --",
    "calculator.costBreakdown": "Cost Breakdown",
    "calculator.filamentCost": "Filament Cost:",
    "calculator.electricityCost": "Electricity Cost:",
    "calculator.usageCost": "Usage Cost:",
    "calculator.totalCost": "Total Cost:",
    "calculator.fillFields": "Fill in all fields to display the calculation.",
    "calculator.maxFilaments": "Max Filaments:",
    "calculator.hours": "Hours:",
    "calculator.minutes": "Minutes:",
    "calculator.seconds": "Seconds:",
    "calculator.totalTime": "Total:",
    "calculator.hoursUnit": "hours",
    "calculator.addFilament": "+ Add Filament",
    "calculator.usedGrams": "Used (g):",
    "calculator.selectFilamentOption": "-- Select Filament --",
    "calculator.filterNeeded": "Filter Change Required",
    "calculator.filterChangeTime": "Filter Change Time (hours):",
    "calculator.filterChangePower": "Power (W):",
    "calculator.filterCost": "Filter Change Cost:",
    "calculator.dryingNeeded": "Drying Required",
    "calculator.dryingTime": "Drying Time (hours):",
    "calculator.dryingPower": "Drying Power (W):",
    "calculator.dryingCost": "Drying Cost:",
    "calculator.saveAsOffer": "💾 Save as Offer",
    "calculator.profit": "Profit",
    "calculator.revenue": "Revenue",
    "calculator.totalPrice": "Total Price",
    "filaments.color": "Color:",
    // Settings
    "settings.title": "Settings",
    "settings.language": "Language:",
    "settings.currency": "Currency:",
    "settings.electricityPrice": "Electricity Price:",
    "settings.checkForBetaUpdates": "Check for beta updates:",
    "settings.checkForBetaUpdatesDescription": "If enabled, the app will also check for beta releases, not just stable versions.",
    "settings.exportData": "Export Data",
    "settings.importData": "Import Data",
    "settings.exportTitle": "Export",
    "settings.importTitle": "Import",
    "settings.exportDescription": "Select what you want to export:",
    "settings.importDescription": "Select what you want to import:",
    "settings.selectExportItems": "Select items to export:",
    "settings.selectImportItems": "Select items to import:",
    "settings.exportFilaments": "Filaments",
    "settings.exportPrinters": "Printers",
    "settings.exportOffers": "Offers",
    "settings.importFilaments": "Filaments",
    "settings.importPrinters": "Printers",
    "settings.importOffers": "Offers",
    "settings.exportButton": "💾 Export",
    "settings.importButton": "📥 Import",
    "settings.exportSuccess": "Data exported successfully!",
    "settings.importSuccess": "Data imported successfully!",
    "settings.exportError": "Error exporting data!",
    "settings.importError": "Error importing data!",
    "settings.noFileSelected": "No file selected!",
    "settings.invalidFile": "Invalid file format!",
    "settings.theme": "Theme:",
    "settings.themeDescription": "Choose a theme for the application appearance. Changes take effect immediately.",
    "settings.showConsole": "Show Console/Log:",
    "settings.showConsoleDescription": "If enabled, a Console menu item will appear in the menu where you can see errors and logs.",
    "settings.autosave": "Automatic save:",
    "settings.autosaveDescription": "If enabled, the application will automatically save data.",
    "settings.autosaveInterval": "Automatic save interval (seconds):",
    "settings.autosaveIntervalDescription": "Specify how often the automatic save should occur (minimum 5 seconds).",
    "settings.notificationEnabled": "Enable notifications:",
    "settings.notificationEnabledDescription": "If enabled, the application will show notifications about operations.",
    "settings.notificationDuration": "Notification duration (ms):",
    "settings.notificationDurationDescription": "Specify how long the notification should be displayed (minimum 1000ms).",
    "settings.backup": "Backup",
    "settings.backupCreate": "Create Backup",
    "settings.backupRestore": "Restore Backup",
    "settings.shortcuts": "Show Keyboard Shortcuts:",
    "settings.shortcutsDescription": "Press Ctrl/Cmd+? to show the keyboard shortcuts list.",
    // Console
    "console.title": "Console / Log",
    "console.filter": "Filter:",
    "console.all": "All",
    "console.error": "Errors",
    "console.warn": "Warnings",
    "console.info": "Info",
    "console.log": "Logs",
    "console.debug": "Debug",
    "console.autoScroll": "Auto scroll",
    "console.clear": "Clear",
    "console.export": "Export",
    "console.exported": "Logs exported!",
    "console.exportError": "Error exporting logs!",
    "console.cleared": "Logs cleared!",
    "console.empty": "No log messages",
    "console.total": "Total",
    "console.errors": "errors",
    "console.warnings": "warnings",
    // Offers
    "offers.title": "Offers",
    "offers.save": "Save",
    "offers.empty": "No saved offers.",
    "offers.delete": "❌ Delete",
    "offers.exportPDF": "📄 Export PDF",
    "offers.downloadPDF": "💾 Download PDF",
    "offers.print": "🖨️ Print",
    "offers.customerName": "Customer Name:",
    "offers.customerContact": "Contact:",
    "offers.description": "Description:",
    "offers.profitPercentage": "Profit Percentage:",
    "offers.date": "Date:",
    "offers.printer": "Printer:",
    "offers.printTime": "Print Time:",
    "offers.filaments": "Filaments:",
    // Common
    "common.delete": "Delete",
    "common.add": "Add",
    "common.confirm": "Confirm",
    "common.cancel": "Cancel",
    "common.yes": "Yes",
    "common.no": "No",
    "common.confirmDelete": "Are you sure you want to delete?",
    "common.confirmDeleteFilament": "Are you sure you want to delete this filament?",
    "common.confirmDeletePrinter": "Are you sure you want to delete this printer?",
    "common.confirmDeleteOffer": "Are you sure you want to delete this offer?",
    "common.success": "Success",
    "common.error": "Error",
    "common.filamentAdded": "Filament added successfully!",
    "common.filamentUpdated": "Filament updated successfully!",
    "common.filamentDeleted": "Filament deleted successfully!",
    "common.printerAdded": "Printer added successfully!",
    "common.printerUpdated": "Printer updated successfully!",
    "common.printerDeleted": "Printer deleted successfully!",
    "common.offerSaved": "Offer saved successfully!",
    "common.offerDeleted": "Offer deleted successfully!",
    "common.loading": "Loading...",
    "common.duplicate": "Duplicate",
    "common.offerDuplicated": "Offer duplicated successfully!",
    "common.close": "Close",
    // Shortcuts
    "shortcuts.title": "Keyboard Shortcuts",
    "shortcuts.noShortcuts": "No shortcuts registered",
    "shortcuts.closeHint": "Press Escape or Ctrl/Cmd+? to close",
    // Backup
    "backup.create": "Create Backup",
    "backup.restore": "Restore Backup",
    "backup.createSuccess": "Backup created successfully!",
    "backup.restoreSuccess": "Backup restored successfully!",
    "backup.restoreError": "Error restoring backup",
    "backup.invalidFile": "Invalid backup file",
    "backup.confirmRestore": "Are you sure you want to restore the backup? This will overwrite your current data.",
    // Sidebar
    "sidebar.menu": "Menu",
    "sidebar.home": "Home",
    "sidebar.filaments": "Filaments",
    "sidebar.printers": "Printers",
    "sidebar.calculator": "Calculator",
    "sidebar.offers": "Offers",
    "sidebar.settings": "Settings",
    "sidebar.console": "Console",
  },
  de: {
    // Home
    "home.title": "Willkommen bei 3DPrinterCalcApp!",
    "home.welcome": "Willkommen",
    "home.about": "Über die Anwendung",
    "home.description": "Diese Anwendung hilft bei der Berechnung der 3D-Druckkosten unter Berücksichtigung des Filamentpreises, des Stromverbrauchs und des Druckerverschleißes.",
    "home.features": "Funktionen:",
    "home.features.printers": "Druckerverwaltung: Fügen Sie Ihre Drucker und deren Parameter hinzu",
    "home.features.filaments": "Filamentverwaltung: Verwalten Sie Ihre Filamentsammlung mit Preisen",
    "home.features.calculator": "Rechner: Berechnen Sie Druckkosten",
    "home.features.settings": "Einstellungen: Legen Sie Ihre Währung und den Strompreis fest",
    "home.version": "Version:",
    // Filaments
    "filaments.title": "Filamentverwaltung",
    "filaments.addTitle": "Neues Filament hinzufügen",
    "filaments.brand": "Marke:",
    "filaments.type": "Typ:",
    "filaments.weight": "Gewicht (g):",
    "filaments.pricePerKg": "Preis (€/kg):",
    "filaments.add": "Hinzufügen",
    "filaments.delete": "❌ Löschen",
    "filaments.empty": "Keine Filamente hinzugefügt. Fügen Sie das erste hinzu!",
    "filaments.action": "Aktion",
    "filaments.edit": "✏️ Bearbeiten",
    "filaments.save": "💾 Speichern",
    "filaments.cancel": "❌ Abbrechen",
    // Printers
    "printers.title": "Druckerverwaltung",
    "printers.addTitle": "Neuen Drucker hinzufügen",
    "printers.name": "Name:",
    "printers.type": "Typ:",
    "printers.power": "Leistung (W):",
    "printers.usageCost": "Verschleiß (€/Stunde):",
    "printers.add": "Hinzufügen",
    "printers.delete": "❌ Löschen",
    "printers.empty": "Keine Drucker hinzugefügt. Fügen Sie den ersten hinzu!",
    "printers.action": "Aktion",
    "printers.amsCount": "AMS-Anzahl (0-4):",
    "printers.ams": "AMS",
    "printers.amsSystems": "AMS-Systeme",
    "printers.edit": "Bearbeiten",
    "printers.save": "Speichern",
    "printers.amsBrand": "Marke",
    "printers.amsName": "Name",
    "printers.amsPower": "Leistung (W)",
    // Calculator
    "calculator.title": "3D-Druckkostenrechner",
    "calculator.parameters": "Berechnungsparameter",
    "calculator.printer": "Drucker:",
    "calculator.filament": "Filament:",
    "calculator.printTime": "Druckzeit (Stunden):",
    "calculator.printTimeLabel": "Druckzeit:",
    "calculator.filamentUsed": "Verwendetes Filament (Gramm):",
    "calculator.filaments": "Filamente",
    "calculator.selectPrinter": "-- Drucker auswählen --",
    "calculator.selectFilament": "-- Filament auswählen --",
    "calculator.costBreakdown": "Kostenaufschlüsselung",
    "calculator.filamentCost": "Filamentkosten:",
    "calculator.electricityCost": "Stromkosten:",
    "calculator.usageCost": "Nutzungskosten:",
    "calculator.totalCost": "Gesamtkosten:",
    "calculator.fillFields": "Füllen Sie alle Felder aus, um die Berechnung anzuzeigen.",
    "calculator.maxFilaments": "Max. Filamente:",
    "calculator.hours": "Stunden:",
    "calculator.minutes": "Minuten:",
    "calculator.seconds": "Sekunden:",
    "calculator.totalTime": "Gesamt:",
    "calculator.hoursUnit": "Stunden",
    "calculator.addFilament": "+ Filament hinzufügen",
    "calculator.usedGrams": "Verwendet (g):",
    "calculator.selectFilamentOption": "-- Filament auswählen --",
    "calculator.filterNeeded": "Filterwechsel erforderlich",
    "calculator.filterChangeTime": "Filterwechselzeit (Stunden):",
    "calculator.filterChangePower": "Leistung (W):",
    "calculator.filterCost": "Filterwechselkosten:",
    "calculator.dryingNeeded": "Trocknung erforderlich",
    "calculator.dryingTime": "Trocknungszeit (Stunden):",
    "calculator.dryingPower": "Trocknungsleistung (W):",
    "calculator.dryingCost": "Trocknungskosten:",
    "calculator.saveAsOffer": "💾 Als Angebot speichern",
    "calculator.profit": "Gewinn",
    "calculator.revenue": "Einnahmen",
    "calculator.totalPrice": "Gesamtpreis",
    "filaments.color": "Farbe:",
    // Settings
    "settings.title": "Einstellungen",
    "settings.language": "Sprache:",
    "settings.currency": "Währung:",
    "settings.electricityPrice": "Strompreis:",
    "settings.checkForBetaUpdates": "Beta-Versionen prüfen:",
    "settings.checkForBetaUpdatesDescription": "Wenn aktiviert, prüft die App auch Beta-Versionen, nicht nur stabile Versionen.",
    "settings.exportData": "Daten exportieren",
    "settings.importData": "Daten importieren",
    "settings.exportTitle": "Exportieren",
    "settings.importTitle": "Importieren",
    "settings.exportDescription": "Wählen Sie aus, was Sie exportieren möchten:",
    "settings.importDescription": "Wählen Sie aus, was Sie importieren möchten:",
    "settings.selectExportItems": "Elemente zum Exportieren auswählen:",
    "settings.selectImportItems": "Elemente zum Importieren auswählen:",
    "settings.exportFilaments": "Filamente",
    "settings.exportPrinters": "Drucker",
    "settings.exportOffers": "Angebote",
    "settings.importFilaments": "Filamente",
    "settings.importPrinters": "Drucker",
    "settings.importOffers": "Angebote",
    "settings.exportButton": "💾 Exportieren",
    "settings.importButton": "📥 Importieren",
    "settings.exportSuccess": "Daten erfolgreich exportiert!",
    "settings.importSuccess": "Daten erfolgreich importiert!",
    "settings.exportError": "Fehler beim Exportieren!",
    "settings.importError": "Fehler beim Importieren!",
    "settings.noFileSelected": "Keine Datei ausgewählt!",
    "settings.invalidFile": "Ungültiges Dateiformat!",
    "settings.theme": "Design:",
    "settings.themeDescription": "Wähle ein Design für das Erscheinungsbild der Anwendung. Änderungen werden sofort wirksam.",
    "settings.showConsole": "Console/Log anzeigen:",
    "settings.showConsoleDescription": "Wenn aktiviert, erscheint ein Console-Menüpunkt im Menü, wo Sie Fehler und Logs sehen können.",
    "settings.autosave": "Automatisches Speichern:",
    "settings.autosaveDescription": "Wenn aktiviert, speichert die Anwendung automatisch Daten.",
    "settings.autosaveInterval": "Intervall für automatisches Speichern (Sekunden):",
    "settings.autosaveIntervalDescription": "Geben Sie an, wie oft das automatische Speichern erfolgen soll (mindestens 5 Sekunden).",
    "settings.notificationEnabled": "Benachrichtigungen aktivieren:",
    "settings.notificationEnabledDescription": "Wenn aktiviert, zeigt die Anwendung Benachrichtigungen über Vorgänge an.",
    "settings.notificationDuration": "Benachrichtigungsdauer (ms):",
    "settings.notificationDurationDescription": "Geben Sie an, wie lange die Benachrichtigung angezeigt werden soll (mindestens 1000ms).",
    "settings.backup": "Backup",
    "settings.backupCreate": "Backup erstellen",
    "settings.backupRestore": "Backup wiederherstellen",
    "settings.shortcuts": "Tastenkürzel anzeigen:",
    "settings.shortcutsDescription": "Drücken Sie Strg/Cmd+?, um die Liste der Tastenkürzel anzuzeigen.",
    // Console
    "console.title": "Console / Log",
    "console.filter": "Filter:",
    "console.all": "Alle",
    "console.error": "Fehler",
    "console.warn": "Warnungen",
    "console.info": "Info",
    "console.log": "Logs",
    "console.debug": "Debug",
    "console.autoScroll": "Auto-Scroll",
    "console.clear": "Löschen",
    "console.export": "Exportieren",
    "console.exported": "Logs exportiert!",
    "console.exportError": "Fehler beim Exportieren der Logs!",
    "console.cleared": "Logs gelöscht!",
    "console.empty": "Keine Log-Nachrichten",
    "console.total": "Gesamt",
    "console.errors": "Fehler",
    "console.warnings": "Warnungen",
    // Offers
    "offers.title": "Angebote",
    "offers.save": "Speichern",
    "offers.empty": "Keine gespeicherten Angebote.",
    "offers.delete": "❌ Löschen",
    "offers.exportPDF": "📄 PDF Exportieren",
    "offers.downloadPDF": "💾 PDF Herunterladen",
    "offers.print": "🖨️ Drucken",
    "offers.customerName": "Kundenname:",
    "offers.customerContact": "Kontakt:",
    "offers.description": "Beschreibung:",
    "offers.profitPercentage": "Gewinnprozent:",
    "offers.date": "Datum:",
    "offers.printer": "Drucker:",
    "offers.printTime": "Druckzeit:",
    "offers.filaments": "Filamente:",
    // Common
    "common.delete": "Löschen",
    "common.add": "Hinzufügen",
    "common.confirm": "Bestätigen",
    "common.cancel": "Abbrechen",
    "common.yes": "Ja",
    "common.no": "Nein",
    "common.confirmDelete": "Möchten Sie wirklich löschen?",
    "common.confirmDeleteFilament": "Möchten Sie dieses Filament wirklich löschen?",
    "common.confirmDeletePrinter": "Möchten Sie diesen Drucker wirklich löschen?",
    "common.confirmDeleteOffer": "Möchten Sie dieses Angebot wirklich löschen?",
    "common.success": "Erfolg",
    "common.error": "Fehler",
    "common.filamentAdded": "Filament erfolgreich hinzugefügt!",
    "common.filamentUpdated": "Filament erfolgreich aktualisiert!",
    "common.filamentDeleted": "Filament erfolgreich gelöscht!",
    "common.printerAdded": "Drucker erfolgreich hinzugefügt!",
    "common.printerUpdated": "Drucker erfolgreich aktualisiert!",
    "common.printerDeleted": "Drucker erfolgreich gelöscht!",
    "common.offerSaved": "Angebot erfolgreich gespeichert!",
    "common.offerDeleted": "Angebot erfolgreich gelöscht!",
    "common.loading": "Laden...",
    "common.duplicate": "Duplizieren",
    "common.offerDuplicated": "Angebot erfolgreich dupliziert!",
    "common.close": "Schließen",
    // Shortcuts
    "shortcuts.title": "Tastenkürzel",
    "shortcuts.noShortcuts": "Keine Tastenkürzel registriert",
    "shortcuts.closeHint": "Drücken Sie Escape oder Strg/Cmd+? zum Schließen",
    // Backup
    "backup.create": "Backup erstellen",
    "backup.restore": "Backup wiederherstellen",
    "backup.createSuccess": "Backup erfolgreich erstellt!",
    "backup.restoreSuccess": "Backup erfolgreich wiederhergestellt!",
    "backup.restoreError": "Fehler beim Wiederherstellen des Backups",
    "backup.invalidFile": "Ungültige Backup-Datei",
    "backup.confirmRestore": "Möchten Sie das Backup wirklich wiederherstellen? Dies überschreibt Ihre aktuellen Daten.",
    // Sidebar
    "sidebar.menu": "Menü",
    "sidebar.home": "Home",
    "sidebar.filaments": "Filamente",
    "sidebar.printers": "Drucker",
    "sidebar.calculator": "Rechner",
    "sidebar.offers": "Angebote",
    "sidebar.settings": "Einstellungen",
    "sidebar.console": "Console",
  },
};

export function useTranslation(language: Settings["language"]) {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
}

