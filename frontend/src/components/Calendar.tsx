import React, { useState, useMemo } from "react";
import type { Offer, Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { logWithLanguage } from "../utils/languages/global_console";
import { generateICS } from "../utils/icsExport";
import { open } from "@tauri-apps/plugin-shell";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { useToast } from "./Toast";

interface Props {
  offers: Offer[];
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Calendar: React.FC<Props> = ({ offers, settings, theme, themeStyles }) => {
  const t = useTranslation(settings.language);
  const { showToast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [exporting, setExporting] = useState(false);

  // Get status color helper
  const getStatusColor = (status?: string): string => {
    switch (status) {
      case "accepted":
        return "#20c997"; // zöld
      case "rejected":
        return "#dc3545"; // piros
      case "completed":
        return "#6610f2"; // lila
      default:
        return "#6c757d"; // szürke
    }
  };

  // Get status icon helper
  const getStatusIcon = (status?: string): string => {
    switch (status) {
      case "accepted":
        return "✅";
      case "rejected":
        return "❌";
      case "completed":
        return "✔️";
      default:
        return "📅";
    }
  };

  // Get offers with due dates - only show accepted, completed, or rejected offers
  const offersWithDueDates = useMemo(() => {
    const filtered = offers.filter(offer => 
      offer.printDueDate && 
      (offer.status === "accepted" || offer.status === "completed" || offer.status === "rejected")
    );
    if (import.meta.env.DEV) {
      logWithLanguage(settings.language, "log", "offers.save.printDueDate", {
        totalOffers: offers.length,
        offersWithDueDates: filtered.length,
        dueDates: filtered.map(o => ({ id: o.id, printDueDate: o.printDueDate, status: o.status }))
      });
    }
    return filtered;
  }, [offers, settings.language]);

  // Get offers for a specific date
  const getOffersForDate = (date: Date): Offer[] => {
    // Normalize date to YYYY-MM-DD format (local timezone)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    return offersWithDueDates.filter(offer => {
      if (!offer.printDueDate) return false;
      // Parse the stored date and normalize to YYYY-MM-DD
      const offerDate = new Date(offer.printDueDate);
      const offerYear = offerDate.getFullYear();
      const offerMonth = String(offerDate.getMonth() + 1).padStart(2, '0');
      const offerDay = String(offerDate.getDate()).padStart(2, '0');
      const offerDateStr = `${offerYear}-${offerMonth}-${offerDay}`;
      
      return offerDateStr === dateStr;
    });
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in the past
  const isPast = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    // Compare dates using string format to avoid timezone issues
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    return checkDateStr < todayStr;
  };

  // Check if date is due tomorrow (1 day before)
  const isDueTomorrow = (date: Date): boolean => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    // Compare dates using string format to avoid timezone issues
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
    const checkDateStr = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    return checkDateStr === tomorrowStr;
  };

  // Get month start and end
  const getMonthStart = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getMonthEnd = (date: Date): Date => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  // Get calendar days for month view
  const getCalendarDays = (): Date[] => {
    const start = getMonthStart(currentDate);
    const end = getMonthEnd(currentDate);
    const days: Date[] = [];
    
    // Add days from previous month to fill first week
    const startDay = start.getDay();
    const localeStartDay = settings.language === "hu" ? (startDay === 0 ? 6 : startDay - 1) : startDay;
    
    for (let i = localeStartDay - 1; i >= 0; i--) {
      const prevDate = new Date(start);
      prevDate.setDate(prevDate.getDate() - i - 1);
      days.push(prevDate);
    }
    
    // Add days of current month
    for (let i = 1; i <= end.getDate(); i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
    }
    
    // Add days from next month to fill last week
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i));
    }
    
    return days;
  };

  const calendarDays = useMemo(() => getCalendarDays(), [currentDate, settings.language]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString(
      settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US",
      { day: "numeric", month: "long", year: "numeric" }
    );
  };

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString(
      settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US",
      { month: "long", year: "numeric" }
    );
  };

  const getDayNames = (): string[] => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const daysHu = ["Vas", "Hét", "Ked", "Sze", "Csü", "Pén", "Szo"];
    const daysDe = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    
    if (settings.language === "hu") {
      return daysHu;
    } else if (settings.language === "de") {
      return daysDe;
    }
    return days;
  };

  const dayNames = getDayNames();

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth() && date.getFullYear() === currentDate.getFullYear();
  };

  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';

  // Export to calendar
  const handleExportToCalendar = async () => {
    if (offersWithDueDates.length === 0) {
      showToast(t("calendar.export.noOffers") || "Nincs exportálható esemény", "info");
      return;
    }

    setExporting(true);
    try {
      const icsContent = generateICS(offersWithDueDates);
      const defaultFileName = `3dprinter_calendar_${new Date().toISOString().split('T')[0]}.ics`;
      
      // Use save dialog to let user choose where to save the file
      const filePath = await save({
        defaultPath: defaultFileName,
        filters: [
          {
            name: "ICS Calendar",
            extensions: ["ics"],
          },
        ],
      });

      if (!filePath) {
        // User cancelled the save dialog
        setExporting(false);
        return;
      }

      // Save ICS file to the selected path
      await writeTextFile(filePath, icsContent);

      const calendarProvider = settings.calendarProvider || "google";

      // Open calendar based on provider
      if (calendarProvider === "google") {
        // Google Calendar: Open web interface
        await open("https://calendar.google.com/calendar/render?action=TEMPLATE");
        showToast(t("calendar.export.google") || "Nyisd meg a Google Calendar-t és importáld a mentett ICS fájlt", "info");
      } else if (calendarProvider === "outlook") {
        // Outlook: Open web interface
        await open("https://outlook.live.com/calendar/0/deeplink/compose");
        showToast(t("calendar.export.outlook") || "Nyisd meg az Outlook-ot és importáld a mentett ICS fájlt", "info");
      } else {
        // iOS Calendar (macOS) or default: Open file with system default app
        await invoke("open_file", { path: filePath });
      }

      const fileName = filePath.split(/[/\\]/).pop() || defaultFileName;
      showToast(
        t("calendar.export.success") || `ICS fájl sikeresen exportálva: ${fileName}`,
        "success"
      );
    } catch (error) {
      console.error("Calendar export error:", error);
      showToast(
        t("calendar.export.error") || "Hiba az exportálás során",
        "error"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ ...themeStyles.pageTitle, margin: 0 }}>
          📅 {t("calendar.title") || "Naptár - Esedékes nyomtatások"}
        </h2>
        {offersWithDueDates.length > 0 && (
          <button
            onClick={handleExportToCalendar}
            disabled={exporting}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              padding: "10px 20px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: exporting ? 0.6 : 1,
              cursor: exporting ? "not-allowed" : "pointer",
            }}
          >
            {exporting ? "⏳" : "📅"} {t("calendar.export.button") || "Exportálás naptárba"}
          </button>
        )}
      </div>

      {/* Calendar Controls */}
      <div style={{ 
        ...themeStyles.card, 
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={goToPreviousMonth}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonSecondary,
              padding: "8px 16px",
            }}
          >
            ←
          </button>
          <button
            onClick={goToToday}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonPrimary,
              padding: "8px 16px",
            }}
          >
            {t("calendar.today") || "Ma"}
          </button>
          <button
            onClick={goToNextMonth}
            style={{
              ...themeStyles.button,
              ...themeStyles.buttonSecondary,
              padding: "8px 16px",
            }}
          >
            →
          </button>
        </div>
        <h3 style={{ 
          margin: 0, 
          fontSize: "24px", 
          fontWeight: "700",
          color: isGradientBg ? "#1a202c" : theme.colors.text,
        }}>
          {formatMonthYear(currentDate)}
        </h3>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setViewMode("month")}
            style={{
              ...themeStyles.button,
              ...(viewMode === "month" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
              padding: "8px 16px",
            }}
          >
            {t("calendar.month") || "Hónap"}
          </button>
          <button
            onClick={() => setViewMode("week")}
            style={{
              ...themeStyles.button,
              ...(viewMode === "week" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
              padding: "8px 16px",
            }}
          >
            {t("calendar.week") || "Hét"}
          </button>
          <button
            onClick={() => setViewMode("day")}
            style={{
              ...themeStyles.button,
              ...(viewMode === "day" ? themeStyles.buttonPrimary : themeStyles.buttonSecondary),
              padding: "8px 16px",
            }}
          >
            {t("calendar.day") || "Nap"}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "month" && (
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
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div style={{ ...themeStyles.card, marginTop: "24px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
            {formatDate(selectedDate)}
          </h3>
          {getOffersForDate(selectedDate).length === 0 ? (
            <p style={{ color: theme.colors.textMuted }}>
              {t("calendar.noOffers") || "Nincs esedékes nyomtatás ezen a napon."}
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {getOffersForDate(selectedDate).map((offer) => (
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
      )}

      {/* Upcoming Alerts */}
      {offersWithDueDates.length > 0 && (
        <div style={{ ...themeStyles.card, marginTop: "24px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", fontSize: "20px", fontWeight: "600" }}>
            ⚠️ {t("calendar.upcoming") || "Esedékes nyomtatások"}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {offersWithDueDates
              .filter(offer => {
                if (!offer.printDueDate) return false;
                const dueDate = new Date(offer.printDueDate);
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                tomorrow.setHours(0, 0, 0, 0);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                dueDate.setHours(0, 0, 0, 0);
                // Check if due date is today or tomorrow
                const dueDateStr = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')}`;
                const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
                return dueDateStr === todayStr || dueDateStr === tomorrowStr;
              })
              .sort((a, b) => {
                if (!a.printDueDate || !b.printDueDate) return 0;
                return new Date(a.printDueDate).getTime() - new Date(b.printDueDate).getTime();
              })
              .map((offer) => {
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
      )}
    </div>
  );
};

