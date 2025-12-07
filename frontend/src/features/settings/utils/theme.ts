/**
 * Settings theme utilities
 * Téma kezelés utility függvények
 */

import type { CustomThemeDefinition } from "../types";
import { clampNumber, normalizeColorInput } from "./validation";

/**
 * Custom téma definíció sanitizálása
 */
export function sanitizeCustomThemeDefinition(
  draft: CustomThemeDefinition
): CustomThemeDefinition {
  const cleanedPalette = {
    background: normalizeColorInput(draft.palette.background, "#1f2933"),
    surface: normalizeColorInput(draft.palette.surface, "#27323f"),
    primary: normalizeColorInput(draft.palette.primary, "#4f46e5"),
    secondary: normalizeColorInput(draft.palette.secondary, "#0ea5e9"),
    success: normalizeColorInput(draft.palette.success, "#22c55e"),
    danger: normalizeColorInput(draft.palette.danger, "#ef4444"),
    text: normalizeColorInput(draft.palette.text, "#f8fafc"),
    textMuted: normalizeColorInput(
      draft.palette.textMuted,
      normalizeColorInput(draft.palette.text, "#f8fafc")
    ),
  };
  const sanitized: CustomThemeDefinition = {
    ...draft,
    name: draft.name.trim() || "Custom theme",
    description: draft.description?.trim() || undefined,
    palette: cleanedPalette,
    gradient: draft.gradient
      ? {
          start: normalizeColorInput(
            draft.gradient.start,
            cleanedPalette.primary
          ),
          end: normalizeColorInput(draft.gradient.end, cleanedPalette.secondary),
          angle: clampNumber(
            typeof draft.gradient.angle === "number"
              ? draft.gradient.angle
              : 135,
            0,
            360
          ),
        }
      : undefined,
  };
  return sanitized;
}

