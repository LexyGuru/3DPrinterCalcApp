/**
 * Offers sorting utilities
 * Offer rendezési utility függvények
 */

import type { Offer, OfferStatus } from "../../../types";

const STATUS_ORDER: OfferStatus[] = ["draft", "sent", "accepted", "rejected", "completed"];

export type OfferSortKey = "date" | "amount" | "status" | "customer" | "id";

export interface OfferSortConfigItem {
  key: OfferSortKey;
  direction: "asc" | "desc";
}

/**
 * Státusz index meghatározása a rendezéshez
 */
function getStatusIndex(status: OfferStatus | undefined | null): number {
  if (!status) return STATUS_ORDER.length;
  const idx = STATUS_ORDER.indexOf(status);
  return idx === -1 ? STATUS_ORDER.length : idx;
}

/**
 * Offer rendezése konfiguráció alapján
 */
export function sortOffers(
  offers: Offer[],
  sortConfig: OfferSortConfigItem[]
): Offer[] {
  if (sortConfig.length === 0) return offers;

  return [...offers].sort((a, b) => {
    for (const { key, direction } of sortConfig) {
      let aValue: any;
      let bValue: any;

      switch (key) {
        case "date":
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case "amount":
          aValue = a.costs?.totalCost ?? 0;
          bValue = b.costs?.totalCost ?? 0;
          break;
        case "status":
          aValue = getStatusIndex(a.status ?? "draft");
          bValue = getStatusIndex(b.status ?? "draft");
          break;
        case "customer":
          aValue = (a.customerName || "").toLowerCase();
          bValue = (b.customerName || "").toLowerCase();
          break;
        case "id":
        default:
          aValue = a.id;
          bValue = b.id;
          break;
      }

      let cmp = 0;
      if (typeof aValue === "number" && typeof bValue === "number") {
        cmp = aValue - bValue;
      } else if (typeof aValue === "string" && typeof bValue === "string") {
        if (aValue < bValue) cmp = -1;
        else if (aValue > bValue) cmp = 1;
        else cmp = 0;
      } else {
        // Vegyes típusok esetén stringgé alakítjuk
        const aStr = String(aValue);
        const bStr = String(bValue);
        if (aStr < bStr) cmp = -1;
        else if (aStr > bStr) cmp = 1;
        else cmp = 0;
      }

      if (cmp !== 0) {
        return direction === "asc" ? cmp : -cmp;
      }
    }

    return 0;
  });
}

