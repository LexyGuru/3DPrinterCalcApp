/**
 * Calculator calculations utility
 * Számítási függvények a Calculator feature-hez
 */

import type { CalculationInputs, CalculationResult, SelectedFilament } from "../types";
import type { Printer, AMS } from "../../../types";
import { convertCurrency } from "../../../utils/currency";

/**
 * Összes számítás végrehajtása
 */
export function calculateCosts(inputs: CalculationInputs): CalculationResult | null {
  const { printer, selectedFilaments, printTimeHours, printTimeMinutes, printTimeSeconds, settings, filaments } = inputs;

  // Ellenőrizzük hogy minden filament rendelkezik mennyiséggel
  if (selectedFilaments.some(sf => sf.filamentIndex < 0 || sf.usedGrams <= 0)) {
    return null;
  }

  const totalPrintTimeHours = printTimeHours + (printTimeMinutes / 60) + (printTimeSeconds / 3600);
  
  if (totalPrintTimeHours <= 0) {
    return null;
  }

  // Filament költségek (összes kiválasztott filament)
  let totalFilamentCostEUR = 0;
  selectedFilaments.forEach(sf => {
    const filament = filaments[sf.filamentIndex];
    if (filament) {
      totalFilamentCostEUR += (sf.usedGrams / 1000) * filament.pricePerKg;
    }
  });
  // Kerekítjük a lebegőpontos precíziós hibák elkerülésére
  const filamentCost = Math.round(convertCurrency(totalFilamentCostEUR, settings.currency) * 100) / 100;

  // Áram költség: nyomtató + AMS-ek
  const electricityCost = calculateElectricityCost(printer, totalPrintTimeHours, settings);

  // Szárítás költség minden filamentnél külön
  const totalDryingCost = calculateDryingCost(selectedFilaments, settings);

  // Használati költség (kopás) és kerekítjük
  const usageCost = Math.round(convertCurrency(printer.usageCost * totalPrintTimeHours, settings.currency) * 100) / 100;

  // Összes költség és kerekítjük
  const totalCost = Math.round((filamentCost + electricityCost + totalDryingCost + usageCost) * 100) / 100;

  return {
    filamentCost,
    electricityCost,
    totalDryingCost,
    usageCost,
    totalCost,
  };
}

/**
 * Áram költség számítása
 */
export function calculateElectricityCost(
  printer: Printer,
  totalPrintTimeHours: number,
  settings: { electricityPrice: number; currency: import("../../../types").Currency }
): number {
  let totalPowerW = printer.power;
  if (printer.ams && printer.ams.length > 0) {
    totalPowerW += printer.ams.reduce((sum: number, ams: AMS) => sum + ams.power, 0);
  }
  
  const powerConsumedKWh = (totalPowerW / 1000) * totalPrintTimeHours;
  const electricityPrice = settings.electricityPrice || 0;
  
  if (electricityPrice <= 0) {
    if (import.meta.env.DEV) {
      console.warn("⚠️ Áram ár nincs beállítva vagy 0:", electricityPrice, "- Kérlek állíts be egy érvényes áramárat a Beállításokban!");
    }
  }
  
  const electricityCostHUF = powerConsumedKWh * electricityPrice;
  // Konvertáljuk EUR-ra (400 Ft = 1 EUR), majd a választott pénznemre
  const electricityCostEUR = electricityCostHUF / 400;
  // Kerekítjük a lebegőpontos precíziós hibák elkerülésére
  return Math.round(convertCurrency(electricityCostEUR, settings.currency) * 100) / 100;
}

/**
 * Szárítás költség számítása
 */
export function calculateDryingCost(
  selectedFilaments: SelectedFilament[],
  settings: { electricityPrice: number; currency: import("../../../types").Currency }
): number {
  let totalDryingCostEUR = 0;
  const electricityPrice = settings.electricityPrice || 0;

  selectedFilaments.forEach((sf) => {
    if (sf.needsDrying && sf.dryingTime && sf.dryingTime > 0 && sf.dryingPower && sf.dryingPower > 0) {
      // Szárítás teljesítmény felhasználás kWh-ban
      const dryingPowerConsumedKWh = (sf.dryingPower / 1000) * sf.dryingTime;
      // Az electricityPrice mindig Ft/kWh-ban van tárolva
      const dryingCostHUF = dryingPowerConsumedKWh * electricityPrice;
      // Konvertáljuk EUR-ra (400 Ft = 1 EUR)
      const dryingCostEUR = dryingCostHUF / 400;
      totalDryingCostEUR += dryingCostEUR;
    }
  });
  
  // Konvertáljuk a választott pénznemre és kerekítjük
  return Math.round(convertCurrency(totalDryingCostEUR, settings.currency) * 100) / 100;
}

/**
 * Nyomtatási idő órákban
 */
export function calculatePrintTimeHours(hours: number, minutes: number, seconds: number): number {
  return hours + (minutes / 60) + (seconds / 3600);
}

/**
 * Profit számítása
 */
export function calculateProfit(totalCost: number, profitPercentage: number): number {
  return Math.round((totalCost * profitPercentage / 100) * 100) / 100;
}

/**
 * Végösszeg számítása (költség + profit)
 */
export function calculateFinalPrice(totalCost: number, profitPercentage: number): number {
  const profit = calculateProfit(totalCost, profitPercentage);
  return Math.round((totalCost + profit) * 100) / 100;
}

