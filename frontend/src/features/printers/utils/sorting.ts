/**
 * Printers sorting utilities
 * Printer rendezési utility függvények
 */

import type { Printer } from "../../../types";

/**
 * Printer rendezése konfiguráció alapján
 */
export function sortPrinters(
  printers: Printer[],
  sortColumn: keyof Printer | null,
  sortDirection: "asc" | "desc"
): Printer[] {
  if (!sortColumn) return printers;

  const sorted = [...printers].sort((a: Printer, b: Printer) => {
    let aValue: any = a[sortColumn];
    let bValue: any = b[sortColumn];

    // Szöveges értékek esetén
    if (typeof aValue === "string" && typeof bValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    let cmp = 0;

    // Számértékek esetén
    if (typeof aValue === "number" && typeof bValue === "number") {
      cmp = aValue - bValue;
    } else if (aValue < bValue) {
      cmp = -1;
    } else if (aValue > bValue) {
      cmp = 1;
    }

    return sortDirection === "asc" ? cmp : -cmp;
  });

  return sorted;
}

