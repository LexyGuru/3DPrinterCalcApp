import type { Offer, Printer, Settings } from "../types";
import { convertCurrencyFromTo } from "./currency";

export interface OfferCosts {
  filamentCost: number;
  electricityCost: number;
  dryingCost: number;
  usageCost: number;
  totalCost: number;
}

export function calculateOfferCosts(
  offer: Offer,
  printer: Printer | null,
  settings: Settings
): OfferCosts | null {
  if (!printer) return null;

  const totalPrintTimeHours = offer.totalPrintTimeHours;

  // Filament költségek (összes filament)
  let totalFilamentCostEUR = 0;
  offer.filaments.forEach(f => {
    // A filament ár EUR-ban van, konvertáljuk a jelenlegi pénznemre
    const filamentCostEUR = (f.usedGrams / 1000) * f.pricePerKg;
    totalFilamentCostEUR += filamentCostEUR;
  });
  const filamentCost = convertCurrencyFromTo(totalFilamentCostEUR, "EUR", offer.currency || "EUR");

  // Áram költség: nyomtató + AMS-ek
  let totalPowerW = printer.power;
  if (printer.ams && printer.ams.length > 0) {
    totalPowerW += printer.ams.reduce((sum, ams) => sum + ams.power, 0);
  }
  const powerConsumedKWh = (totalPowerW / 1000) * totalPrintTimeHours;
  // Az electricityPrice mindig Ft/kWh-ban van tárolva
  const electricityPrice = settings.electricityPrice || 0;
  if (electricityPrice <= 0) {
    console.warn("⚠️ Áram ár nincs beállítva vagy 0:", electricityPrice);
  }
  const electricityCostHUF = powerConsumedKWh * electricityPrice;
  // Konvertáljuk EUR-ra (400 Ft = 1 EUR), majd az offer pénznemére
  const electricityCostEUR = electricityCostHUF / 400;
  const electricityCost = convertCurrencyFromTo(electricityCostEUR, "EUR", offer.currency || "EUR");

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
  // Konvertáljuk az offer pénznemére
  const dryingCost = convertCurrencyFromTo(totalDryingCostEUR, "EUR", offer.currency || "EUR");

  // Használati költség (kopás)
  const usageCost = convertCurrencyFromTo(printer.usageCost * totalPrintTimeHours, "EUR", offer.currency || "EUR");

  // Összes költség
  const totalCost = filamentCost + electricityCost + dryingCost + usageCost;

  return {
    filamentCost,
    electricityCost,
    dryingCost,
    usageCost,
    totalCost,
  };
}

