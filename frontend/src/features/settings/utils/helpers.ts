/**
 * Settings helper utilities
 * Segédfüggvények
 */

import type { Settings } from "../../../types";

/**
 * Alap nyelv feloldása (csak a 3 alapnyelv támogatott: hu, en, de)
 */
export function resolveBaseLanguage(
  language: Settings["language"]
): "hu" | "en" | "de" {
  // Csak a három alap nyelvet támogatjuk a témákhoz, a többi nyelv esetén angol lesz a fallback
  return language === "hu" || language === "de" ? language : "en";
}

