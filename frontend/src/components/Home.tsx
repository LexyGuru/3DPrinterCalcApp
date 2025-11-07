import React, { useMemo, useState } from "react";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import type { Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { convertCurrency } from "../utils/currency";
import { useToast } from "./Toast";
import { Tooltip } from "./Tooltip";
import { FadeIn, StaggerContainer, StaggerItem, HoverLift } from "../utils/animations";

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
  const [selectedPeriod, setSelectedPeriod] = useState<"all" | "week" | "month" | "year">("all");
  
  // Helper függvény az időszak szűréséhez
  const filterOffersByPeriod = (offers: Offer[], period: "all" | "week" | "month" | "year") => {
    if (period === "all") return offers;
    
    const now = new Date();
    // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
    now.setHours(0, 0, 0, 0);
    const cutoffDate = new Date();
    cutoffDate.setHours(0, 0, 0, 0);
    
    switch (period) {
      case "week":
        // Utolsó 7 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 6);
        break;
      case "month":
        // Utolsó 30 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 29);
        break;
      case "year":
        // Utolsó 365 nap (ma is beleszámít)
        cutoffDate.setDate(now.getDate() - 364);
        break;
    }
    
    return offers.filter(offer => {
      const offerDate = new Date(offer.date);
      // Állítsuk be az időt 00:00:00-ra a pontos összehasonlításhoz
      offerDate.setHours(0, 0, 0, 0);
      return offerDate >= cutoffDate && offerDate <= now;
    });
  };
  
  // Statisztikák számítása
  const calculateStatistics = (offersToCalculate: Offer[]) => {
    if (offersToCalculate.length === 0) {
      return {
        totalFilamentUsed: 0,
        totalRevenue: 0,
        totalElectricityConsumed: 0,
        totalCosts: 0,
        totalProfit: 0,
        totalPrintTime: 0,
        offerCount: 0
      };
    }

    let totalFilamentUsed = 0;
    let totalRevenue = 0;
    let totalElectricityKWh = 0;
    let totalCosts = 0;
    let totalPrintTime = 0;

    offersToCalculate.forEach(offer => {
      offer.filaments.forEach(f => {
        totalFilamentUsed += f.usedGrams;
      });

      const profitPercentage = offer.profitPercentage !== undefined ? offer.profitPercentage : 30;
      const revenueInOfferCurrency = offer.costs.totalCost * (1 + profitPercentage / 100);
      const revenueInEUR = offer.currency === "HUF" ? revenueInOfferCurrency / 400 : 
                           offer.currency === "USD" ? revenueInOfferCurrency / 1.10 : 
                           revenueInOfferCurrency;
      totalRevenue += revenueInEUR;

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

      const electricityCostHUF = electricityCostEUR * 400;
      const electricityPriceHUF = settings.electricityPrice || 70;
      if (electricityPriceHUF > 0) {
        const electricityKWh = electricityCostHUF / electricityPriceHUF;
        totalElectricityKWh += electricityKWh;
      }

      const dryingCostHUF = dryingCostEUR * 400;
      if (electricityPriceHUF > 0) {
        const dryingKWh = dryingCostHUF / electricityPriceHUF;
        totalElectricityKWh += dryingKWh;
      }

      totalPrintTime += offer.totalPrintTimeHours;
    });

    const totalProfit = totalRevenue - totalCosts;

    return {
      totalFilamentUsed,
      totalRevenue,
      totalElectricityConsumed: totalElectricityKWh,
      totalCosts,
      totalProfit,
      totalPrintTime,
      offerCount: offersToCalculate.length
    };
  };
  
  const statistics = useMemo(() => {
    return calculateStatistics(offers);
  }, [offers, settings.electricityPrice]);
  
  // Időszak szerinti statisztikák
  const weeklyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "week"));
  }, [offers, settings.electricityPrice]);
  
  const monthlyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "month"));
  }, [offers, settings.electricityPrice]);
  
  const yearlyStats = useMemo(() => {
    return calculateStatistics(filterOffersByPeriod(offers, "year"));
  }, [offers, settings.electricityPrice]);
  
  // Aktuális statisztikák a kiválasztott időszak alapján
  const currentStats = useMemo(() => {
    const filteredOffers = filterOffersByPeriod(offers, selectedPeriod);
    return calculateStatistics(filteredOffers);
  }, [offers, selectedPeriod, settings.electricityPrice]);
  

  const formatCurrency = (amount: number) => {
    return convertCurrency(amount, settings.currency);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const handleExportStatistics = async () => {
    try {
      const statsToExport = currentStats;
      console.log("📊 Statisztikák export indítása...", { format: exportFormat, statistics: statsToExport, period: selectedPeriod });
      
      let content: string;
      let fileName: string;
      let filters: Array<{ name: string; extensions: string[] }>;

      if (exportFormat === "json") {
        const exportData = {
          exportDate: new Date().toISOString(),
          period: selectedPeriod,
          statistics: {
            totalFilamentUsed: statsToExport.totalFilamentUsed,
            totalFilamentUsedKg: statsToExport.totalFilamentUsed / 1000,
            totalRevenue: statsToExport.totalRevenue,
            totalElectricityConsumed: statsToExport.totalElectricityConsumed,
            totalCosts: statsToExport.totalCosts,
            totalProfit: statsToExport.totalProfit,
            totalPrintTime: statsToExport.totalPrintTime,
            offerCount: statsToExport.offerCount,
            averageProfitPerOffer: statsToExport.offerCount > 0 ? statsToExport.totalProfit / statsToExport.offerCount : 0,
            profitMargin: statsToExport.totalRevenue > 0 ? (statsToExport.totalProfit / statsToExport.totalRevenue) * 100 : 0,
          },
          periodStats: {
            weekly: weeklyStats,
            monthly: monthlyStats,
            yearly: yearlyStats,
            all: statistics,
          },
          currency: settings.currency,
          offers: filterOffersByPeriod(offers, selectedPeriod).map(o => ({
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
        const categoryLabel = settings.language === "hu" ? "Kategória" : settings.language === "de" ? "Kategorie" : "Category";
        const valueLabel = settings.language === "hu" ? "Érték" : settings.language === "de" ? "Wert" : "Value";
        const unitLabel = settings.language === "hu" ? "Egység" : settings.language === "de" ? "Einheit" : "Unit";
        csvRows.push(`${categoryLabel},${valueLabel},${unitLabel}`);
        const filamentLabel = settings.language === "hu" ? "Összes filament fogyasztás" : settings.language === "de" ? "Gesamter Filamentverbrauch" : "Total filament consumption";
        const revenueLabel = settings.language === "hu" ? "Összes bevétel" : settings.language === "de" ? "Gesamteinnahmen" : "Total revenue";
        const electricityLabel = settings.language === "hu" ? "Összes áram fogyasztás" : settings.language === "de" ? "Gesamter Stromverbrauch" : "Total electricity consumption";
        const costLabel = settings.language === "hu" ? "Összes költség" : settings.language === "de" ? "Gesamtkosten" : "Total cost";
        const profitLabel = settings.language === "hu" ? "Nettó profit" : settings.language === "de" ? "Nettogewinn" : "Net profit";
        const printTimeLabel = settings.language === "hu" ? "Összes nyomtatási idő" : settings.language === "de" ? "Gesamtdruckzeit" : "Total print time";
        const offerCountLabel = settings.language === "hu" ? "Árajánlatok száma" : settings.language === "de" ? "Anzahl der Angebote" : "Number of offers";
        const avgProfitLabel = settings.language === "hu" ? "Átlagos profit/árajánlat" : settings.language === "de" ? "Durchschnittlicher Gewinn/Angebot" : "Average profit/offer";
        const profitMarginLabel = settings.language === "hu" ? "Profit margó" : settings.language === "de" ? "Gewinnmarge" : "Profit margin";
        const timeUnit = settings.language === "hu" ? "óra" : settings.language === "de" ? "Std" : "hrs";
        
        csvRows.push(`${filamentLabel},${(statsToExport.totalFilamentUsed / 1000).toFixed(2)},kg`);
        csvRows.push(`${revenueLabel},${formatCurrency(statsToExport.totalRevenue).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${electricityLabel},${statsToExport.totalElectricityConsumed.toFixed(2)},kWh`);
        csvRows.push(`${costLabel},${formatCurrency(statsToExport.totalCosts).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${profitLabel},${formatCurrency(statsToExport.totalProfit).toFixed(2)},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${printTimeLabel},${statsToExport.totalPrintTime.toFixed(1)},${timeUnit}`);
        csvRows.push(`${offerCountLabel},${statsToExport.offerCount},${settings.language === "hu" ? "db" : settings.language === "de" ? "Stk" : "pcs"}`);
        csvRows.push(`${avgProfitLabel},${statsToExport.offerCount > 0 ? formatCurrency(statsToExport.totalProfit / statsToExport.offerCount).toFixed(2) : "0.00"},${settings.currency === "HUF" ? "Ft" : settings.currency}`);
        csvRows.push(`${profitMarginLabel},${statsToExport.totalRevenue > 0 ? ((statsToExport.totalProfit / statsToExport.totalRevenue) * 100).toFixed(1) : "0.0"},%`);
        csvRows.push("");
        const offerDetailsLabel = settings.language === "hu" ? "Árajánlat részletek" : settings.language === "de" ? "Angebotsdetails" : "Offer details";
        csvRows.push(offerDetailsLabel);
        const idLabel = settings.language === "hu" ? "ID" : "ID";
        const dateLabel = settings.language === "hu" ? "Dátum" : settings.language === "de" ? "Datum" : "Date";
        const customerLabel = settings.language === "hu" ? "Ügyfél név" : settings.language === "de" ? "Kundenname" : "Customer name";
        const totalCostLabel = settings.language === "hu" ? "Összes költség" : settings.language === "de" ? "Gesamtkosten" : "Total cost";
        const profitPercentLabel = settings.language === "hu" ? "Profit százalék" : settings.language === "de" ? "Gewinnprozentsatz" : "Profit percentage";
        const revenueLabel2 = settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue";
        const currencyLabel = settings.language === "hu" ? "Pénznem" : settings.language === "de" ? "Währung" : "Currency";
        
        csvRows.push(`${idLabel},${dateLabel},${customerLabel},${totalCostLabel},${profitPercentLabel},${revenueLabel2},${currencyLabel}`);
        filterOffersByPeriod(offers, selectedPeriod).forEach(o => {
          const profitPct = o.profitPercentage || 30;
          const revenue = o.costs.totalCost * (1 + profitPct / 100);
          csvRows.push(`${o.id},${o.date},${o.customerName || ""},${o.costs.totalCost.toFixed(2)},${profitPct},${revenue.toFixed(2)},${o.currency || "EUR"}`);
        });
        csvRows.push("");
        const periodLabel = settings.language === "hu" ? "Időszak" : settings.language === "de" ? "Zeitraum" : "Period";
        csvRows.push(`${periodLabel}: ${selectedPeriod === "all" ? (settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All") : selectedPeriod === "week" ? (settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week") : selectedPeriod === "month" ? (settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month") : (settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year")}`);
        
        content = csvRows.join("\n");
        fileName = `statistics_${selectedPeriod}_${new Date().toISOString().split("T")[0]}.csv`;
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

  const StatCard = ({ title, value, unit, icon, color, delay = 0 }: { 
    title: string; 
    value: string | number; 
    unit?: string; 
    icon: string;
    color: string;
    delay?: number;
  }) => {
    const isGradientBackground = theme.colors.background?.includes('gradient');
    const cardBg = isGradientBackground 
      ? "rgba(255, 255, 255, 0.98)" 
      : theme.colors.surface;
    
    return (
      <FadeIn delay={delay} duration={0.5}>
        <HoverLift>
          <div style={{
            backgroundColor: cardBg,
            borderRadius: "20px",
            padding: "28px",
            boxShadow: isGradientBackground
              ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
              : `0 4px 16px ${theme.colors.shadow}`,
            border: `2px solid ${color}40`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            flex: "1",
            minWidth: "200px",
            position: "relative",
            overflow: "hidden",
            backdropFilter: isGradientBackground ? "blur(10px)" : "none",
          }}>
            {/* Szín accent sáv */}
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "4px",
              backgroundColor: color,
              borderRadius: "20px 20px 0 0",
            }} />
            
            <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: `${color}15`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "12px",
                fontSize: "24px",
              }}>
                {icon}
              </div>
              <h3 style={{ 
                margin: 0, 
                fontSize: "13px", 
                color: isGradientBackground ? "#1a202c" : theme.colors.textSecondary, 
                fontWeight: "700",
                lineHeight: "1.4",
              }}>
                {title}
              </h3>
            </div>
            <div style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: color,
              lineHeight: "1.2",
              marginBottom: "4px",
            }}>
              {value}
            </div>
            {unit && (
              <div style={{ 
                fontSize: "14px", 
                color: isGradientBackground ? "#4a5568" : theme.colors.textMuted,
                fontWeight: "600",
              }}>
                {unit}
              </div>
            )}
          </div>
        </HoverLift>
      </FadeIn>
    );
  };

  return (
    <div>
      <FadeIn delay={0.1}>
        <div style={{ marginBottom: "30px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h2 style={{ 
              margin: 0, 
              fontSize: "36px", 
              fontWeight: "700",
              color: theme.colors.background?.includes('gradient')
                ? "#ffffff"
                : theme.colors.text,
              textShadow: theme.colors.background?.includes('gradient')
                ? "0 2px 8px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)"
                : "none",
            }}>
              {t("home.title")}
            </h2>
            <p style={{ 
              marginTop: "8px", 
              color: theme.colors.background?.includes('gradient')
                ? "#ffffff"
                : theme.colors.textSecondary,
              fontSize: "16px",
              textShadow: theme.colors.background?.includes('gradient')
                ? "0 1px 4px rgba(0,0,0,0.4)"
                : "none",
            }}>
              {settings.language === "hu" ? "Statisztikák és összefoglaló az árajánlatokról" : settings.language === "de" ? "Statistiken und Zusammenfassung der Angebote" : "Statistics and summary of offers"}
            </p>
          </div>
        {statistics.offerCount > 0 && (
          <div style={{ 
            display: "flex", 
            gap: "16px", 
            alignItems: "center", 
            flexWrap: "wrap",
            padding: "16px 20px",
            marginBottom: "24px",
            backgroundColor: theme.colors.surface,
            border: `1px solid ${theme.colors.border}`,
            borderRadius: "12px",
            boxShadow: `0 2px 8px ${theme.colors.shadow}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}>
            {/* Időszak választó */}
            <div style={{ 
              display: "flex", 
              gap: "12px", 
              alignItems: "center", 
              flexWrap: "wrap",
              flex: "1",
              minWidth: "200px"
            }}>
              <label style={{ 
                fontSize: "14px", 
                fontWeight: "700",
                color: theme.colors.text,
                whiteSpace: "nowrap",
              }}>
                {settings.language === "hu" ? "Időszak:" : settings.language === "de" ? "Zeitraum:" : "Period:"}
              </label>
              <div style={{ 
                display: "flex", 
                gap: "6px", 
                backgroundColor: theme.colors.surfaceHover,
                borderRadius: "10px", 
                padding: "6px", 
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `inset 0 1px 3px ${theme.colors.shadow}`,
              }}>
                {(["all", "week", "month", "year"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      border: "none",
                      backgroundColor: selectedPeriod === period 
                        ? theme.colors.primary 
                        : "transparent",
                      color: selectedPeriod === period 
                        ? "#fff" 
                        : theme.colors.text,
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      boxShadow: selectedPeriod === period 
                        ? `0 2px 8px ${theme.colors.shadow}` 
                        : "none",
                      transform: selectedPeriod === period ? "scale(1.02)" : "scale(1)",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedPeriod !== period) {
                        e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                        e.currentTarget.style.transform = "scale(1.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedPeriod !== period) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }
                    }}
                  >
                    {period === "all" ? (settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All") :
                     period === "week" ? (settings.language === "hu" ? "Hét" : settings.language === "de" ? "Woche" : "Week") :
                     period === "month" ? (settings.language === "hu" ? "Hónap" : settings.language === "de" ? "Monat" : "Month") :
                     (settings.language === "hu" ? "Év" : settings.language === "de" ? "Jahr" : "Year")}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Gombok csoport */}
            <div style={{ 
              display: "flex", 
              gap: "10px", 
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              <Tooltip content={settings.language === "hu" ? "Riport generálása" : settings.language === "de" ? "Bericht generieren" : "Generate report"}>
                <button
                  onClick={() => setShowReportDialog(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: theme.colors.success,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.successHover;
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.success;
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📈</span>
                  <span>{settings.language === "hu" ? "Riport" : settings.language === "de" ? "Bericht" : "Report"}</span>
                </button>
              </Tooltip>
              
              <select
                value={exportFormat}
                onChange={e => setExportFormat(e.target.value as "json" | "csv")}
                style={{
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: `2px solid ${theme.colors.border}`,
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  boxShadow: `0 2px 4px ${theme.colors.shadow}`,
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.primary;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = theme.colors.border;
                  e.currentTarget.style.boxShadow = `0 2px 4px ${theme.colors.shadow}`;
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
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: theme.colors.primary,
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "700",
                    cursor: "pointer",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
                    e.currentTarget.style.transform = "translateY(-2px) scale(1.02)";
                    e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary;
                    e.currentTarget.style.transform = "translateY(0) scale(1)";
                    e.currentTarget.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
                  }}
                >
                  <span style={{ fontSize: "16px" }}>📊</span>
                  <span>{settings.language === "hu" ? "Export" : settings.language === "de" ? "Exportieren" : "Export"}</span>
                </button>
              </Tooltip>
            </div>
          </div>
        )}
        </div>
      </FadeIn>

      {/* Időszak összehasonlító kártyák */}
      {statistics.offerCount > 0 && (
        <FadeIn delay={0.2}>
          <div style={{
            backgroundColor: theme.colors.background?.includes('gradient') 
              ? "rgba(255, 255, 255, 0.75)" 
              : theme.colors.surface,
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "30px",
            boxShadow: theme.colors.background?.includes('gradient')
              ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
              : `0 4px 16px ${theme.colors.shadow}`,
            border: `1px solid ${theme.colors.border}`,
            backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
            opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: "20px", 
              fontSize: "20px", 
              fontWeight: "700",
              color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}>
              <span style={{ fontSize: "24px" }}>📊</span>
              {settings.language === "hu" ? "Időszak összehasonlítás" : settings.language === "de" ? "Zeitraum Vergleich" : "Period Comparison"}
            </h3>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              {[
                { label: settings.language === "hu" ? "Heti" : settings.language === "de" ? "Wöchentlich" : "Weekly", stats: weeklyStats, icon: "📅", color: "#4299e1" },
                { label: settings.language === "hu" ? "Havi" : settings.language === "de" ? "Monatlich" : "Monthly", stats: monthlyStats, icon: "📆", color: "#48bb78" },
                { label: settings.language === "hu" ? "Éves" : settings.language === "de" ? "Jährlich" : "Yearly", stats: yearlyStats, icon: "📊", color: "#667eea" },
              ].map((period, index) => (
                <div key={index} style={{
                  padding: "20px",
                  borderRadius: "16px",
                  backgroundColor: theme.colors.background?.includes('gradient')
                    ? "rgba(255, 255, 255, 0.65)"
                    : theme.colors.surfaceHover,
                  border: `2px solid ${period.color}30`,
                  transition: "all 0.3s",
                  position: "relative",
                  overflow: "hidden",
                  backdropFilter: theme.colors.background?.includes('gradient') ? "blur(10px)" : "none",
                  opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
                }}>
                  <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    backgroundColor: period.color,
                  }} />
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    marginBottom: "12px",
                  }}>
                    <span style={{ fontSize: "20px" }}>{period.icon}</span>
                    <div style={{ 
                      fontSize: "13px", 
                      color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textMuted,
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}>
                      {period.label}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: "28px", 
                    fontWeight: "700", 
                    color: period.color,
                    marginBottom: "8px",
                    lineHeight: "1.2",
                  }}>
                    {formatCurrency(period.stats.totalProfit).toFixed(2)}
                  </div>
                  <div style={{ 
                    fontSize: "13px", 
                    color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textMuted,
                    fontWeight: "600",
                  }}>
                    {period.stats.offerCount} {settings.language === "hu" ? "árajánlat" : settings.language === "de" ? "Angebote" : "offers"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Statisztikai kártyák */}
      <StaggerContainer delay={0.05}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
          marginBottom: "30px"
        }}>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Összes filament fogyasztás" : settings.language === "de" ? "Gesamter Filamentverbrauch" : "Total filament consumption"}
              value={formatNumber(currentStats.totalFilamentUsed / 1000, 2)}
              unit="kg"
              icon="🧵"
              color="#007bff"
              delay={0}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Összes bevétel" : settings.language === "de" ? "Gesamteinnahmen" : "Total revenue"}
              value={formatNumber(formatCurrency(currentStats.totalRevenue), 2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="💰"
              color="#28a745"
              delay={0.1}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Összes áram fogyasztás" : settings.language === "de" ? "Gesamter Stromverbrauch" : "Total electricity consumption"}
              value={formatNumber(currentStats.totalElectricityConsumed, 2)}
              unit="kWh"
              icon="⚡"
              color="#ffc107"
              delay={0.2}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Összes költség" : settings.language === "de" ? "Gesamtkosten" : "Total cost"}
              value={formatNumber(formatCurrency(currentStats.totalCosts), 2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="💸"
              color="#dc3545"
              delay={0.3}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Nettó profit" : settings.language === "de" ? "Nettogewinn" : "Net profit"}
              value={formatCurrency(currentStats.totalProfit).toFixed(2)}
              unit={settings.currency === "HUF" ? "Ft" : settings.currency}
              icon="📈"
              color={currentStats.totalProfit >= 0 ? "#28a745" : "#dc3545"}
              delay={0.4}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={settings.language === "hu" ? "Összes nyomtatási idő" : settings.language === "de" ? "Gesamtdruckzeit" : "Total print time"}
              value={formatNumber(currentStats.totalPrintTime, 1)}
              unit={settings.language === "hu" ? "óra" : settings.language === "de" ? "Std" : "hrs"}
              icon="⏱️"
              color="#6c757d"
              delay={0.5}
            />
          </StaggerItem>
        </div>
      </StaggerContainer>

      {/* További információ */}
      <div style={{
        backgroundColor: theme.colors.background?.includes('gradient')
          ? "rgba(255, 255, 255, 0.75)"
          : theme.colors.surface,
        borderRadius: "20px",
        padding: "28px",
        boxShadow: theme.colors.background?.includes('gradient')
          ? `0 8px 24px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)`
          : `0 4px 16px ${theme.colors.shadow}`,
        marginBottom: "20px",
        border: `1px solid ${theme.colors.border}`,
        backdropFilter: theme.colors.background?.includes('gradient') ? "blur(12px)" : "none",
        opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
      }}>
        <h3 style={{ 
          marginTop: 0, 
          marginBottom: "20px", 
          fontSize: "22px", 
          fontWeight: "700",
          color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ fontSize: "24px" }}>📋</span>
          {settings.language === "hu" ? "Összefoglaló" : settings.language === "de" ? "Zusammenfassung" : "Summary"}
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px" }}>
          {[
            { 
              label: settings.language === "hu" ? "Árajánlatok száma" : settings.language === "de" ? "Anzahl der Angebote" : "Number of offers",
              value: currentStats.offerCount.toString(),
              color: theme.colors.primary,
              icon: "📋"
            },
            { 
              label: settings.language === "hu" ? "Átlagos profit/árajánlat" : settings.language === "de" ? "Durchschnittlicher Gewinn/Angebot" : "Average profit/offer",
              value: `${currentStats.offerCount > 0 ? formatNumber(formatCurrency(currentStats.totalProfit / currentStats.offerCount), 2) : "0.00"} ${settings.currency === "HUF" ? "Ft" : settings.currency}`,
              color: currentStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
              icon: "💰"
            },
            { 
              label: settings.language === "hu" ? "Profit margó" : settings.language === "de" ? "Gewinnmarge" : "Profit margin",
              value: `${currentStats.totalRevenue > 0 ? formatNumber((currentStats.totalProfit / currentStats.totalRevenue) * 100, 1) : "0.0"}%`,
              color: currentStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
              icon: "📈"
            },
          ].map((item, index) => (
            <div key={index} style={{
              padding: "20px",
              borderRadius: "16px",
              backgroundColor: theme.colors.background?.includes('gradient')
                ? "rgba(255, 255, 255, 0.65)"
                : theme.colors.surfaceHover,
              border: `2px solid ${item.color}30`,
              transition: "all 0.3s",
              backdropFilter: theme.colors.background?.includes('gradient') ? "blur(10px)" : "none",
              opacity: theme.colors.background?.includes('gradient') ? 0.85 : 1,
            }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                marginBottom: "12px",
              }}>
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                <strong style={{ 
                  fontSize: "14px",
                  color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.textSecondary,
                  fontWeight: "700",
                }}>
                  {item.label}
                </strong>
              </div>
              <div style={{ 
                fontSize: "28px", 
                fontWeight: "700", 
                color: item.color,
                lineHeight: "1.2",
              }}>
                {item.value}
              </div>
            </div>
          ))}
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
          <h3 style={{ 
            margin: 0, 
            marginBottom: "8px", 
            color: theme.colors.background?.includes('gradient') ? "#ffffff" : theme.colors.text,
            textShadow: theme.colors.background?.includes('gradient') ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
          }}>
            Még nincsenek statisztikák
          </h3>
          <p style={{ 
            margin: 0, 
            color: theme.colors.background?.includes('gradient') ? "#4a5568" : "#6c757d",
            fontSize: "14px",
            fontWeight: "500",
          }}>
            Kezdj el árajánlatokat menteni a Kalkulátorban, hogy láthasd az összefoglaló statisztikákat!
          </p>
        </div>
      )}

      {/* Riport generálás dialógus */}
      {showReportDialog && (() => {
        const filteredOffers = filterOffersByPeriod(offers, reportPeriod);
        const reportStats = calculateStatistics(filteredOffers);
        const periodLabel = reportPeriod === "all" 
          ? (settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All")
          : reportPeriod === "week"
          ? (settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week")
          : reportPeriod === "month"
          ? (settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month")
          : (settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year");
        
        return (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.7)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            overflowY: "auto"
          }}
          onClick={() => setShowReportDialog(false)}
          >
            <div style={{
              backgroundColor: theme.colors.surface,
              borderRadius: "16px",
              padding: "32px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              border: `1px solid ${theme.colors.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Fejléc */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "32px",
                paddingBottom: "20px",
                borderBottom: `2px solid ${theme.colors.border}`
              }}>
                <div>
                  <h2 style={{ 
                    margin: 0, 
                    marginBottom: "8px",
                    fontSize: "28px", 
                    fontWeight: "700", 
                    color: theme.colors.text,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    <span style={{ fontSize: "32px" }}>📊</span>
                    {settings.language === "hu" ? "Statisztikai Riport" : settings.language === "de" ? "Statistikbericht" : "Statistics Report"}
                  </h2>
                  <p style={{ 
                    margin: 0,
                    fontSize: "14px",
                    color: theme.colors.textMuted
                  }}>
                    {periodLabel} • {new Date().toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US")}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportDialog(false)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor: theme.colors.surfaceHover,
                    color: theme.colors.text,
                    fontSize: "20px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.danger;
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                    e.currentTarget.style.color = theme.colors.text;
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Időszak választó */}
              <div style={{ marginBottom: "32px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "12px", 
                  fontSize: "14px", 
                  fontWeight: "700", 
                  color: theme.colors.text
                }}>
                  {settings.language === "hu" ? "Időszak" : settings.language === "de" ? "Zeitraum" : "Period"}
                </label>
                <select
                  value={reportPeriod}
                  onChange={e => setReportPeriod(e.target.value as "all" | "week" | "month" | "year")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}30`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <option value="all">{settings.language === "hu" ? "Összes" : settings.language === "de" ? "Alle" : "All"}</option>
                  <option value="week">{settings.language === "hu" ? "Utolsó hét" : settings.language === "de" ? "Letzte Woche" : "Last week"}</option>
                  <option value="month">{settings.language === "hu" ? "Utolsó hónap" : settings.language === "de" ? "Letzter Monat" : "Last month"}</option>
                  <option value="year">{settings.language === "hu" ? "Utolsó év" : settings.language === "de" ? "Letztes Jahr" : "Last year"}</option>
                </select>
              </div>

              {/* Fő statisztikák kártyák */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px"
              }}>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.success,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalRevenue), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.danger,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalCosts), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: reportStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
                    lineHeight: "1.2"
                  }}>
                    {formatNumber(formatCurrency(reportStats.totalProfit), 2)}
                  </div>
                </div>
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "20px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <div style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: theme.colors.textMuted,
                    marginBottom: "8px"
                  }}>
                    {settings.language === "hu" ? "Árajánlatok" : settings.language === "de" ? "Angebote" : "Offers"}
                  </div>
                  <div style={{ 
                    fontSize: "20px", 
                    fontWeight: "700", 
                    color: theme.colors.primary,
                    lineHeight: "1.2"
                  }}>
                    {reportStats.offerCount}
                  </div>
                </div>
              </div>

              {/* Grafikon: Bevétel vs Kiadás */}
              {reportStats.totalRevenue > 0 && (
                <div style={{
                  backgroundColor: theme.colors.surfaceHover,
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "32px",
                  border: `1px solid ${theme.colors.border}`,
                  boxShadow: `0 2px 8px ${theme.colors.shadow}`
                }}>
                  <h3 style={{ 
                    margin: 0, 
                    marginBottom: "20px",
                    fontSize: "18px", 
                    fontWeight: "700", 
                    color: theme.colors.text
                  }}>
                    📈 {settings.language === "hu" ? "Bevétel vs Kiadás" : settings.language === "de" ? "Einnahmen vs Ausgaben" : "Revenue vs Costs"}
                  </h3>
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", height: "220px", position: "relative" }}>
                    {/* Bevétel oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalRevenue), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: theme.colors.success,
                        borderRadius: "8px 8px 0 0",
                        height: "100%",
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Bevétel" : settings.language === "de" ? "Einnahmen" : "Revenue"}
                      </div>
                    </div>
                    {/* Kiadás oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalCosts), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: theme.colors.danger,
                        borderRadius: "8px 8px 0 0",
                        height: `${Math.max(30, (reportStats.totalCosts / reportStats.totalRevenue) * 100)}%`,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Kiadás" : settings.language === "de" ? "Ausgaben" : "Costs"}
                      </div>
                    </div>
                    {/* Profit oszlop */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                      {/* Érték az oszlop felett */}
                      <div style={{ 
                        position: "absolute",
                        top: "-40px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        color: theme.colors.text,
                        fontWeight: "700",
                        fontSize: "14px",
                        whiteSpace: "nowrap",
                        textAlign: "center",
                        backgroundColor: theme.colors.surface,
                        padding: "4px 8px",
                        borderRadius: "6px",
                        boxShadow: `0 2px 4px ${theme.colors.shadow}`
                      }}>
                        {formatNumber(formatCurrency(reportStats.totalProfit), 2)}
                      </div>
                      <div style={{
                        width: "100%",
                        backgroundColor: reportStats.totalProfit >= 0 ? theme.colors.success : theme.colors.danger,
                        borderRadius: "8px 8px 0 0",
                        height: `${Math.max(30, Math.abs((reportStats.totalProfit / reportStats.totalRevenue) * 100))}%`,
                        display: "flex",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        padding: "12px 4px",
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        position: "relative"
                      }}>
                        <div style={{ 
                          color: "#fff", 
                          fontWeight: "700", 
                          fontSize: "12px",
                          textAlign: "center",
                          writingMode: "vertical-rl",
                          textOrientation: "mixed",
                          transform: "rotate(180deg)"
                        }}>
                          {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                        </div>
                      </div>
                      <div style={{ 
                        marginTop: "12px",
                        fontSize: "14px",
                        fontWeight: "700",
                        color: theme.colors.text,
                        textAlign: "center"
                      }}>
                        {settings.language === "hu" ? "Profit" : settings.language === "de" ? "Gewinn" : "Profit"}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* További statisztikák */}
              <div style={{
                backgroundColor: theme.colors.surfaceHover,
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "32px",
                border: `1px solid ${theme.colors.border}`,
                boxShadow: `0 2px 8px ${theme.colors.shadow}`
              }}>
                <h3 style={{ 
                  margin: 0, 
                  marginBottom: "20px",
                  fontSize: "18px", 
                  fontWeight: "700", 
                  color: theme.colors.text
                }}>
                  📋 {settings.language === "hu" ? "Részletes statisztikák" : settings.language === "de" ? "Detaillierte Statistiken" : "Detailed Statistics"}
                </h3>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "16px"
                }}>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Felhasznált filament" : settings.language === "de" ? "Verwendetes Filament" : "Filament Used"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(reportStats.totalFilamentUsed / 1000, 2)} kg
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Nyomtatási idő" : settings.language === "de" ? "Druckzeit" : "Print Time"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(reportStats.totalPrintTime, 1)} {settings.language === "hu" ? "óra" : settings.language === "de" ? "Stunden" : "hours"}
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Átlagos profit/árajánlat" : settings.language === "de" ? "Durchschnittlicher Gewinn/Angebot" : "Avg Profit/Offer"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {formatNumber(formatCurrency(reportStats.offerCount > 0 ? reportStats.totalProfit / reportStats.offerCount : 0), 2)}
                    </div>
                  </div>
                  <div style={{ padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", color: theme.colors.textMuted, marginBottom: "4px" }}>
                      {settings.language === "hu" ? "Profit margó" : settings.language === "de" ? "Gewinnmarge" : "Profit Margin"}
                    </div>
                    <div style={{ fontSize: "20px", fontWeight: "700", color: theme.colors.text }}>
                      {reportStats.totalRevenue > 0 ? ((reportStats.totalProfit / reportStats.totalRevenue) * 100).toFixed(1) : "0"}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Gombok */}
              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowReportDialog(false)}
                  style={{
                    padding: "12px 24px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: "14px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surfaceHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.surface;
                  }}
                >
                  {settings.language === "hu" ? "Bezárás" : settings.language === "de" ? "Schließen" : "Close"}
                </button>
                <Tooltip content={settings.language === "hu" ? "Riport mentése JSON formátumban" : settings.language === "de" ? "Bericht als JSON speichern" : "Save report as JSON"}>
                  <button
                    onClick={generateReport}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "10px",
                      border: "none",
                      backgroundColor: theme.colors.primary,
                      color: "#fff",
                      fontSize: "14px",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primaryHover;
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${theme.colors.shadowHover}`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.colors.primary;
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <span>💾</span>
                    <span>{settings.language === "hu" ? "Mentés JSON" : settings.language === "de" ? "Als JSON speichern" : "Save as JSON"}</span>
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
