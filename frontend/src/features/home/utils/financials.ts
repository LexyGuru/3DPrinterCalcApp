/**
 * Home financials utilities
 * Pénzügyi számítások utility függvények
 */

import type { Offer } from "../../../types";
import { convertCurrencyFromTo } from "../../../utils/currency";

export type OfferFinancials = {
  revenueEUR: number;
  costsEUR: number;
  profitEUR: number;
  electricityCostEUR: number;
  dryingCostEUR: number;
};

/**
 * Árajánlat pénzügyi adatainak kinyerése
 */
export function getOfferFinancials(offer: Offer): OfferFinancials {
  // Védelem: ha nincs costs objektum, visszaadunk null értékeket
  if (!offer.costs) {
    console.warn(
      `[Home] Offer ${offer.id} has no costs object, skipping financial calculations`
    );
    return {
      revenueEUR: 0,
      costsEUR: 0,
      profitEUR: 0,
      electricityCostEUR: 0,
      dryingCostEUR: 0,
    };
  }

  const filamentCostEUR = convertCurrencyFromTo(
    offer.costs.filamentCost,
    offer.currency,
    "EUR"
  );
  const electricityCostEUR = convertCurrencyFromTo(
    offer.costs.electricityCost,
    offer.currency,
    "EUR"
  );
  const dryingCostEUR = convertCurrencyFromTo(
    offer.costs.dryingCost,
    offer.currency,
    "EUR"
  );
  const usageCostEUR = convertCurrencyFromTo(
    offer.costs.usageCost,
    offer.currency,
    "EUR"
  );

  const totalCostsEUR =
    filamentCostEUR + electricityCostEUR + dryingCostEUR + usageCostEUR;

  // Bevétel csak akkor, ha completed ÉS paid (vagy nincs paymentStatus, akkor paid-nek számít)
  let revenueEUR = 0;
  if (offer.status === "completed") {
    const paymentStatus = offer.paymentStatus || "paid";
    if (paymentStatus === "paid") {
      const profitPercentage = offer.profitPercentage ?? 30;
      const revenueInOfferCurrency =
        offer.costs.totalCost * (1 + profitPercentage / 100);
      revenueEUR = convertCurrencyFromTo(
        revenueInOfferCurrency,
        offer.currency,
        "EUR"
      );
    }
  } else {
    // Ha nincs completed státusz, akkor is számoljuk (régi viselkedés kompatibilitás miatt)
    const profitPercentage = offer.profitPercentage ?? 30;
    const revenueInOfferCurrency =
      offer.costs.totalCost * (1 + profitPercentage / 100);
    revenueEUR = convertCurrencyFromTo(
      revenueInOfferCurrency,
      offer.currency,
      "EUR"
    );
  }

  const profitEUR = revenueEUR - totalCostsEUR;

  return {
    revenueEUR,
    costsEUR: totalCostsEUR,
    profitEUR,
    electricityCostEUR,
    dryingCostEUR,
  };
}

