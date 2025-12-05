/**
 * usePrinterSort hook
 * Printer rendezés kezelés hook
 */

import { useState, useMemo, useCallback } from "react";
import type { Printer } from "../../../types";
import type { PrinterSortConfig } from "../types";
import { sortPrinters } from "../utils/sorting";

interface UsePrinterSortParams {
  printers: Printer[];
}

/**
 * Hook printer rendezés kezeléséhez
 */
export function usePrinterSort({ printers }: UsePrinterSortParams) {
  const [sortConfig, setSortConfig] = useState<PrinterSortConfig | null>(null);

  // Rendezett printerek
  const sortedPrinters = useMemo(() => {
    if (!sortConfig) return printers;
    return sortPrinters(printers, sortConfig.column, sortConfig.direction);
  }, [printers, sortConfig]);

  // Rendezés beállítása
  const setSort = useCallback((column: keyof Printer, direction: "asc" | "desc" = "asc") => {
    setSortConfig({ column, direction });
  }, []);

  // Rendezés törlése
  const clearSort = useCallback(() => {
    setSortConfig(null);
  }, []);

  // Rendezés váltása (asc <-> desc)
  const toggleSort = useCallback((column: keyof Printer) => {
    setSortConfig((prev) => {
      if (prev?.column === column) {
        return {
          column,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { column, direction: "asc" };
    });
  }, []);

  return {
    sortedPrinters,
    sortConfig,
    setSort,
    clearSort,
    toggleSort,
  };
}

