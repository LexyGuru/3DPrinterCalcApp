import React from "react";
import type { Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
  filamentsCount: number;
}

export const FilamentSearch: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  settings,
  theme,
  themeStyles,
  filamentsCount,
}) => {
  const t = useTranslation(settings.language);

  if (filamentsCount === 0) return null;

  return (
    <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
      <label style={{ 
        display: "block", 
        marginBottom: "8px", 
        fontWeight: "600", 
        fontSize: "14px", 
        color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text 
      }}>
        🔍 {t("filaments.search.label")}
      </label>
      <input
        type="text"
        placeholder={t("filaments.search.placeholder")}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
        onBlur={(e) => { e.target.style.borderColor = theme.colors.inputBorder; e.target.style.boxShadow = "none"; }}
        style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
        aria-label={t("filaments.search.ariaLabel")}
        aria-describedby="filament-search-description"
      />
      <span id="filament-search-description" style={{ display: "none" }}>
        {t("filaments.search.description")}
      </span>
    </div>
  );
};
