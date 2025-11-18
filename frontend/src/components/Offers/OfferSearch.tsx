import React from "react";
import type { OfferStatus, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OfferStatus | "all";
  setStatusFilter: (filter: OfferStatus | "all") => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

const STATUS_ORDER: OfferStatus[] = ["draft", "sent", "accepted", "rejected", "completed"];

export const OfferSearch: React.FC<Props> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  const statusLabelKeyMap: Record<OfferStatus, string> = {
    draft: "offers.status.draft",
    sent: "offers.status.sent",
    accepted: "offers.status.accepted",
    rejected: "offers.status.rejected",
    completed: "offers.status.completed",
  };

  return (
    <div style={{ ...themeStyles.card, marginBottom: "24px" }}>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          fontSize: "14px",
          color: theme.colors.background?.includes("gradient") ? "#1a202c" : theme.colors.text,
        }}
      >
        🔍 {t("offers.search.label")}
      </label>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ flex: "1", minWidth: "200px" }}>
          <input
            type="text"
            placeholder={t("offers.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={(e) => Object.assign(e.target.style, themeStyles.inputFocus)}
            onBlur={(e) => {
              e.target.style.borderColor = theme.colors.inputBorder;
              e.target.style.boxShadow = "none";
            }}
            style={{ ...themeStyles.input, width: "100%", maxWidth: "400px" }}
            aria-label={t("offers.search.aria")}
            aria-describedby="offers-search-description"
          />
          <span id="offers-search-description" style={{ display: "none" }}>
            {t("offers.search.description")}
          </span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setStatusFilter("all")}
            style={{
              ...themeStyles.button,
              ...(statusFilter === "all" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            {t("offers.filter.all") || "Összes"}
          </button>
          {STATUS_ORDER.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              style={{
                ...themeStyles.button,
                ...(statusFilter === status ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
                padding: "8px 16px",
                fontSize: "14px",
              }}
            >
              {t(statusLabelKeyMap[status])}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
