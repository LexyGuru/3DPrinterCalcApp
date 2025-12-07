/**
 * Printers filtering utilities
 * Printer szűrési utility függvények
 */

import type { Printer } from "../../../types";
import type { PrinterFilterOptions } from "../types";

/**
 * Printer szűrése opciók alapján
 */
export function filterPrinters(
  printers: Printer[],
  options: PrinterFilterOptions
): Printer[] {
  return printers.filter((p) => {
    // Keresési kifejezés szűrés
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      return (
        p.name.toLowerCase().includes(term) ||
        p.type.toLowerCase().includes(term)
      );
    }

    return true;
  });
}

