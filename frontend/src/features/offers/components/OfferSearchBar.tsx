/**
 * OfferSearchBar Component
 * Kereső mező és undo/redo gombok az Offers feature-hez
 */

import React from "react";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";

interface OfferSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  theme: import("../../../utils/themes").Theme;
}

/**
 * Offer search bar komponens
 */
export const OfferSearchBar: React.FC<OfferSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  themeStyles,
  settings,
  theme,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Első sor: Keresés */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.background?.includes("gradient")
                ? "#1a202c"
                : theme.colors.text,
            }}
          >
            🔍 {t("offers.search.label")}
          </label>
          <input
            type="text"
            placeholder={t("offers.search.placeholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{
              ...themeStyles.input,
              width: "100%",
              padding: "12px 16px",
              fontSize: "14px",
              boxSizing: "border-box",
            }}
            aria-label={t("offers.search.aria")}
            aria-describedby="offers-search-description"
          />
          <span id="offers-search-description" style={{ display: "none" }}>
            {t("offers.search.description")}
          </span>
        </div>

        {/* Második sor: Undo/Redo gombok */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            paddingTop: "12px",
            borderTop: `1px solid ${theme.colors.border}`,
          }}
        >
          <Tooltip content={`${t("common.undo")} (Ctrl/Cmd+Z)`}>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                opacity: canUndo ? 1 : 0.5,
                cursor: canUndo ? "pointer" : "not-allowed",
                padding: "8px 16px",
                fontSize: "13px",
              }}
            >
              ↶ {t("common.undo")}
            </button>
          </Tooltip>
          <Tooltip content={`${t("common.redo")} (Ctrl/Cmd+Shift+Z)`}>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                opacity: canRedo ? 1 : 0.5,
                cursor: canRedo ? "pointer" : "not-allowed",
                padding: "8px 16px",
                fontSize: "13px",
              }}
            >
              ↷ {t("common.redo")}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

