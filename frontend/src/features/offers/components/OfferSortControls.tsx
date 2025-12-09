/**
 * OfferSortControls Component
 * Rendezési chip-ek az Offers feature-hez
 */

import React from "react";
import type { OfferSortKey, OfferSortConfigItem } from "../utils/sorting";
import { useTranslation } from "../../../utils/translations";
import type { Settings } from "../../../types";

interface OfferSortControlsProps {
  sortConfig: OfferSortConfigItem[];
  onSort: (key: OfferSortKey, event?: React.MouseEvent<HTMLButtonElement>) => void;
  theme: import("../../../utils/themes").Theme;
  settings: Settings;
}

/**
 * Offer sort controls komponens
 */
export const OfferSortControls: React.FC<OfferSortControlsProps> = ({
  sortConfig,
  onSort,
  theme,
  settings,
}) => {
  const t = useTranslation(settings.language);

  const renderSortChip = (label: string, key: OfferSortKey) => {
    const idx = sortConfig.findIndex((cfg) => cfg.key === key);
    const isActive = idx !== -1;
    const cfg = isActive ? sortConfig[idx] : null;
    const isPrimary = idx === 0;

    const baseStyle: React.CSSProperties = {
      padding: "6px 10px",
      borderRadius: "999px",
      border: `1px solid ${theme.colors.border}`,
      fontSize: "12px",
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      cursor: "pointer",
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      transition: "background-color 0.15s, color 0.15s, border-color 0.15s",
    };

    const activeStyle: React.CSSProperties = isActive
      ? {
          backgroundColor: theme.colors.primary + "15",
          borderColor: theme.colors.primary,
          color: theme.colors.primary,
        }
      : {};

    return (
      <button
        key={key}
        type="button"
        onClick={(e) => onSort(key, e)}
        style={{ ...baseStyle, ...activeStyle }}
      >
        <span>{label}</span>
        {isActive && cfg && (
          <>
            <span>{cfg.direction === "asc" ? "↑" : "↓"}</span>
            {!isPrimary && (
              <span
                style={{
                  fontSize: "10px",
                  padding: "0 4px",
                  borderRadius: "999px",
                  backgroundColor: theme.colors.surfaceHover,
                  color: theme.colors.textMuted,
                }}
              >
                {idx + 1}
              </span>
            )}
          </>
        )}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      <span
        style={{
          fontSize: "12px",
          fontWeight: 600,
          color: theme.colors.textMuted,
          marginRight: "4px",
        }}
      >
        {t("offers.sort.label") || "Rendezés:"}
      </span>
      {renderSortChip(t("offers.sort.date") || "Dátum", "date")}
      {renderSortChip(t("offers.sort.amount") || "Összeg", "amount")}
      {renderSortChip(t("offers.sort.status") || "Státusz", "status")}
      {renderSortChip(t("offers.sort.customer") || "Ügyfél", "customer")}
      {renderSortChip(t("offers.sort.id") || "ID", "id")}
      <span
        style={{
          fontSize: "11px",
          color: theme.colors.textMuted,
          fontStyle: "italic",
        }}
      >
        {t("offers.sort.multiLevelHint") || "(Shift + kattintás: több szintű)"}
      </span>
    </div>
  );
};

