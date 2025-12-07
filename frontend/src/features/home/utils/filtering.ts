/**
 * Home filtering utilities
 * Időszak alapú szűrés utility függvények
 */

import type { Offer } from "../../../types";

export type PeriodFilter = "all" | "week" | "month" | "year";

/**
 * Árajánlatok szűrése időszak szerint
 */
export function filterOffersByPeriod(
  offers: Offer[],
  period: PeriodFilter
): Offer[] {
  if (period === "all") return offers;

  const now = new Date();
  // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
  now.setHours(0, 0, 0, 0);
  const cutoffDate = new Date();
  cutoffDate.setHours(0, 0, 0, 0);

  switch (period) {
    case "week":
      // Utolsó 7 nap (ma is beleszámít)
      cutoffDate.setDate(now.getDate() - 6);
      break;
    case "month":
      // Utolsó 30 nap (ma is beleszámít)
      cutoffDate.setDate(now.getDate() - 29);
      break;
    case "year":
      // Utolsó 365 nap (ma is beleszámít)
      cutoffDate.setDate(now.getDate() - 364);
      break;
  }

  return offers.filter((offer) => {
    const offerDate = new Date(offer.date);
    // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
    offerDate.setHours(0, 0, 0, 0);
    return offerDate >= cutoffDate && offerDate <= now;
  });
}

