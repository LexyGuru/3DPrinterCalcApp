import type { Offer, Printer, Settings } from "../types";
import { convertCurrencyFromTo } from "./currency";
import { logWithLanguage } from "./languages/global_console";

export interface OfferCosts {
  filamentCost: number;
  electricityCost: number;
  dryingCost: number;
  usageCost: number;
  totalCost: number;
  calculations?: {
    filamentCostEUR: number;
    electricityCostEUR: number;
    dryingCostEUR: number;
    usageCostEUR: number;
  };
}

export function calculateOfferCosts(
  offer: Offer,
  printer: Printer | null,
  settings: Settings
): OfferCosts | null {
  if (!printer) {
    logWithLanguage(settings.language, "warn", "offerCalc.noPrinter", {
      offerId: offer.id,
      printerName: offer.printerName,
    });
    return null;
  }

  const totalPrintTimeHours = offer.totalPrintTimeHours;

  // Filament költségek (összes filament)
  let totalFilamentCostEUR = 0;
  offer.filaments.forEach((f, index) => {
    const massKg = (f.usedGrams ?? 0) / 1000;
    const pricePerKg = f.pricePerKg ?? 0;
    const filamentCostEUR = massKg * pricePerKg;
    logWithLanguage(settings.language, "debug", "offerCalc.filamentEntry", {
      offerId: offer.id,
      filamentIndex: index,
      brand: f.brand,
      type: f.type,
      usedGrams: f.usedGrams,
      pricePerKg,
      filamentCostEUR,
    });
    totalFilamentCostEUR += filamentCostEUR;
  });
  // Kerekítjük a lebegőpontos precíziós hibák elkerülésére
  const filamentCost = Math.round(convertCurrencyFromTo(totalFilamentCostEUR, "EUR", offer.currency || "EUR") * 100) / 100;
  logWithLanguage(settings.language, "debug", "offerCalc.totalFilament", {
    offerId: offer.id,
    totalFilamentCostEUR,
    filamentCostConverted: filamentCost,
    targetCurrency: offer.currency || "EUR",
  });

  // Áram költség: nyomtató + AMS-ek
  let totalPowerW = printer.power;
  if (printer.ams && printer.ams.length > 0) {
    totalPowerW += printer.ams.reduce((sum, ams) => sum + ams.power, 0);
  }
  const powerConsumedKWh = (totalPowerW / 1000) * totalPrintTimeHours;
  // Az electricityPrice mindig Ft/kWh-ban van tárolva
  const electricityPrice = settings.electricityPrice || 0;
  if (electricityPrice <= 0) {
    logWithLanguage(settings.language, "warn", "offerCalc.missingElectricityPrice", { electricityPrice });
  }
  const electricityCostHUF = powerConsumedKWh * electricityPrice;
  // Konvertáljuk EUR-ra (400 Ft = 1 EUR), majd az offer pénznemére
  const electricityCostEUR = electricityCostHUF / 400;
  // Kerekítjük a lebegőpontos precíziós hibák elkerülésére
  const electricityCost = Math.round(convertCurrencyFromTo(electricityCostEUR, "EUR", offer.currency || "EUR") * 100) / 100;

  // Szárítás költség minden filamentnél külön
  let totalDryingCostEUR = 0;
  offer.filaments.forEach((f) => {
    if (f.needsDrying && f.dryingTime && f.dryingTime > 0 && f.dryingPower && f.dryingPower > 0) {
      // Szárítás teljesítmény felhasználás kWh-ban
      const dryingPowerConsumedKWh = (f.dryingPower / 1000) * f.dryingTime;
      // Az electricityPrice mindig Ft/kWh-ban van tárolva
      const dryingCostHUF = dryingPowerConsumedKWh * electricityPrice;
      // Konvertáljuk EUR-ra (400 Ft = 1 EUR)
      const dryingCostEUR = dryingCostHUF / 400;
      totalDryingCostEUR += dryingCostEUR;
    }
  });
  // Konvertáljuk az offer pénznemére és kerekítjük
  const dryingCost = Math.round(convertCurrencyFromTo(totalDryingCostEUR, "EUR", offer.currency || "EUR") * 100) / 100;

  // Használati költség (kopás) és kerekítjük
  const usageCost = Math.round(convertCurrencyFromTo(printer.usageCost * totalPrintTimeHours, "EUR", offer.currency || "EUR") * 100) / 100;

  // Összes költség és kerekítjük
  const totalCost = Math.round((filamentCost + electricityCost + dryingCost + usageCost) * 100) / 100;

  const costs: OfferCosts = {
    filamentCost,
    electricityCost,
    dryingCost,
    usageCost,
    totalCost,
    calculations: {
      filamentCostEUR: totalFilamentCostEUR,
      electricityCostEUR,
      dryingCostEUR: totalDryingCostEUR,
      usageCostEUR: printer.usageCost * totalPrintTimeHours,
    },
  };
  logWithLanguage(settings.language, "debug", "offerCalc.costsCalculated", {
    offerId: offer.id,
    printerName: printer.name,
    costs,
  });
  return costs;
}

