import React from "react";
import type { Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  currentDate: Date;
  viewMode: "month" | "week" | "day";
  setViewMode: (mode: "month" | "week" | "day") => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  formatMonthYear: (date: Date) => string;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const CalendarControls: React.FC<Props> = ({
  currentDate,
  viewMode,
  setViewMode,
  onPreviousMonth,
  onNextMonth,
  onToday,
  formatMonthYear,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');

  return (
    <div style={{ 
      ...themeStyles.card, 
      marginBottom: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: "16px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button
          onClick={onPreviousMonth}
          style={{
            ...themeStyles.button,
            ...themeStyles.buttonSecondary,
            padding: "8px 16px",
          }}
        >
          ←
        </button>
        <button
          onClick={onToday}
          style={{
            ...themeStyles.button,
            ...themeStyles.buttonPrimary,
            padding: "8px 16px",
          }}
        >
          {t("calendar.today") || "Ma"}
        </button>
        <button
          onClick={onNextMonth}
          style={{
            ...themeStyles.button,
            ...themeStyles.buttonSecondary,
            padding: "8px 16px",
          }}
        >
          →
        </button>
      </div>
      <h3 style={{ 
        margin: 0, 
        fontSize: "24px", 
        fontWeight: "700",
        color: isGradientBg ? "#1a202c" : theme.colors.text,
      }}>
        {formatMonthYear(currentDate)}
      </h3>
      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={() => setViewMode("month")}
          style={{
            ...themeStyles.button,
            ...(viewMode === "month" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
            padding: "8px 16px",
          }}
        >
          {t("calendar.month") || "Hónap"}
        </button>
        <button
          onClick={() => setViewMode("week")}
          style={{
            ...themeStyles.button,
            ...(viewMode === "week" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
            padding: "8px 16px",
          }}
        >
          {t("calendar.week") || "Hét"}
        </button>
        <button
          onClick={() => setViewMode("day")}
          style={{
            ...themeStyles.button,
            ...(viewMode === "day" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
            padding: "8px 16px",
          }}
        >
          {t("calendar.day") || "Nap"}
        </button>
      </div>
    </div>
  );
};
