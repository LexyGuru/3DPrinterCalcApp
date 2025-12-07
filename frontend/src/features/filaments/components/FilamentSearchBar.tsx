/**
 * FilamentSearchBar Component
 * Kereső mező és undo/redo gombok a Filaments feature-hez
 */

import React from "react";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";

interface FilamentSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  isSaving?: boolean;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  interactionsEnabled?: boolean;
}

/**
 * Filament search bar komponens
 */
export const FilamentSearchBar: React.FC<FilamentSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isSaving = false,
  theme,
  themeStyles,
  settings,
  interactionsEnabled = true,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
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
        🔍 {t("filaments.search.label")}
      </label>
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder={t("filaments.search.placeholder")}
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
            flex: "1",
            minWidth: "200px",
            maxWidth: "400px",
          }}
          aria-label={t("filaments.search.ariaLabel")}
          aria-describedby="filament-search-description"
        />
        <span id="filament-search-description" style={{ display: "none" }}>
          {t("filaments.search.description")}
        </span>
        {/* Undo/Redo és Kedvencek gombok */}
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {isSaving && (
            <span
              style={{
                fontSize: "12px",
                color: theme.colors.textMuted,
                fontStyle: "italic",
              }}
            >
              💾 Mentés folyamatban...
            </span>
          )}
          <Tooltip content={`${t("common.undo")} (Ctrl/Cmd+Z)`}>
            <button
              onClick={() => {
                if (canUndo) {
                  onUndo();
                }
              }}
              disabled={!canUndo}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                opacity: canUndo ? 1 : 0.5,
                cursor: canUndo ? "pointer" : "not-allowed",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              <span>↶</span>
              <span>{t("common.undo")}</span>
            </button>
          </Tooltip>
          <Tooltip content={`${t("common.redo")} (Ctrl/Cmd+Shift+Z)`}>
            <button
              onClick={() => {
                if (canRedo) {
                  onRedo();
                }
              }}
              disabled={!canRedo}
              style={{
                ...themeStyles.button,
                ...themeStyles.buttonSecondary,
                opacity: canRedo ? 1 : 0.5,
                cursor: canRedo ? "pointer" : "not-allowed",
                padding: "8px 12px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "14px",
              }}
            >
              <span>↷</span>
              <span>{t("common.redo")}</span>
            </button>
          </Tooltip>
          <Tooltip
            content={
              showFavoritesOnly
                ? t("filaments.favorite.showAll")
                : t("filaments.favorite.showOnly")
            }
          >
            <button
              onClick={onToggleFavorites}
              onMouseEnter={(e) => {
                if (!interactionsEnabled) return;
                Object.assign(
                  (e.currentTarget as HTMLButtonElement).style,
                  themeStyles.buttonHover
                );
              }}
              onMouseLeave={(e) => {
                if (!interactionsEnabled) return;
                const btn = e.currentTarget as HTMLButtonElement;
                btn.style.transform = "translateY(0)";
                btn.style.boxShadow = showFavoritesOnly
                  ? themeStyles.buttonPrimary.boxShadow
                  : themeStyles.buttonSecondary.boxShadow;
              }}
              style={{
                ...themeStyles.button,
                ...(showFavoritesOnly
                  ? themeStyles.buttonPrimary
                  : themeStyles.buttonSecondary),
                padding: "8px 12px",
                fontSize: "14px",
              }}
            >
              {showFavoritesOnly ? "⭐" : "☆"}{" "}
              {showFavoritesOnly
                ? t("filaments.favorite.showAll")
                : t("filaments.favorite.showOnly")}
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

