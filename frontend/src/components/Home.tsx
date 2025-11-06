import React, { useMemo, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";

interface Props {
  settings: Settings;
  offers: Offer[];
  theme: Theme;
}

export const Home: React.FC<Props> = ({ settings, offers, theme }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [reportPeriod, setReportPeriod] = useState<"all" | "week" | "month" | "year">("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  
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

  const handleExportStatistics = async () => {
    try {
      console.log("📊 Statisztikák export indítása...", { format: exportFormat, statistics });
      
      let content: string;
      let fileName: string;
      let filters: Array<{ name: string; extensions: string[] }>;

      if (exportFormat === "json") {
        const exportData = {
          exportDate: new Date().toISOString(),
          statistics: {
            totalFilamentUsed: statistics.totalFilamentUsed,
            totalFilamentUsedKg: statistics.totalFilamentUsed / 1000,
            totalRevenue: statistics.totalRevenue,
            totalElectricityConsumed: statistics.totalElectricityConsumed,
            totalCosts: statistics.totalCosts,
            totalProfit: statistics.totalProfit,
            totalPrintTime: statistics.totalPrintTime,
            offerCount: statistics.offerCount,
            averageProfitPerOffer: statistics.offerCount > 0 ? statistics.totalProfit / statistics.offerCount : 0,
            profitMargin: statistics.totalRevenue > 0 ? (statistics.totalProfit / statistics.totalRevenue) * 100 : 0,
          },
          currency: settings.currency,
          offers: offers.map(o => ({
            id: o.id,
            date: o.date,
            customerName: o.customerName,
            totalCost: o.costs.totalCost,
            profitPercentage: o.profitPercentage || 30,
            revenue: o.costs.totalCost * (1 + (o.profitPercentage || 30) / 100),
            currency: o.currency,
          })),
        };
        content = JSON.stringify(exportData, null, 2);
        fileName = `statistics_${new Date().toISOString().split("T")[0]}.json`;
        filters = [{ name: "JSON", extensions: ["json"] }];
      } else {
        // CSV formátum
        const csvRows: string[] = [];
        csvRows.push("Kategória,Érték,Egység");
        csvRows.push(`Összes filament fogyasztás,${(statistics.totalFilamentUsed / 1000).toFixed(2)},kg`);
        csvRows.push(`Összes bevétel,${formatCurrency(statistics.totalRevenue).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`Összes áram fogyasztás,${statistics.totalElectricityConsumed.toFixed(2)},kWh`);
        csvRows.push(`Összes költség,${formatCurrency(statistics.totalCosts).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`Nettó profit,${formatCurrency(statistics.totalProfit).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`Összes nyomtatási idő,${statistics.totalPrintTime.toFixed(1)},óra`);
        csvRows.push(`Árajánlatok száma,${statistics.offerCount},db`);
        csvRows.push(`Átlagos profit/árajánlat,${statistics.offerCount > 0 ? formatCurrency(statistics.totalProfit / statistics.offerCount).toFixed(2) : "0.00"},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`Profit margó,${statistics.totalRevenue > 0 ? ((statistics.totalProfit / statistics.totalRevenue) * 100).toFixed(1) : "0.0"},%`);
        csvRows.push("");
        csvRows.push("Árajánlat részletek");
        csvRows.push("ID,Dátum,Ügyfél név,Összes költség,Profit százalék,Bevétel,Pénznem");
        offers.forEach(o => {
          const profitPct = o.profitPercentage || 30;
          const revenue = o.costs.totalCost * (1 + profitPct / 100);
          csvRows.push(`${o.id},${o.date},${o.customerName || ""},${o.costs.totalCost.toFixed(2)},${profitPct},${revenue.toFixed(2)},${o.currency || "EUR"}`);
        });
        content = csvRows.join("\n");
        fileName = `statistics_${new Date().toISOString().split("T")[0]}.csv`;
        filters = [{ name: "CSV", extensions: ["csv"] }];
      }

      const filePath = await save({
        defaultPath: fileName,
        filters,
      });

      if (filePath) {
        console.log("💾 Statisztikák mentése...", { filePath, format: exportFormat });
        await writeTextFile(filePath, content);
        console.log("✅ Statisztikák export sikeres", { filePath, format: exportFormat });
        showToast(
          settings.language === "hu" ? "Statisztikák sikeresen exportálva" :
          settings.language === "de" ? "Statistiken erfolgreich exportiert" :
          "Statistics exported successfully",
          "success"
        );
      } else {
        console.log("ℹ️ Export megszakítva");
      }
    } catch (error) {
      console.error("❌ Statisztikák export hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt az export során" :
        settings.language === "de" ? "Fehler beim Export" :
        "Error exporting statistics",
        "error"
      );
    }
  };

  const generateReport = async () => {
    try {
      console.log("📊 Riport generálása...", { period: reportPeriod, statistics });
      
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date = now;
      
      switch (reportPeriod) {
        case "week":
          periodStart = new Date(now);
          periodStart.setDate(now.getDate() - 7);
          break;
        case "month":
          periodStart = new Date(now);
          periodStart.setMonth(now.getMonth() - 1);
          break;
        case "year":
          periodStart = new Date(now);
          periodStart.setFullYear(now.getFullYear() - 1);
          break;
        default:
          periodStart = new Date(0); // Minden időszak
      }

      const filteredOffers = offers.filter(o => {
        const offerDate = new Date(o.date);
        return offerDate >= periodStart && offerDate <= periodEnd;
      });

      // Számítások a szűrt árajánlatokra
      let reportFilamentUsed = 0;
      let reportRevenue = 0;
      let reportCosts = 0;
      let reportProfit = 0;
      let reportPrintTime = 0;

      filteredOffers.forEach(offer => {
        offer.filaments.forEach(f => {
          reportFilamentUsed += f.usedGrams;
        });
        const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30;
        const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
        const revenueInEUR = offer.currency === "HUF" ? revenueInOfferCurrency / 400 : 
                             offer.currency === "USD" ? revenueInOfferCurrency / 1.10 : 
                             revenueInOfferCurrency;
        reportRevenue += revenueInEUR;
        
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
        reportCosts += filamentCostEUR + electricityCostEUR + dryingCostEUR + usageCostEUR;
        reportPrintTime += offer.totalPrintTimeHours;
      });

      reportProfit = reportRevenue - reportCosts;

      const reportData = {
        reportDate: new Date().toISOString(),
        period: reportPeriod,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
        summary: {
          offerCount: filteredOffers.length,
          totalFilamentUsed: reportFilamentUsed,
          totalFilamentUsedKg: reportFilamentUsed / 1000,
          totalRevenue: reportRevenue,
          totalCosts: reportCosts,
          totalProfit: reportProfit,
          totalPrintTime: reportPrintTime,
          averageProfitPerOffer: filteredOffers.length > 0 ? reportProfit / filteredOffers.length : 0,
          profitMargin: reportRevenue > 0 ? (reportProfit / reportRevenue) * 100 : 0,
        },
        currency: settings.currency,
        offers: filteredOffers.map(o => ({
          id: o.id,
          date: o.date,
          customerName: o.customerName,
          printerName: o.printerName,
          totalCost: o.costs.totalCost,
          profitPercentage: o.profitPercentage || 30,
          revenue: o.costs.totalCost * (1 + (o.profitPercentage || 30) / 100),
          currency: o.currency,
        })),
      };

      const content = JSON.stringify(reportData, null, 2);
      const periodLabel = reportPeriod === "week" ? "heti" : reportPeriod === "month" ? "havi" : reportPeriod === "year" ? "eves" : "osszes";
      const fileName = `report_${periodLabel}_${new Date().toISOString().split("T")[0]}.json`;

      const filePath = await save({
        defaultPath: fileName,
        filters: [{ name: "JSON", extensions: ["json"] }],
      });

      if (filePath) {
        console.log("💾 Riport mentése...", { filePath, period: reportPeriod });
        await writeTextFile(filePath, content);
        console.log("✅ Riport generálás sikeres", { filePath, period: reportPeriod });
        showToast(
          settings.language === "hu" ? "Riport sikeresen generálva" :
          settings.language === "de" ? "Bericht erfolgreich generiert" :
          "Report generated successfully",
          "success"
        );
        setShowReportDialog(false);
      } else {
        console.log("ℹ️ Riport generálás megszakítva");
      }
    } catch (error) {
      console.error("❌ Riport generálás hiba:", error);
      showToast(
        settings.language === "hu" ? "Hiba történt a riport generálása során" :
        settings.language === "de" ? "Fehler beim Generieren des Berichts" :
        "Error generating report",
        "error"
      );
    }
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
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "32px", fontWeight: "bold", color: theme.colors.text }}>
            {t("home.title")}
          </h2>
          <p style={{ marginTop: "8px", color: theme.colors.textSecondary, fontSize: "16px" }}>
            Statisztikák és összefoglaló az árajánlatokról
          </p>
        </div>
        {statistics.offerCount > 0 && (
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <Tooltip content={settings.language === "hu" ? "Riport generálása" : settings.language === "de" ? "Bericht generieren" : "Generate report"}>
              <button
                onClick={() => setShowReportDialog(true)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#28a745",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s, transform 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#218838";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#28a745";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                📈 {settings.language === "hu" ? "Riport" : settings.language === "de" ? "Bericht" : "Report"}
              </button>
            </Tooltip>
            <select
              value={exportFormat}
              onChange={e => setExportFormat(e.target.value as "json" | "csv")}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border: `1px solid ${theme.colors.border}`,
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
            <Tooltip content={settings.language === "hu" ? "Statisztikák exportálása" : settings.language === "de" ? "Statistiken exportieren" : "Export statistics"}>
              <button
                onClick={handleExportStatistics}
                style={{
                  padding: "10px 20px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "background-color 0.2s, transform 0.2s",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#0056b3";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#007bff";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                📊 {settings.language === "hu" ? "Export" : settings.language === "de" ? "Exportieren" : "Export"}
              </button>
            </Tooltip>
          </div>
        )}
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

      {/* Riport generálás dialógus */}
      {showReportDialog && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          zIndex: 2000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px"
        }}>
          <div style={{
            backgroundColor: theme.colors.surface,
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
          }}>
            <h3 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600", color: theme.colors.text }}>
              📈 {settings.language === "hu" ? "Riport generálása" : settings.language === "de" ? "Bericht generieren" : "Generate report"}
            </h3>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                {settings.language === "hu" ? "Időszak" : settings.language === "de" ? "Zeitraum" : "Period"}
              </label>
              <select
                value={reportPeriod}
                onChange={e => setReportPeriod(e.target.value as "all" | "week" | "month" | "year")}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="all">{settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All"}</option>
                <option value="week">{settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week"}</option>
                <option value="month">{settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month"}</option>
                <option value="year">{settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year"}</option>
              </select>
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowReportDialog(false)}
                style={{
                  padding: "10px 20px",
                  borderRadius: "6px",
                  border: `1px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                {settings.language === "hu" ? "Mégse" : settings.language === "de" ? "Abbrechen" : "Cancel"}
              </button>
              <Tooltip content={settings.language === "hu" ? "Riport generálása és mentése" : settings.language === "de" ? "Bericht generieren und speichern" : "Generate and save report"}>
                <button
                  onClick={generateReport}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  📈 {settings.language === "hu" ? "Generálás" : settings.language === "de" ? "Generieren" : "Generate"}
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
