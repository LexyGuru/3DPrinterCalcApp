/**
 * AddFilamentButton Component
 * Új filament hozzáadása gomb a Filaments feature-hez
 */

import React from "react";
import type { getThemeStyles } from "../../../utils/themes";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";

interface AddFilamentButtonProps {
  onAdd: () => void;
  themeStyles: ReturnType<typeof getThemeStyles>;
  settings: Settings;
  interactionsEnabled?: boolean;
}

/**
 * Add filament button komponens
 */
export const AddFilamentButton: React.FC<AddFilamentButtonProps> = ({
  onAdd,
  themeStyles,
  settings,
  interactionsEnabled = true,
}) => {
  const t = useTranslation(settings.language);

  return (
    <Tooltip content={t("filaments.tooltip.addShortcut")}>
      <button
        onClick={onAdd}
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
          btn.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onAdd();
          }
        }}
        style={{
          ...themeStyles.button,
          ...themeStyles.buttonPrimary,
          fontSize: "16px",
          padding: "14px 28px",
        }}
        aria-label={t("filaments.actions.addAria")}
      >
        ➕ {t("filaments.addTitle")}
      </button>
    </Tooltip>
  );
};

