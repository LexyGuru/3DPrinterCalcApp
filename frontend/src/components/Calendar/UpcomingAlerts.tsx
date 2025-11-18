import React from "react";
import type { Offer, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  offers: Offer[];
  getStatusColor: (status?: string) => string;
  getStatusIcon: (status?: string) => string;
  isDueTomorrow: (date: Date) => boolean;
  isPast: (date: Date) => boolean;
  formatDate: (date: Date) => string;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const UpcomingAlerts: React.FC<Props> = ({
  offers,
  getStatusColor,
  getStatusIcon,
  isDueTomorrow,
  isPast,
  formatDate,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);

  const upcomingOffers = offers
    .filter(offer => {
      if (!offer.printDueDate) return false;
      const dueDate = new Date(offer.printDueDate);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
      return dueDateStr === todayStr || dueDateStr === tomorrowStr;
    })
    .sort((a, b) => {
      if (!a.printDueDate || !b.printDueDate) return 0;
      return new Date(a.printDueDate).getTime() - new Date(b.printDueDate).getTime();
    });

  if (upcomingOffers.length === 0) return null;

  return (
    <div style={{ ...themeStyles.card, marginTop: "24px" }}>
      <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
        ⚠️ {t("calendar.upcoming") || "Esedékes nyomtatások"}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {upcomingOffers.map((offer) => {
          if (!offer.printDueDate) return null;
          const dueDate = new Date(offer.printDueDate);
          const isDueTomorrowDay = isDueTomorrow(dueDate);
          const isPastDue = isPast(dueDate);
          const statusColor = getStatusColor(offer.status);

          return (
            <div
              key={offer.id}
              style={{
                padding: "16px",
                border: `2px solid ${isPastDue ? theme.colors.danger : isDueTomorrowDay ? theme.colors.danger : statusColor}`,
                borderRadius: "8px",
                backgroundColor: isPastDue
                  ? `${theme.colors.danger}15`
                  : isDueTomorrowDay
                  ? `${theme.colors.danger}10`
                  : statusColor + "10",
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
                      backgroundColor: statusColor,
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
                    {formatDate(dueDate)}
                  </p>
                  <p style={{ margin: 0, fontSize: "12px", color: theme.colors.textMuted }}>
                    {offer.printerName} • {offer.printTimeHours}h {offer.printTimeMinutes}m
                  </p>
                </div>
                <div style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: isPastDue
                    ? theme.colors.danger
                    : isDueTomorrowDay
                    ? theme.colors.danger
                    : statusColor,
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  marginLeft: "12px",
                }}>
                  {isPastDue
                    ? t("calendar.overdue") || "Lejárt"
                    : isDueTomorrowDay
                    ? t("calendar.dueTomorrow") || "Holnap esedékes"
                    : t("calendar.dueToday") || "Ma esedékes"}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
