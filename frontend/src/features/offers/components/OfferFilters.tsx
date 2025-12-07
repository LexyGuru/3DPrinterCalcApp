/**
 * OfferFilters Component
 * Szűrők (összeg, dátum) az Offers feature-hez
 */

import React from "react";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation, type TranslationKey } from "../../../utils/translations";

interface OfferFiltersProps {
  minAmountFilter: string;
  maxAmountFilter: string;
  fromDateFilter: string;
  toDateFilter: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  theme: import("../../../utils/themes").Theme;
}

/**
 * Offer filters komponens
 */
export const OfferFilters: React.FC<OfferFiltersProps> = ({
  minAmountFilter,
  maxAmountFilter,
  fromDateFilter,
  toDateFilter,
  onMinAmountChange,
  onMaxAmountChange,
  onFromDateChange,
  onToDateChange,
  themeStyles,
  settings,
  theme,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
      {/* Összeg szűrők */}
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("offers.filters.minAmount" as TranslationKey)}
        </label>
        <input
          type="number"
          value={minAmountFilter}
          onChange={(e) => onMinAmountChange(e.target.value)}
          style={{
            ...themeStyles.input,
            padding: "8px 12px",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("offers.filters.maxAmount" as TranslationKey)}
        </label>
        <input
          type="number"
          value={maxAmountFilter}
          onChange={(e) => onMaxAmountChange(e.target.value)}
          style={{
            ...themeStyles.input,
            padding: "8px 12px",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("offers.filters.fromDate" as TranslationKey)}
        </label>
        <input
          type="date"
          value={fromDateFilter}
          onChange={(e) => onFromDateChange(e.target.value)}
          style={{
            ...themeStyles.input,
            padding: "8px 12px",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div>
        <label
          style={{
            display: "block",
            marginBottom: "6px",
            fontSize: "12px",
            fontWeight: 600,
            color: theme.colors.textMuted,
          }}
        >
          {t("offers.filters.toDate" as TranslationKey)}
        </label>
        <input
          type="date"
          value={toDateFilter}
          onChange={(e) => onToDateChange(e.target.value)}
          style={{
            ...themeStyles.input,
            padding: "8px 12px",
            fontSize: "13px",
            width: "100%",
            boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
};

