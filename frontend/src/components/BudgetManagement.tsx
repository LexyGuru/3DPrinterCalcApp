import React, { useMemo } from "react";
import { motion } from "framer-motion";
import type { Offer, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { useToast } from "./Toast";
import { saveOffers } from "../utils/store";
import { auditUpdate } from "../utils/auditLog";
import { convertCurrencyFromTo, getCurrencyLabel } from "../utils/currency";

interface Props {
  offers: Offer[];
  setOffers: (offers: Offer[]) => void;
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const BudgetManagement: React.FC<Props> = ({
  offers,
  setOffers,
  settings,
  theme,
  themeStyles,
}) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();

  // Csak a befejezett árajánlatok
  const completedOffers = useMemo(() => {
    return offers.filter(offer => offer.status === "completed");
  }, [offers]);

  const updatePaymentStatus = async (offerId: number, paymentStatus: "paid" | "unpaid" | "gift") => {
    const updatedOffers = offers.map(offer => {
      if (offer.id === offerId) {
        const updatedOffer = {
          ...offer,
          paymentStatus,
        };
        
        // Audit log
        auditUpdate("offer", offerId, offer.customerName || "Unknown", {
          oldValues: { paymentStatus: offer.paymentStatus || "paid" },
          newValues: { paymentStatus },
        }).catch(err => {
          console.warn("Audit log hiba:", err);
        });

        return updatedOffer;
      }
      return offer;
    });

    setOffers(updatedOffers);
    await saveOffers(updatedOffers);
    showToast(t("budget.paymentStatusUpdated") || "Fizetési státusz frissítve", "success");
  };

  const getOfferRevenue = (offer: Offer): number => {
    const profitPercentage = offer.profitPercentage ?? 30;
    const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
    return convertCurrencyFromTo(revenueInOfferCurrency, offer.currency, "EUR");
  };

  // Statisztikák
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let totalCosts = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let giftCount = 0;

    completedOffers.forEach(offer => {
      const revenue = getOfferRevenue(offer);
      const costsEUR = convertCurrencyFromTo(offer.costs.totalCost, offer.currency, "EUR");
      
      totalCosts += costsEUR;
      
      const paymentStatus = offer.paymentStatus || "paid";
      if (paymentStatus === "paid") {
        totalRevenue += revenue;
        paidCount++;
      } else if (paymentStatus === "unpaid") {
        unpaidCount++;
      } else if (paymentStatus === "gift") {
        giftCount++;
      }
    });

    return {
      totalRevenue,
      totalCosts,
      profit: totalRevenue - totalCosts,
      paidCount,
      unpaidCount,
      giftCount,
      totalCount: completedOffers.length,
    };
  }, [completedOffers]);

  const cardBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
    ? "rgba(255, 255, 255, 0.98)"
    : theme.colors.surface;

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ 
        fontSize: "28px", 
        fontWeight: "700", 
        marginBottom: "24px",
        color: theme.colors.text 
      }}>
        {t("budget.title") || "Költségvetés kezelés"}
      </h1>

      {/* Statisztikák */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: theme.colors.text, marginBottom: "8px" }}>
            {stats.totalCount}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.totalCompleted") || "Összes befejezett"}
          </div>
        </div>

        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
          border: `2px solid #22c55e`,
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#22c55e", marginBottom: "8px" }}>
            {stats.paidCount}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.paid") || "Fizetve"}
          </div>
        </div>

        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
          border: `2px solid #f59e0b`,
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#f59e0b", marginBottom: "8px" }}>
            {stats.unpaidCount}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.unpaid") || "Nem fizetve"}
          </div>
        </div>

        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
          border: `2px solid #a855f7`,
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: "#a855f7", marginBottom: "8px" }}>
            {stats.giftCount}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.gift") || "Ajándék"}
          </div>
        </div>

        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
          border: `2px solid ${theme.colors.primary}`,
        }}>
          <div style={{ fontSize: "24px", fontWeight: "600", color: theme.colors.primary, marginBottom: "8px" }}>
            {getCurrencyLabel(settings.currency)} {stats.totalRevenue.toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.totalRevenue") || "Összbevétel"}
          </div>
        </div>

        <div style={{
          ...themeStyles.card,
          padding: "20px",
          textAlign: "center",
          border: `2px solid ${stats.profit >= 0 ? theme.colors.success : theme.colors.danger}`,
        }}>
          <div style={{ 
            fontSize: "24px", 
            fontWeight: "600", 
            color: stats.profit >= 0 ? theme.colors.success : theme.colors.danger, 
            marginBottom: "8px" 
          }}>
            {getCurrencyLabel(settings.currency)} {stats.profit.toFixed(2)}
          </div>
          <div style={{ fontSize: "14px", color: theme.colors.textMuted }}>
            {t("budget.totalProfit") || "Nettó profit"}
          </div>
        </div>
      </div>

      {/* Árajánlatok listája */}
      {completedOffers.length === 0 ? (
        <div style={{
          ...themeStyles.card,
          padding: "40px",
          textAlign: "center",
          color: theme.colors.textMuted,
        }}>
          {t("budget.noCompletedOffers") || "Nincsenek befejezett árajánlatok"}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {completedOffers.map((offer) => {
            const revenue = getOfferRevenue(offer);
            const costsEUR = convertCurrencyFromTo(offer.costs.totalCost, offer.currency, "EUR");
            const paymentStatus = offer.paymentStatus || "paid";

            return (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  backgroundColor: cardBg,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient')
                    ? `0 8px 24px rgba(0,0,0,0.15)`
                    : `0 4px 16px ${theme.colors.shadow}`,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: theme.colors.text, marginBottom: "8px" }}>
                      {offer.customerName || t("common.unknown") || "Unknown"}
                    </h3>
                    {offer.description && (
                      <p style={{ margin: 0, fontSize: "14px", color: theme.colors.textMuted }}>
                        {offer.description}
                      </p>
                    )}
                    <div style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
                      {new Date(offer.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text, marginBottom: "4px" }}>
                      {getCurrencyLabel(offer.currency)} {revenue.toFixed(2)}
                    </div>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted }}>
                      {t("budget.revenue") || "Bevétel"}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", 
                  gap: "12px",
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "8px",
                }}>
                  <div>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {t("budget.costs") || "Költségek"}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                      {getCurrencyLabel(settings.currency)} {costsEUR.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {t("budget.profit") || "Profit"}
                    </div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: paymentStatus === "paid" ? theme.colors.success : theme.colors.textMuted }}>
                      {paymentStatus === "paid" 
                        ? `${getCurrencyLabel(settings.currency)} ${(revenue - costsEUR).toFixed(2)}`
                        : t("budget.notIncluded") || "Nincs benne"}
                    </div>
                  </div>
                </div>

                {/* Fizetési státusz kiválasztó */}
                <div>
                  <label style={{ 
                    display: "block", 
                    marginBottom: "8px", 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.text 
                  }}>
                    {t("budget.paymentStatus") || "Fizetési státusz"}
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => updatePaymentStatus(offer.id, "paid")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: `2px solid ${paymentStatus === "paid" ? "#22c55e" : theme.colors.border}`,
                        backgroundColor: paymentStatus === "paid" ? "#22c55e20" : "transparent",
                        color: paymentStatus === "paid" ? "#22c55e" : theme.colors.text,
                        fontSize: "14px",
                        fontWeight: paymentStatus === "paid" ? "600" : "400",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (paymentStatus !== "paid") {
                          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (paymentStatus !== "paid") {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {t("budget.paid") || "Fizetve"}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(offer.id, "unpaid")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: `2px solid ${paymentStatus === "unpaid" ? "#f59e0b" : theme.colors.border}`,
                        backgroundColor: paymentStatus === "unpaid" ? "#f59e0b20" : "transparent",
                        color: paymentStatus === "unpaid" ? "#f59e0b" : theme.colors.text,
                        fontSize: "14px",
                        fontWeight: paymentStatus === "unpaid" ? "600" : "400",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (paymentStatus !== "unpaid") {
                          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (paymentStatus !== "unpaid") {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {t("budget.unpaid") || "Nem fizetve"}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus(offer.id, "gift")}
                      style={{
                        flex: 1,
                        padding: "10px",
                        borderRadius: "6px",
                        border: `2px solid ${paymentStatus === "gift" ? "#a855f7" : theme.colors.border}`,
                        backgroundColor: paymentStatus === "gift" ? "#a855f720" : "transparent",
                        color: paymentStatus === "gift" ? "#a855f7" : theme.colors.text,
                        fontSize: "14px",
                        fontWeight: paymentStatus === "gift" ? "600" : "400",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        if (paymentStatus !== "gift") {
                          e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (paymentStatus !== "gift") {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }
                      }}
                    >
                      {t("budget.gift") || "Ajándék"}
                    </button>
                  </div>
                  <div style={{ marginTop: "8px", fontSize: "12px", color: theme.colors.textMuted }}>
                    {paymentStatus === "paid" 
                      ? (t("budget.includedInRevenue") || "✓ Számít bele a bevételbe")
                      : (t("budget.notIncludedInRevenue") || "✗ Nincs benne a bevételben, de a kiadásban igen")}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

