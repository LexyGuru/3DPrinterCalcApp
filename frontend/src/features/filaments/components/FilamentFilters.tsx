/**
 * FilamentFilters Component
 * Szűrők komponens (brand, type, color) a Filaments feature-hez
 */

import React from "react";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";

interface FilamentFiltersProps {
  brandFilter: string;
  typeFilter: string;
  colorFilter: string;
  onBrandFilterChange: (brand: string) => void;
  onTypeFilterChange: (type: string) => void;
  onColorFilterChange: (color: string) => void;
  brandOptions: string[];
  typeOptions: string[];
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
}

/**
 * Filament filters komponens
 */
export const FilamentFilters: React.FC<FilamentFiltersProps> = ({
  brandFilter,
  typeFilter,
  colorFilter,
  onBrandFilterChange,
  onTypeFilterChange,
  onColorFilterChange,
  brandOptions,
  typeOptions,
  theme,
  themeStyles,
  settings,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div
      style={{
        marginBottom: "16px",
        display: "flex",
        flexWrap: "wrap",
        gap: "12px",
        alignItems: "flex-end",
      }}
    >
      <div style={{ minWidth: "180px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("filaments.brand")}
        </label>
        <select
          value={brandFilter}
          onChange={(e) => onBrandFilterChange(e.target.value)}
          onFocus={(e) =>
            Object.assign(e.target.style, themeStyles.inputFocus)
          }
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{
            ...themeStyles.input,
            padding: "6px 10px",
            fontSize: "13px",
            width: "100%",
          }}
        >
          <option value="all">{t("common.all")}</option>
          {brandOptions.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>
      <div style={{ minWidth: "180px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("filaments.type")}
        </label>
        <select
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
          onFocus={(e) =>
            Object.assign(e.target.style, themeStyles.inputFocus)
          }
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{
            ...themeStyles.input,
            padding: "6px 10px",
            fontSize: "13px",
            width: "100%",
          }}
        >
          <option value="all">{t("common.all")}</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>
      <div style={{ minWidth: "180px" }}>
        <label
          style={{
            display: "block",
            marginBottom: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("filaments.color")}
        </label>
        <input
          type="text"
          value={colorFilter === "all" ? "" : colorFilter}
          onChange={(e) => onColorFilterChange(e.target.value || "all")}
          placeholder={t("filaments.color")}
          onFocus={(e) =>
            Object.assign(e.target.style, themeStyles.inputFocus)
          }
          onBlur={(e) => {
            e.target.style.borderColor = theme.colors.inputBorder;
            e.target.style.boxShadow = "none";
          }}
          style={{
            ...themeStyles.input,
            padding: "6px 10px",
            fontSize: "13px",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
};

