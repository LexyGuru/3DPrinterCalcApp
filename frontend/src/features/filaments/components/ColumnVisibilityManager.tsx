/**
 * ColumnVisibilityManager Component
 * Oszlop láthatóság kezelő menü a Filaments feature-hez
 */

import React from "react";
import type { Theme } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";

interface ColumnVisibilityManagerProps {
  columnVisibility: Record<string, boolean>;
  onToggleColumn: (column: string) => void;
  showColumnMenu: boolean;
  onToggleMenu: () => void;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../../utils/themes").getThemeStyles>;
  settings: Settings;
}

/**
 * Column visibility manager komponens
 */
export const ColumnVisibilityManager: React.FC<ColumnVisibilityManagerProps> = ({
  columnVisibility,
  onToggleColumn,
  showColumnMenu,
  onToggleMenu,
  theme,
  themeStyles,
  settings,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ position: "relative" }} data-column-menu>
      <Tooltip content={t("filaments.columns.manage")}>
        <button
          onClick={onToggleMenu}
          onMouseEnter={(e) => {
            Object.assign(
              (e.currentTarget as HTMLButtonElement).style,
              themeStyles.buttonHover
            );
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.transform = "translateY(0)";
            btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
          }}
          style={{
            ...themeStyles.button,
            ...themeStyles.buttonPrimary,
            fontSize: "16px",
            padding: "14px 28px",
          }}
          aria-label={t("filaments.columns.manage")}
        >
          📋 {t("filaments.columns.manage")}
        </button>
      </Tooltip>

      {/* Oszlop kezelő menü */}
      {showColumnMenu && (
        <div
          data-column-menu
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "8px",
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "8px",
            padding: "12px",
            minWidth: "200px",
            boxShadow:
              theme.name === "neon" || theme.name === "cyberpunk"
                ? `0 0 20px ${theme.colors.shadow}, 0 4px 16px rgba(0,0,0,0.3)`
                : `0 4px 16px rgba(0,0,0,0.2)`,
            zIndex: 1000,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              marginBottom: "8px",
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.text,
            }}
          >
            {t("filaments.columns.manage")}
          </div>
          {Object.entries(columnVisibility).map(([column, visible]) => (
            <label
              key={column}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px",
                cursor: "pointer",
                borderRadius: "4px",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <input
                type="checkbox"
                checked={visible}
                onChange={() => onToggleColumn(column)}
                style={{
                  cursor: "pointer",
                  width: "18px",
                  height: "18px",
                }}
              />
              <span style={{ fontSize: "14px", color: theme.colors.text }}>
                {t(`filaments.columns.${column}` as any) ||
                  t(`printers.columns.${column}` as any) ||
                  column}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

