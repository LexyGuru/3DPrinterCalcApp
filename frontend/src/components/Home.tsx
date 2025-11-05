import React, { useMemo } from "react";
import type { Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";

interface Props {
  settings: Settings;
  offers: Offer[];
  theme: Theme;
}

export const Home: React.FC<Props> = ({ settings, offers, theme }) => {
  const t = useTranslation(settings.language);
  
  // Statisztikák számítása
  const statistics = useMemo(() => {
    if (offers.length === 0) {
      return {
        totalFilamentUsed: 0,
        totalRevenue: 0,
        totalElectricityConsumed: 0, // kWh
        totalCosts: 0,
        totalProfit: 0,
        totalPrintTime: 0, // hours
        offerCount: 0
      };
    }

    let totalFilamentUsed = 0; // gramm
    let totalRevenue = 0;
    let totalElectricityKWh = 0;
    let totalCosts = 0;
    let totalPrintTime = 0;

    offers.forEach(offer => {
      // Filament fogyasztás
      offer.filaments.forEach(f => {
        totalFilamentUsed += f.usedGrams;
      });

      // Bevétel: költségek + profit (profit százalék alapján)
      const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30; // Alapértelmezett 30%
      const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
      // Konvertáljuk a jelenlegi pénznemre
      const revenueInEUR = offer.currency === "HUF" ? revenueInOfferCurrency / 400 : 
                           offer.currency === "USD" ? revenueInOfferCurrency / 1.10 : 
                           revenueInOfferCurrency;
      totalRevenue += revenueInEUR;

      // Költségek EUR-ban
      const filamentCostEUR = offer.currency === "HUF" ? offer.costs.filamentCost / 400 : 
                              offer.currency === "USD" ? offer.costs.filamentCost / 1.10 : 
                              offer.costs.filamentCost;
      const electricityCostEUR = offer.currency === "HUF" ? offer.costs.electricityCost / 400 : 
                                  offer.currency === "USD" ? offer.costs.electricityCost / 1.10 : 
                                  offer.costs.electricityCost;
      const dryingCostEUR = offer.currency === "HUF" ? offer.costs.dryingCost / 400 : 
                           offer.currency === "USD" ? offer.costs.dryingCost / 1.10 : 
                           offer.costs.dryingCost;
      const usageCostEUR = offer.currency === "HUF" ? offer.costs.usageCost / 400 : 
                          offer.currency === "USD" ? offer.costs.usageCost / 1.10 : 
                          offer.costs.usageCost;

      totalCosts += filamentCostEUR + electricityCostEUR + dryingCostEUR + usageCostEUR;

      // Áram fogyasztás számítása kWh-ban
      // Az electricityCost EUR-ban van, konvertáljuk vissza HUF-ra, majd kWh-ra
      const electricityCostHUF = electricityCostEUR * 400;
      const electricityPriceHUF = settings.electricityPrice || 70;
      if (electricityPriceHUF > 0) {
        const electricityKWh = electricityCostHUF / electricityPriceHUF;
        totalElectricityKWh += electricityKWh;
      }

      // Száritás áram fogyasztás
      const dryingCostHUF = dryingCostEUR * 400;
      if (electricityPriceHUF > 0) {
        const dryingKWh = dryingCostHUF / electricityPriceHUF;
        totalElectricityKWh += dryingKWh;
      }

      // Nyomtatási idő
      totalPrintTime += offer.totalPrintTimeHours;
    });

    const totalProfit = totalRevenue - totalCosts;

    // Debug: console log a számításokhoz (csak development-ben)
    if (import.meta.env.DEV) {
      console.log('📊 Statisztika számítás:', {
        totalRevenue,
        totalCosts,
        totalProfit,
        offerCount: offers.length
      });
    }

    return {
      totalFilamentUsed,
      totalRevenue,
      totalElectricityConsumed: totalElectricityKWh,
      totalCosts,
      totalProfit,
      totalPrintTime,
      offerCount: offers.length
    };
  }, [offers, settings.electricityPrice]);

  const formatCurrency = (amount: number) => {
    return convertCurrency(amount, settings.currency);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const StatCard = ({ title, value, unit, icon, color }: { 
    title: string; 
    value: string | number; 
    unit?: string; 
    icon: string;
    color: string;
  }) => (
    <div style={{
      backgroundColor: theme.colors.surface,
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      border: `2px solid ${color}20`,
      transition: "transform 0.2s, box-shadow 0.2s",
      flex: "1",
      minWidth: "200px"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
    }}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <span style={{ fontSize: "32px", marginRight: "12px" }}>{icon}</span>
        <h3 style={{ margin: 0, fontSize: "14px", color: theme.colors.textSecondary, fontWeight: "500" }}>{title}</h3>
      </div>
      <div style={{ fontSize: "28px", fontWeight: "bold", color: color }}>
        {value} {unit && <span style={{ fontSize: "16px", color: theme.colors.textSecondary }}>{unit}</span>}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: theme.colors.text }}>
          {t("home.title")}
        </h2>
        <p style={{ marginTop: "8px", color: theme.colors.textSecondary, fontSize: "16px" }}>
          Statisztikák és összefoglaló az árajánlatokról
        </p>
      </div>

      {/* Statisztikai kártyák */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px",
        marginBottom: "30px"
      }}>
        <StatCard
          title="Összes filament fogyasztás"
          value={formatNumber(statistics.totalFilamentUsed / 1000, 2)}
          unit="kg"
          icon="🧵"
          color="#007bff"
        />
        <StatCard
          title="Összes bevétel"
          value={formatNumber(formatCurrency(statistics.totalRevenue), 2)}
          unit={settings.currency === "HUF" ? "Ft" : settings.currency}
          icon="💰"
          color="#28a745"
        />
        <StatCard
          title="Összes áram fogyasztás"
          value={formatNumber(statistics.totalElectricityConsumed, 2)}
          unit="kWh"
          icon="⚡"
          color="#ffc107"
        />
        <StatCard
          title="Összes költség"
          value={formatNumber(formatCurrency(statistics.totalCosts), 2)}
          unit={settings.currency === "HUF" ? "Ft" : settings.currency}
          icon="💸"
          color="#dc3545"
        />
        <StatCard
          title="Nettó profit"
          value={formatCurrency(statistics.totalProfit).toFixed(2)}
          unit={settings.currency === "HUF" ? "Ft" : settings.currency}
          icon="📈"
          color={statistics.totalProfit >= 0 ? "#28a745" : "#dc3545"}
        />
        <StatCard
          title="Összes nyomtatási idő"
          value={formatNumber(statistics.totalPrintTime, 1)}
          unit="óra"
          icon="⏱️"
          color="#6c757d"
        />
      </div>

      {/* További információ */}
      <div style={{
        backgroundColor: theme.colors.surface,
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px"
      }}>
        <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
          Összefoglaló
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>Árajánlatok száma:</strong>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: "#007bff", marginTop: "4px" }}>
              {statistics.offerCount}
            </div>
          </div>
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>Átlagos profit/árajánlat:</strong>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: statistics.totalProfit >= 0 ? "#28a745" : "#dc3545", marginTop: "4px" }}>
              {statistics.offerCount > 0 ? formatNumber(formatCurrency(statistics.totalProfit / statistics.offerCount), 2) : "0.00"} {settings.currency === "HUF" ? "Ft" : settings.currency}
            </div>
          </div>
          <div>
            <strong style={{ color: theme.colors.textSecondary }}>Profit margó:</strong>
            <div style={{ fontSize: "24px", fontWeight: "bold", color: statistics.totalProfit >= 0 ? "#28a745" : "#dc3545", marginTop: "4px" }}>
              {statistics.totalRevenue > 0 ? formatNumber((statistics.totalProfit / statistics.totalRevenue) * 100, 1) : "0.0"}%
            </div>
          </div>
        </div>
      </div>

      {/* Üres állapot */}
      {statistics.offerCount === 0 && (
        <div style={{
          backgroundColor: theme.colors.surfaceHover,
          borderRadius: "12px",
          padding: "40px",
          textAlign: "center",
          border: `2px dashed ${theme.colors.border}`
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
          <h3 style={{ margin: 0, marginBottom: "8px", color: theme.colors.text }}>
            Még nincsenek statisztikák
          </h3>
          <p style={{ margin: 0, color: "#6c757d" }}>
            Kezdj el árajánlatokat menteni a Kalkulátorban, hogy láthasd az összefoglaló statisztikákat!
          </p>
        </div>
      )}
    </div>
  );
};
