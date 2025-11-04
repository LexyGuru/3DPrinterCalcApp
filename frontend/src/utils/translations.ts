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
  // Offers
  | "offers.title"
  | "offers.save"
  | "offers.empty"
  | "offers.delete"
  | "offers.exportPDF"
  | "offers.downloadPDF"
  | "offers.print"
  | "offers.customerName"
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
  // Sidebar
  | "sidebar.home"
  | "sidebar.filaments"
  | "sidebar.printers"
  | "sidebar.calculator"
  | "sidebar.settings";

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
    "filaments.color": "Szín:",
    // Settings
    // Offers
    "offers.title": "Árajánlatok",
    "offers.save": "Mentés",
    "offers.empty": "Nincs mentett árajánlat.",
    "offers.delete": "❌ Törlés",
    "offers.exportPDF": "📄 PDF Export",
    "offers.downloadPDF": "💾 PDF Letöltés",
    "offers.print": "🖨️ Nyomtatás",
    "offers.customerName": "Ügyfél neve:",
    "offers.description": "Leírás:",
    "offers.profitPercentage": "Profit százalék:",
    "offers.date": "Dátum:",
    "offers.printer": "Nyomtató:",
    "offers.printTime": "Nyomtatási idő:",
    "offers.filaments": "Filamentek:",
    // Sidebar
    "settings.title": "Beállítások",
    "settings.language": "Nyelv:",
    "settings.currency": "Pénznem:",
    "settings.electricityPrice": "Áram ára:",
    "settings.checkForBetaUpdates": "Beta verziók ellenőrzése:",
    "settings.checkForBetaUpdatesDescription": "Ha bekapcsolod, az alkalmazás beta release-eket is ellenőrizni fog, nem csak a stabil verziókat.",
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
    // Sidebar
    "sidebar.menu": "Menü",
    "sidebar.home": "Kezdőlap",
    "sidebar.filaments": "Filamentek",
    "sidebar.printers": "Nyomtatók",
    "sidebar.calculator": "Kalkulátor",
    "sidebar.offers": "Árajánlatok",
    "sidebar.settings": "Beállítások",
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
    "filaments.color": "Color:",
    // Settings
    // Offers
    "offers.title": "Offers",
    "offers.save": "Save",
    "offers.empty": "No saved offers.",
    "offers.delete": "❌ Delete",
    "offers.exportPDF": "📄 Export PDF",
    "offers.downloadPDF": "💾 Download PDF",
    "offers.print": "🖨️ Print",
    "offers.customerName": "Customer Name:",
    "offers.description": "Description:",
    "offers.profitPercentage": "Profit Percentage:",
    "offers.date": "Date:",
    "offers.printer": "Printer:",
    "offers.printTime": "Print Time:",
    "offers.filaments": "Filaments:",
    // Sidebar
    "settings.title": "Settings",
    "settings.language": "Language:",
    "settings.currency": "Currency:",
    "settings.electricityPrice": "Electricity Price:",
    "settings.checkForBetaUpdates": "Check for beta updates:",
    "settings.checkForBetaUpdatesDescription": "If enabled, the app will also check for beta releases, not just stable versions.",
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
    // Sidebar
    "sidebar.menu": "Menu",
    "sidebar.home": "Home",
    "sidebar.filaments": "Filaments",
    "sidebar.printers": "Printers",
    "sidebar.calculator": "Calculator",
    "sidebar.offers": "Offers",
    "sidebar.settings": "Settings",
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
    "filaments.color": "Farbe:",
    // Settings
    // Offers
    "offers.title": "Angebote",
    "offers.save": "Speichern",
    "offers.empty": "Keine gespeicherten Angebote.",
    "offers.delete": "❌ Löschen",
    "offers.exportPDF": "📄 PDF Exportieren",
    "offers.downloadPDF": "💾 PDF Herunterladen",
    "offers.print": "🖨️ Drucken",
    "offers.customerName": "Kundenname:",
    "offers.description": "Beschreibung:",
    "offers.profitPercentage": "Gewinnprozent:",
    "offers.date": "Datum:",
    "offers.printer": "Drucker:",
    "offers.printTime": "Druckzeit:",
    "offers.filaments": "Filamente:",
    // Sidebar
    "settings.title": "Einstellungen",
    "settings.language": "Sprache:",
    "settings.currency": "Währung:",
    "settings.electricityPrice": "Strompreis:",
    "settings.checkForBetaUpdates": "Beta-Versionen prüfen:",
    "settings.checkForBetaUpdatesDescription": "Wenn aktiviert, prüft die App auch Beta-Versionen, nicht nur stabile Versionen.",
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
    // Sidebar
    "sidebar.menu": "Menü",
    "sidebar.home": "Home",
    "sidebar.filaments": "Filamente",
    "sidebar.printers": "Drucker",
    "sidebar.calculator": "Rechner",
    "sidebar.offers": "Angebote",
    "sidebar.settings": "Einstellungen",
  },
};

export function useTranslation(language: Settings["language"]) {
  return (key: TranslationKey): string => {
    return translations[language][key] || key;
  };
}

