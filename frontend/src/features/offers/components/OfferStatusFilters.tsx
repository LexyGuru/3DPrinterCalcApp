/**
 * OfferStatusFilters Component
 * Status szűrő gombok az Offers feature-hez
 */

import React from "react";
import type { OfferStatus } from "../../../types";
import type { Settings } from "../../../types";
import { useTranslation } from "../../../utils/translations";

interface StatusSummary {
  status: OfferStatus;
  count: number;
  updatedAt: string | null;
  totalRevenue?: number;
}

interface OfferStatusFiltersProps {
  statusFilter: OfferStatus | "all";
  onStatusFilterChange: (status: OfferStatus | "all") => void;
  statusSummary: StatusSummary[];
  totalOffers: number;
  getStatusColor: (status: OfferStatus) => string;
  getStatusLabel: (status: OfferStatus) => string;
  settings: Settings;
  theme: import("../../../utils/themes").Theme;
}

/**
 * Offer status filters komponens
 */
export const OfferStatusFilters: React.FC<OfferStatusFiltersProps> = ({
  statusFilter,
  onStatusFilterChange,
  statusSummary,
  totalOffers,
  getStatusColor,
  getStatusLabel,
  settings,
  theme,
}) => {
  const t = useTranslation(settings.language);

  return (
    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
      <button
        onClick={() => onStatusFilterChange("all")}
        style={{
          padding: "8px 14px",
          fontSize: "12px",
          fontWeight: statusFilter === "all" ? 700 : 600,
          borderRadius: "999px",
          border:
            statusFilter === "all"
              ? `1px solid ${theme.colors.primary}`
              : `1px solid ${theme.colors.border}`,
          backgroundColor:
            statusFilter === "all"
              ? theme.colors.primary
              : theme.colors.surfaceHover,
          color:
            statusFilter === "all"
              ? "#fff"
              : theme.colors.background?.includes("gradient")
                ? "#1a202c"
                : theme.colors.text,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        {t("offers.filter.all")} ({totalOffers})
      </button>
      {statusSummary.map((summary) => {
        const isActive = statusFilter === summary.status;
        const color = getStatusColor(summary.status);
        return (
          <button
            key={summary.status}
            onClick={() => onStatusFilterChange(summary.status)}
            style={{
              padding: "8px 14px",
              fontSize: "12px",
              fontWeight: isActive ? 700 : 600,
              borderRadius: "999px",
              border: `1px solid ${isActive ? color : theme.colors.border}`,
              backgroundColor: isActive ? color : theme.colors.surfaceHover,
              color:
                isActive
                  ? "#fff"
                  : theme.colors.background?.includes("gradient")
                    ? "#1a202c"
                    : theme.colors.text,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {getStatusLabel(summary.status)} ({summary.count})
          </button>
        );
      })}
    </div>
  );
};

