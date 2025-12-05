/**
 * Offers Feature Types
 * Offer feature specifikus típusok
 */

import type { Offer, OfferStatus, Settings } from "../../types";

// Exportáljuk az Offer típusokat a feature modulból
export type { Offer, OfferStatus };

// Offer szűrési opciók
export interface OfferFilterOptions {
  searchTerm?: string;
  status?: OfferStatus[];
  customerId?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Offer rendezési konfiguráció
export interface OfferSortConfig {
  column: keyof Offer;
  direction: "asc" | "desc";
}

// Exportáljuk a Settings típust is
export type { Settings };

