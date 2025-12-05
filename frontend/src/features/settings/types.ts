/**
 * Settings Feature Types
 * Settings feature specifikus típusok
 */

import type {
  Settings,
  CompanyInfo,
  PdfTemplate,
  AnimationSettings,
  ThemeSettings,
  CustomThemeDefinition,
} from "../../types";

// Exportáljuk a Settings típusokat a feature modulból
export type {
  Settings,
  CompanyInfo,
  PdfTemplate,
  AnimationSettings,
  ThemeSettings,
  CustomThemeDefinition,
};

// Settings modul konstansok
export const CUSTOM_THEME_PREFIX = "custom:";

