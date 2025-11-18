import React from "react";
import type { PriceHistory, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  priceHistory: PriceHistory[];
  showPriceHistory: boolean;
  setShowPriceHistory: (show: boolean) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const FilamentPriceHistory: React.FC<Props> = ({
  priceHistory,
  showPriceHistory,
  setShowPriceHistory,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  if (priceHistory.length === 0) return null;

  return (
    <div style={{ marginTop: "8px" }}>
      <button
        type="button"
        onClick={() => setShowPriceHistory(!showPriceHistory)}
        style={{
          ...themeStyles.buttonSecondary,
          padding: "4px 8px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        {showPriceHistory ? "📉" : "📈"} {t("filaments.priceHistory.show")} ({priceHistory.length})
      </button>
      {showPriceHistory && (
        <div style={{
          marginTop: "8px",
          padding: "8px",
          backgroundColor: theme.colors.surface,
          borderRadius: "6px",
          border: `1px solid ${theme.colors.border}`,
          fontSize: "12px",
        }}>
          <div style={{ fontWeight: "600", marginBottom: "4px", color: theme.colors.text }}>
            {t("filaments.priceHistory.title")}
          </div>
          <div style={{ maxHeight: "120px", overflowY: "auto" }}>
            {priceHistory.slice(0, 5).map((entry) => {
              const isIncrease = entry.priceChange > 0;
              const changeColor = isIncrease ? theme.colors.danger : theme.colors.success;
              return (
                <div key={entry.id} style={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  marginBottom: "4px",
                  padding: "4px 0",
                  borderBottom: `1px solid ${theme.colors.border}`,
                }}>
                  <span style={{ color: theme.colors.textSecondary }}>
                    {new Date(entry.date).toLocaleDateString((() => {
                      const LANGUAGE_LOCALES: Record<string, string> = {
                        hu: "hu-HU", de: "de-DE", fr: "fr-FR", it: "it-IT", es: "es-ES",
                        pl: "pl-PL", cs: "cs-CZ", sk: "sk-SK", zh: "zh-CN", "pt-BR": "pt-BR",
                        uk: "uk-UA", ru: "ru-RU", en: "en-US",
                      };
                      return LANGUAGE_LOCALES[settings.language] ?? "en-US";
                    })(), {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span style={{ color: theme.colors.textSecondary }}>
                    {entry.oldPrice.toFixed(2)} →
                  </span>
                  <span style={{ fontWeight: "600", color: theme.colors.text }}>
                    {entry.newPrice.toFixed(2)} {entry.currency}
                  </span>
                  <span style={{ color: changeColor, fontWeight: "600" }}>
                    {isIncrease ? "+" : ""}{entry.priceChangePercent.toFixed(1)}%
                  </span>
                </div>
              );
            })}
            {priceHistory.length > 5 && (
              <div style={{ 
                textAlign: "center", 
                marginTop: "4px", 
                fontSize: "11px", 
                color: theme.colors.textSecondary,
                fontStyle: "italic",
              }}>
                {t("filaments.priceHistory.more").replace("{count}", String(priceHistory.length - 5))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
