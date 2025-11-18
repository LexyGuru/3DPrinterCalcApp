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
}

export const CustomerSearch: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ marginBottom: "20px" }}>
      <input
        type="text"
        placeholder={t("customers.searchPlaceholder")}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{
          ...themeStyles.input,
          width: "100%",
          maxWidth: "400px",
        }}
      />
    </div>
  );
};
