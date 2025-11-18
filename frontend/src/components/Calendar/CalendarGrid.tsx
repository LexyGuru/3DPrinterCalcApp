import React from "react";
import type { Offer, Settings } from "../../types";
import type { Theme } from "../../utils/themes";
import { useTranslation } from "../../utils/translations";

interface Props {
  calendarDays: Date[];
  dayNames: string[];
  currentDate: Date;
  offersWithDueDates: Offer[];
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  getOffersForDate: (date: Date) => Offer[];
  isCurrentMonth: (date: Date) => boolean;
  isToday: (date: Date) => boolean;
  isPast: (date: Date) => boolean;
  isDueTomorrow: (date: Date) => boolean;
  getStatusColor: (status?: string) => string;
  getStatusIcon: (status?: string) => string;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../../utils/themes").getThemeStyles>;
}

export const CalendarGrid: React.FC<Props> = ({
  calendarDays,
  dayNames,
  currentDate,
  offersWithDueDates,
  selectedDate,
  setSelectedDate,
  getOffersForDate,
  isCurrentMonth,
  isToday,
  isPast,
  isDueTomorrow,
  getStatusColor,
  getStatusIcon,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';

  return (
    <div style={themeStyles.card}>
      {/* Day names header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
        marginBottom: "8px",
      }}>
        {dayNames.map((day, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              textAlign: "center",
              fontWeight: "600",
              fontSize: "14px",
              color: theme.colors.textSecondary,
              borderBottom: `2px solid ${theme.colors.border}`,
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "8px",
      }}>
        {calendarDays.map((day, index) => {
          const dayOffers = getOffersForDate(day);
          const isCurrentMonthDay = isCurrentMonth(day);
          const isTodayDay = isToday(day);
          const isPastDay = isPast(day);
          const isDueTomorrowDay = isDueTomorrow(day);

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              style={{
                minHeight: "100px",
                padding: "8px",
                border: `1px solid ${theme.colors.border}`,
                borderRadius: "8px",
                backgroundColor: isCurrentMonthDay
                  ? (isGradientBg ? "rgba(255, 255, 255, 0.7)" : theme.colors.surface)
                  : (isGradientBg ? "rgba(255, 255, 255, 0.3)" : theme.colors.background),
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                ...(isTodayDay ? {
                  border: `2px solid ${theme.colors.primary}`,
                  boxShadow: `0 0 0 3px ${theme.colors.primary}20`,
                } : {}),
                ...(isDueTomorrowDay && dayOffers.length > 0 ? {
                  border: `2px solid ${theme.colors.danger}`,
                  boxShadow: `0 0 0 3px ${theme.colors.danger}20`,
                } : {}),
                ...(isPastDay && dayOffers.length > 0 ? {
                  border: `2px solid ${theme.colors.danger}`,
                  backgroundColor: isGradientBg ? "rgba(239, 68, 68, 0.1)" : `${theme.colors.danger}15`,
                } : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadow}`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{
                fontWeight: isTodayDay ? "700" : "500",
                fontSize: "14px",
                color: isCurrentMonthDay
                  ? (isTodayDay ? theme.colors.primary : theme.colors.text)
                  : theme.colors.textMuted,
                marginBottom: "4px",
              }}>
                {day.getDate()}
              </div>
              {dayOffers.length > 0 && (
                <div style={{ marginTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {dayOffers.slice(0, 3).map((offer) => (
                    <div
                      key={offer.id}
                      style={{
                        fontSize: "10px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        backgroundColor: getStatusColor(offer.status) + "20",
                        color: getStatusColor(offer.status),
                        border: `1px solid ${getStatusColor(offer.status)}40`,
                        fontWeight: "600",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>{getStatusIcon(offer.status)}</span>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {offer.customerName || t("offers.customerName") || "Ügyfél"}
                      </span>
                    </div>
                  ))}
                  {dayOffers.length > 3 && (
                    <div style={{
                      fontSize: "10px",
                      color: theme.colors.textMuted,
                      textAlign: "center",
                    }}>
                      +{dayOffers.length - 3} {t("calendar.offers") || "több"}
                    </div>
                  )}
                </div>
              )}
              {isDueTomorrowDay && dayOffers.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "4px",
                  right: "4px",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: theme.colors.danger,
                  boxShadow: isNeon ? `0 0 8px ${theme.colors.danger}` : "none",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
