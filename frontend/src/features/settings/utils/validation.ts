/**
 * Settings validation utilities
 * Validációs utility függvények
 */

/**
 * Szám érték korlátozása min és max közé
 */
export function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Szín input normalizálása
 */
export function normalizeColorInput(value: string, fallback: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return fallback;
  const prefixed = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  if (/^#([0-9A-Fa-f]{6})$/.test(prefixed)) {
    return prefixed.toUpperCase();
  }
  if (/^#([0-9A-Fa-f]{3})$/.test(prefixed)) {
    const [, shortHex] = prefixed.match(/^#([0-9A-Fa-f]{3})$/) ?? [];
    if (shortHex) {
      const expanded = shortHex
        .split("")
        .map((char) => char + char)
        .join("")
        .toUpperCase();
      return `#${expanded}`;
    }
  }
  return fallback;
}

/**
 * Hex input sanitizálása
 */
export function sanitizeHexInput(value: string): string {
  const stripped = value.replace(/[^0-9a-fA-F]/g, "").slice(0, 6).toUpperCase();
  return stripped ? `#${stripped}` : "";
}

/**
 * Összehasonlításhoz normalizálás
 */
export function normalizeForCompare(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

