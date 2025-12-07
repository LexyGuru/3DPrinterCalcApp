/**
 * Home statistics utilities
 * Statisztika számítás utility függvények
 */

import type { Offer } from "../../../types";
import { getOfferFinancials } from "./financials";

export type Statistics = {
  totalFilamentUsed: number;
  totalRevenue: number;
  totalElectricityConsumed: number;
  totalCosts: number;
  totalProfit: number;
  totalPrintTime: number;
  offerCount: number;
};

/**
 * Statisztikák számítása árajánlatokból
 */
export function calculateStatistics(
  offers: Offer[],
  electricityPrice: number
): Statistics {
  // Szűrjük az árajánlatokat, amelyeknek nincs costs objektuma
  const validOffers = offers.filter((offer) => offer.costs != null);

  if (validOffers.length === 0) {
    return {
      totalFilamentUsed: 0,
      totalRevenue: 0,
      totalElectricityConsumed: 0,
      totalCosts: 0,
      totalProfit: 0,
      totalPrintTime: 0,
      offerCount: 0,
    };
  }

  let totalFilamentUsed = 0;
  let totalRevenue = 0;
  let totalElectricityKWh = 0;
  let totalCosts = 0;
  let totalPrintTime = 0;
  let totalProfit = 0;

  validOffers.forEach((offer) => {
    offer.filaments.forEach((f) => {
      totalFilamentUsed += f.usedGrams;
    });

    const {
      revenueEUR,
      costsEUR,
      profitEUR,
      electricityCostEUR,
      dryingCostEUR,
    } = getOfferFinancials(offer);
    totalRevenue += revenueEUR;
    totalCosts += costsEUR;
    totalProfit += profitEUR;

    const electricityPriceHUF = electricityPrice || 70;
    if (electricityPriceHUF > 0) {
      const electricityCostHUF = electricityCostEUR * 400;
      const electricityKWh = electricityCostHUF / electricityPriceHUF;
      totalElectricityKWh += electricityKWh;

      const dryingCostHUF = dryingCostEUR * 400;
      const dryingKWh = dryingCostHUF / electricityPriceHUF;
      totalElectricityKWh += dryingKWh;
    }

    totalPrintTime += offer.totalPrintTimeHours;
  });

  return {
    totalFilamentUsed,
    totalRevenue,
    totalElectricityConsumed: totalElectricityKWh,
    totalCosts,
    totalProfit,
    totalPrintTime,
    offerCount: validOffers.length,
  };
}

