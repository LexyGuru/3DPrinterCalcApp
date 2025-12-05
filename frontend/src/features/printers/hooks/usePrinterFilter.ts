/**
 * usePrinterFilter hook
 * Printer szűrés kezelés hook
 */

import { useState, useMemo, useCallback } from "react";
import type { Printer } from "../../../types";
import type { PrinterFilterOptions } from "../types";
import { filterPrinters } from "../utils/filtering";

interface UsePrinterFilterParams {
  printers: Printer[];
}

/**
 * Hook printer szűrés kezeléséhez
 */
export function usePrinterFilter({ printers }: UsePrinterFilterParams) {
  const [filterOptions, setFilterOptions] = useState<PrinterFilterOptions>({
    searchTerm: "",
  });

  // Szűrt printerek
  const filteredPrinters = useMemo(() => {
    return filterPrinters(printers, filterOptions);
  }, [printers, filterOptions]);

  // Szűrő beállítások
  const setSearchTerm = useCallback((searchTerm: string) => {
    setFilterOptions((prev) => ({ ...prev, searchTerm }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilterOptions({
      searchTerm: "",
    });
  }, []);

  return {
    filteredPrinters,
    filterOptions,
    setSearchTerm,
    resetFilters,
  };
}

