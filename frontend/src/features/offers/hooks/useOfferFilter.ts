/**
 * useOfferFilter hook
 * Offer szűrési logika hook
 */

import { useState, useMemo } from "react";
import type { Offer, OfferStatus, Settings } from "../../../types";
import { filterOffers } from "../utils/filtering";
import type { OfferSortConfigItem } from "../utils/sorting";
import { sortOffers } from "../utils/sorting";

interface UseOfferFilterParams {
  offers: Offer[];
  settings: Settings;
  initialSearchTerm?: string;
  initialStatusFilter?: OfferStatus | "all";
  initialSortConfig?: OfferSortConfigItem[];
}

/**
 * Hook offer szűréséhez és rendezéséhez
 */
export function useOfferFilter({
  offers,
  settings,
  initialSearchTerm = "",
  initialStatusFilter = "all",
  initialSortConfig = [],
}: UseOfferFilterParams) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState<OfferStatus | "all">(
    initialStatusFilter
  );
  const [minAmountFilter, setMinAmountFilter] = useState<string>("");
  const [maxAmountFilter, setMaxAmountFilter] = useState<string>("");
  const [fromDateFilter, setFromDateFilter] = useState<string>("");
  const [toDateFilter, setToDateFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<OfferSortConfigItem[]>(
    initialSortConfig
  );

  // Szűrés
  const filteredOffers = useMemo(() => {
    return filterOffers(offers, {
      searchTerm: searchTerm,
      statusFilter: statusFilter,
      minAmountFilter: minAmountFilter,
      maxAmountFilter: maxAmountFilter,
      fromDateFilter: fromDateFilter,
      toDateFilter: toDateFilter,
      settings: settings,
    });
  }, [
    offers,
    searchTerm,
    statusFilter,
    minAmountFilter,
    maxAmountFilter,
    fromDateFilter,
    toDateFilter,
    settings,
  ]);

  // Rendezés
  const sortedOffers = useMemo(() => {
    return sortOffers(filteredOffers, sortConfig);
  }, [filteredOffers, sortConfig]);

  return {
    // State
    searchTerm,
    statusFilter,
    minAmountFilter,
    maxAmountFilter,
    fromDateFilter,
    toDateFilter,
    sortConfig,

    // Setters
    setSearchTerm,
    setStatusFilter,
    setMinAmountFilter,
    setMaxAmountFilter,
    setFromDateFilter,
    setToDateFilter,
    setSortConfig,

    // Results
    filteredOffers,
    sortedOffers,
  };
}

