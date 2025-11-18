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
import { CalendarControls } from "./Calendar/CalendarControls";
import { CalendarGrid } from "./Calendar/CalendarGrid";
import { OfferDetails } from "./Calendar/OfferDetails";
import { UpcomingAlerts } from "./Calendar/UpcomingAlerts";

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
      <CalendarControls
        currentDate={currentDate}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        formatMonthYear={formatMonthYear}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
      />

      {/* Calendar Grid */}
      {viewMode === "month" && (
        <CalendarGrid
          calendarDays={calendarDays}
          dayNames={dayNames}
          currentDate={currentDate}
          offersWithDueDates={offersWithDueDates}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          getOffersForDate={getOffersForDate}
          isCurrentMonth={isCurrentMonth}
          isToday={isToday}
          isPast={isPast}
          isDueTomorrow={isDueTomorrow}
          getStatusColor={getStatusColor}
          getStatusIcon={getStatusIcon}
          settings={settings}
          theme={theme}
          themeStyles={themeStyles}
        />
      )}

      {/* Selected Date Details */}
      <OfferDetails
        selectedDate={selectedDate}
        offers={offersWithDueDates}
        getOffersForDate={getOffersForDate}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
      />

      {/* Upcoming Alerts */}
      <UpcomingAlerts
        offers={offersWithDueDates}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        isDueTomorrow={isDueTomorrow}
        isPast={isPast}
        formatDate={formatDate}
        settings={settings}
        theme={theme}
        themeStyles={themeStyles}
      />
    </div>
  );
};

