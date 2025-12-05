/**
 * Offers filtering utilities
 * Offer szűrési utility függvények
 */

import type { Offer, OfferStatus, Settings } from "../../../types";
import { convertCurrencyFromTo } from "../../../utils/currency";
import type { OfferFilterOptions } from "../types";

/**
 * Offer szűrése opciók alapján
 */
export function filterOffers(
  offers: Offer[],
  options: OfferFilterOptions & {
    statusFilter?: OfferStatus | "all";
    minAmountFilter?: string;
    maxAmountFilter?: string;
    fromDateFilter?: string;
    toDateFilter?: string;
    settings: Settings;
  }
): Offer[] {
  const {
    searchTerm,
    statusFilter = "all",
    minAmountFilter,
    maxAmountFilter,
    fromDateFilter,
    toDateFilter,
    settings,
  } = options;

  return offers.filter((o) => {
    // Ha nincs szűrő, minden árajánlatot visszaadunk
    if (
      !searchTerm &&
      statusFilter === "all" &&
      !minAmountFilter &&
      !maxAmountFilter &&
      !fromDateFilter &&
      !toDateFilter
    ) {
      return true;
    }

    // Keresési kifejezés szűrés
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const date = new Date(o.date).toLocaleDateString();
      const matchesSearch =
        o.printerName.toLowerCase().includes(term) ||
        o.printerType.toLowerCase().includes(term) ||
        (o.customerName && o.customerName.toLowerCase().includes(term)) ||
        date.includes(term) ||
        o.id.toString().includes(term);

      if (!matchesSearch) {
        return false;
      }
    }

    // Státusz szűrés
    if (statusFilter !== "all") {
      const currentStatus = o.status ?? "draft";
      if (currentStatus !== statusFilter) return false;
    }

    // Összeg szűrők
    if (minAmountFilter || maxAmountFilter) {
      const totalInDisplayCurrency = convertCurrencyFromTo(
        o.costs.totalCost,
        o.currency || "EUR",
        settings.currency
      );

      if (minAmountFilter) {
        const min = Number(minAmountFilter.replace(",", "."));
        if (!Number.isNaN(min) && totalInDisplayCurrency < min) return false;
      }

      if (maxAmountFilter) {
        const max = Number(maxAmountFilter.replace(",", "."));
        if (!Number.isNaN(max) && totalInDisplayCurrency > max) return false;
      }
    }

    // Dátum szűrők
    const offerDate = new Date(o.date);
    if (!Number.isNaN(offerDate.getTime())) {
      if (fromDateFilter) {
        const from = new Date(fromDateFilter);
        if (!Number.isNaN(from.getTime()) && offerDate < from) return false;
      }
      if (toDateFilter) {
        const to = new Date(toDateFilter);
        if (!Number.isNaN(to.getTime()) && offerDate > to) return false;
      }
    }

    return true;
  });
}

