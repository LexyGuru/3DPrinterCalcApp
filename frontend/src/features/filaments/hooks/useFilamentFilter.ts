/**
 * useFilamentFilter hook
 * Filament szűrés kezelés hook
 */

import { useState, useMemo, useCallback } from "react";
import type { Filament } from "../types";
import type { FilamentFilterOptions } from "../types";
import { filterFilaments, getUniqueBrands, getUniqueTypes, getUniqueColors } from "../utils/filtering";

interface UseFilamentFilterParams {
  filaments: Filament[];
}

/**
 * Hook filament szűrés kezeléséhez
 */
export function useFilamentFilter({ filaments }: UseFilamentFilterParams) {
  const [filterOptions, setFilterOptions] = useState<FilamentFilterOptions>({
    brand: "all",
    type: "all",
    color: "all",
    searchTerm: "",
    favoritesOnly: false,
  });

  // Szűrt filamentek
  const filteredFilaments = useMemo(() => {
    return filterFilaments(filaments, filterOptions);
  }, [filaments, filterOptions]);

  // Opciók az egyedi értékekhez
  const brandOptions = useMemo(() => {
    return getUniqueBrands(filaments);
  }, [filaments]);

  const typeOptions = useMemo(() => {
    return getUniqueTypes(filaments);
  }, [filaments]);

  const colorOptions = useMemo(() => {
    return getUniqueColors(filaments);
  }, [filaments]);

  // Szűrő beállítások
  const setBrandFilter = useCallback((brand: string) => {
    setFilterOptions((prev) => ({ ...prev, brand }));
  }, []);

  const setTypeFilter = useCallback((type: string) => {
    setFilterOptions((prev) => ({ ...prev, type }));
  }, []);

  const setColorFilter = useCallback((color: string) => {
    setFilterOptions((prev) => ({ ...prev, color }));
  }, []);

  const setSearchTerm = useCallback((searchTerm: string) => {
    setFilterOptions((prev) => ({ ...prev, searchTerm }));
  }, []);

  const setFavoritesOnly = useCallback((favoritesOnly: boolean) => {
    setFilterOptions((prev) => ({ ...prev, favoritesOnly }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions({
      brand: "all",
      type: "all",
      color: "all",
      searchTerm: "",
      favoritesOnly: false,
    });
  }, []);

  return {
    filteredFilaments,
    filterOptions,
    brandOptions,
    typeOptions,
    colorOptions,
    setBrandFilter,
    setTypeFilter,
    setColorFilter,
    setSearchTerm,
    setFavoritesOnly,
    resetFilters,
  };
}

