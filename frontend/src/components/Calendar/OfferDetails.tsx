import React from "react";
import type { Offer, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  selectedDate: Date | null;
  offers: Offer[];
  getOffersForDate: (date: Date) => Offer[];
  formatDate: (date: Date) => string;
  getStatusColor: (status?: string) => string;
  getStatusIcon: (status?: string) => string;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const OfferDetails: React.FC<Props> = ({
  selectedDate,
  offers,
  getOffersForDate,
  formatDate,
  getStatusColor,
  getStatusIcon,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  if (!selectedDate) return null;

  const dayOffers = getOffersForDate(selectedDate);

  return (
    <div style={{ ...themeStyles.card, marginTop: "24px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
        {formatDate(selectedDate)}
      </h3>
      {dayOffers.length === 0 ? (
        <p style={{ color: theme.colors.textMuted }}>
          {t("calendar.noOffers") || "Nincs esedékes nyomtatás ezen a napon."}
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {dayOffers.map((offer) => (
            <div
              key={offer.id}
              style={{
                padding: "16px",
                border: `2px solid ${getStatusColor(offer.status)}`,
                borderRadius: "8px",
                backgroundColor: getStatusColor(offer.status) + "10",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <span style={{ fontSize: "18px" }}>{getStatusIcon(offer.status)}</span>
                    <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
                      {offer.customerName || t("offers.customerName") || "Ügyfél"}
                    </h4>
                    <div style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor: getStatusColor(offer.status),
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: "600",
                    }}>
                      {offer.status === "accepted" ? (t("offers.status.accepted") || "Elfogadva") :
                       offer.status === "rejected" ? (t("offers.status.rejected") || "Elutasítva") :
                       offer.status === "completed" ? (t("offers.status.completed") || "Befejezve") : ""}
                    </div>
                  </div>
                  <p style={{ margin: "0 0 4px 0", fontSize: "14px", color: theme.colors.textSecondary }}>
                    {offer.description || t("offers.description") || "Leírás"}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: theme.colors.textMuted }}>
                    {offer.printerName} • {offer.printTimeHours}h {offer.printTimeMinutes}m
                  </p>
                </div>
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: getStatusColor(offer.status),
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginLeft: "12px",
                }}>
                  {offer.costs.totalCost.toFixed(2)} {offer.currency}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
