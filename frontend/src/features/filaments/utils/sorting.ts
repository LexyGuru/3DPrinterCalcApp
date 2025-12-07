/**
 * Filaments sorting utilities
 * Filament rendezési utility függvények
 */

import type { Filament } from "../types";
import type { FilamentSortConfig } from "../types";

/**
 * Filament rendezése konfiguráció alapján
 */
export function sortFilaments(
  filaments: Filament[],
  sortConfig: FilamentSortConfig[]
): Filament[] {
  if (sortConfig.length === 0) return filaments;

  const sorted = [...filaments].sort((a: Filament, b: Filament) => {
    for (const { column, direction } of sortConfig) {
      let aValue: any = a[column];
      let bValue: any = b[column];

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

      if (cmp !== 0) {
        return direction === "asc" ? cmp : -cmp;
      }
    }
    return 0;
  });

  return sorted;
}

