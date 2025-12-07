/**
 * Filaments filtering utilities
 * Filament szűrési utility függvények
 */

import type { Filament } from "../types";
import type { FilamentFilterOptions } from "../types";

/**
 * Filament szűrése opciók alapján
 */
export function filterFilaments(
  filaments: Filament[],
  options: FilamentFilterOptions
): Filament[] {
  return filaments.filter((f) => {
    // Kedvenc szűrés
    if (options.favoritesOnly && !f.favorite) return false;

    // Oszlop szűrők: márka / típus / szín
    if (options.brand && options.brand !== "all" && f.brand !== options.brand)
      return false;
    if (options.type && options.type !== "all" && f.type !== options.type)
      return false;
    if (options.color && options.color !== "all") {
      const colorName = (f.color || "").toLowerCase();
      const hex = (f.colorHex || "").toLowerCase();
      const filterValue = options.color.toLowerCase();
      if (!colorName.includes(filterValue) && !hex.includes(filterValue)) {
        return false;
      }
    }

    // Keresési kifejezés szűrés
    if (options.searchTerm) {
      const term = options.searchTerm.toLowerCase();
      return (
        f.brand.toLowerCase().includes(term) ||
        f.type.toLowerCase().includes(term) ||
        (f.color && f.color.toLowerCase().includes(term)) ||
        (f.colorHex && f.colorHex.toLowerCase().includes(term))
      );
    }

    return true;
  });
}

/**
 * Egyedi márka opciók kinyerése
 */
export function getUniqueBrands(filaments: Filament[]): string[] {
  const set = new Set<string>();
  filaments.forEach((f) => {
    if (f.brand) set.add(f.brand);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Egyedi típus opciók kinyerése
 */
export function getUniqueTypes(filaments: Filament[]): string[] {
  const set = new Set<string>();
  filaments.forEach((f) => {
    if (f.type) set.add(f.type);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

/**
 * Egyedi szín opciók kinyerése
 */
export function getUniqueColors(filaments: Filament[]): string[] {
  const set = new Set<string>();
  filaments.forEach((f) => {
    if (f.color) set.add(f.color);
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
}

