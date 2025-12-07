/**
 * Settings library utilities
 * Library kezelés utility függvények
 */

import type { RawLibraryEntry } from "../../../utils/filamentLibrary";
import { normalizeForCompare } from "./validation";

/**
 * Library bejegyzések rendezése
 */
export function sortLibraryEntries(entries: RawLibraryEntry[]): RawLibraryEntry[] {
  return entries
    .slice()
    .sort((a, b) => {
      const brandCompare = normalizeForCompare(a.manufacturer).localeCompare(
        normalizeForCompare(b.manufacturer),
        "hu",
        { sensitivity: "base" }
      );
      if (brandCompare !== 0) return brandCompare;
      const materialCompare = normalizeForCompare(a.material).localeCompare(
        normalizeForCompare(b.material),
        "hu",
        { sensitivity: "base" }
      );
      if (materialCompare !== 0) return materialCompare;
      const colorCompare = normalizeForCompare(a.color || a.name).localeCompare(
        normalizeForCompare(b.color || b.name),
        "hu",
        { sensitivity: "base" }
      );
      if (colorCompare !== 0) return colorCompare;
      return normalizeForCompare(a.id).localeCompare(
        normalizeForCompare(b.id),
        "en",
        { sensitivity: "base" }
      );
    });
}

