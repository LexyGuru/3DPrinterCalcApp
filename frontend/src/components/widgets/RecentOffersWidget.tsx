import React from "react";
import type { WidgetConfig } from "../../types/widgets";
import type { Theme } from "../../utils/themes";
import type { Settings, Offer } from "../../types";
import { useTranslation } from "../../utils/translations";
import { getCurrencyLabel } from "../../utils/currency";

interface RecentOffersWidgetProps {
  widget: WidgetConfig;
  theme: Theme;
  settings: Settings;
  offers: Offer[];
  maxItems?: number;
  onOfferClick?: (offerId: number) => void;
}

const STATUS_COLORS: Record<string, string> = {
  draft: "#6c757d",
  sent: "#007bff",
  accepted: "#28a745",
  rejected: "#dc3545",
  completed: "#17a2b8",
};

const STATUS_ICONS: Record<string, string> = {
  draft: "📝",
  sent: "📤",
  accepted: "✅",
  rejected: "❌",
  completed: "✔️",
};

const STATUS_LABEL_KEYS: Record<string, import("../../utils/languages/types").TranslationKey> = {
  draft: "offers.status.draft",
  sent: "offers.status.sent",
  accepted: "offers.status.accepted",
  rejected: "offers.status.rejected",
  completed: "offers.status.completed",
};

export const RecentOffersWidget: React.FC<RecentOffersWidgetProps> = ({
  widget,
  theme,
  settings,
  offers,
  maxItems = 5,
  onOfferClick,
}) => {
  const t = useTranslation(settings.language);
  const isGradientBackground = theme.colors.background?.includes('gradient');
  const cardBg = isGradientBackground 
    ? "rgba(255, 255, 255, 0.98)" 
    : theme.colors.surface;

  const isSmall = widget.size === "small";
  const isMedium = widget.size === "medium";
  
  const padding = isSmall ? "12px" : isMedium ? "16px" : "20px";
  const fontSize = isSmall ? "11px" : isMedium ? "13px" : "14px";

  // Rendezzük dátum szerint (legújabb először) és csak az első maxItems-et
  const recentOffers = [...offers]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, maxItems);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t("common.today") || "Today";
    if (diffDays === 1) return t("common.yesterday") || "Yesterday";
    if (diffDays < 7) return `${diffDays} ${t("common.daysAgo") || "days ago"}`;
    
    return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : "en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (value: number, currency: string) => {
    const currencyLabel = getCurrencyLabel(currency as import("../../types").Currency);
    return `${value.toFixed(2)} ${currencyLabel}`;
  };

  if (recentOffers.length === 0) {
    return (
      <div style={{ 
        height: "100%", 
        width: "100%",
        display: "flex", 
        flexDirection: "column",
        minHeight: 0,
        boxSizing: "border-box",
      }}>
        <div style={{
          backgroundColor: cardBg,
          borderRadius: isSmall ? "8px" : "12px",
          padding: padding,
          boxShadow: isGradientBackground
            ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
            : `0 4px 16px ${theme.colors.shadow}`,
          border: `1px solid ${theme.colors.border}`,
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.colors.textMuted,
          fontSize: fontSize,
        }}>
          {t("widget.recentOffers.empty") || "No recent offers"}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: "100%", 
      width: "100%",
      display: "flex", 
      flexDirection: "column",
      minHeight: 0,
      boxSizing: "border-box",
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: isSmall ? "8px" : "12px",
        padding: padding,
        boxShadow: isGradientBackground
          ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
          : `0 4px 16px ${theme.colors.shadow}`,
        border: `1px solid ${theme.colors.border}`,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        overflow: "hidden",
        gap: isSmall ? "8px" : "12px",
      }}>
        <div style={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: isSmall ? "6px" : "8px",
          minHeight: 0,
        }}>
          {recentOffers.map((offer) => {
            const status = offer.status || "draft";
            const statusColor = STATUS_COLORS[status] || STATUS_COLORS.draft;
            const statusIcon = STATUS_ICONS[status] || STATUS_ICONS.draft;
            const statusLabel = t(STATUS_LABEL_KEYS[status] || STATUS_LABEL_KEYS.draft);
            const totalCost = offer.costs?.totalCost || 0;

            return (
              <div
                key={offer.id}
                onClick={() => onOfferClick?.(offer.id)}
                style={{
                  padding: isSmall ? "8px" : "10px",
                  borderRadius: "8px",
                  backgroundColor: theme.colors.surfaceHover,
                  border: `1px solid ${theme.colors.border}`,
                  cursor: onOfferClick ? "pointer" : "default",
                  transition: "all 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: isSmall ? "4px" : "6px",
                }}
                onMouseEnter={(e) => {
                  if (onOfferClick) {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    e.currentTarget.style.transform = "translateX(2px)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  e.currentTarget.style.transform = "translateX(0)";
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flex: 1,
                    minWidth: 0,
                  }}>
                    <span style={{ fontSize: isSmall ? "14px" : "16px" }}>{statusIcon}</span>
                    <div style={{
                      fontSize: fontSize,
                      fontWeight: "600",
                      color: theme.colors.text,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flex: 1,
                    }}>
                      {offer.customerName || t("common.unknown") || "Unknown"}
                    </div>
                  </div>
                  <div style={{
                    fontSize: fontSize,
                    fontWeight: "700",
                    color: statusColor,
                  }}>
                    {formatCurrency(totalCost, offer.currency || settings.currency || "EUR")}
                  </div>
                </div>
                {offer.description && (
                  <div style={{
                    fontSize: isSmall ? "10px" : "11px",
                    color: theme.colors.textMuted,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}>
                    {offer.description}
                  </div>
                )}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: isSmall ? "10px" : "11px",
                  color: theme.colors.textMuted,
                }}>
                  <span>{formatDate(offer.date)}</span>
                  <span style={{
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: `${statusColor}20`,
                    color: statusColor,
                    fontSize: isSmall ? "9px" : "10px",
                    fontWeight: "600",
                  }}>
                    {statusLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

