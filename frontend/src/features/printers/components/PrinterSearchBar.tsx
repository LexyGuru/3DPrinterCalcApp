/**
 * PrinterSearchBar Component
 * Kereső mező és undo/redo gombok a Printers feature-hez
 */

import React from "react";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";

interface PrinterSearchBarProps {
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
 * Printer search bar komponens
 */
export const PrinterSearchBar: React.FC<PrinterSearchBarProps> = ({
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
      <div style={{ display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
        <div style={{ flex: "1", minWidth: "200px" }}>
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
            🔍 {t("printers.searchLabel")}
          </label>
          <input
            type="text"
            placeholder={t("printers.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={(e) =>
              Object.assign(e.target.style, themeStyles.inputFocus)
            }
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{
              ...themeStyles.input,
              width: "100%",
              maxWidth: "400px",
            }}
            aria-label={t("printers.searchAria")}
            aria-describedby="printer-search-description"
          />
          <span id="printer-search-description" style={{ display: "none" }}>
            {t("printers.searchDescription")}
          </span>
        </div>

        {/* Undo/Redo gombok */}
        <div style={{ display: "flex", gap: "8px" }}>
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

