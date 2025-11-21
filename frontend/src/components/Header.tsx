import React, { useState, useEffect, useMemo } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { Breadcrumb } from "./Breadcrumb";
import { useTranslation } from "../utils/translations";

interface Props {
  settings: Settings;
  theme: Theme;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
  lastSaved: Date | null;
  autosaveInterval?: number; // Másodpercben
  activePage?: string;
  onPageChange?: (page: string) => void;
  themeStyles?: ReturnType<typeof import("../utils/themes").getThemeStyles>;
}

export const Header: React.FC<Props> = ({ settings, theme, onMenuToggle, isSidebarOpen, lastSaved, autosaveInterval = 30, activePage, onPageChange, themeStyles }) => {
  const t = useTranslation(settings.language);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
      // A currentDate frissítése automatikusan újrarendereli a komponenst,
      // így a lastSaved relatív idő is frissül
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSaved]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatLastSaved = (date: Date | null): string => {
    if (!date) {
      return settings.language === "hu" ? "Még nem mentve" : settings.language === "de" ? "Noch nicht gespeichert" : "Not saved yet";
    }
    
    // Használjuk a currentDate-et a relatív idő számításához, hogy frissüljön
    const diffMs = currentDate.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // Visszafelé számolunk: a következő mentésig hátralévő idő
    // Ha eltelt az autosave intervallum, akkor újraindítjuk a számlálót (modulo)
    const timeUntilNextSave = ((autosaveInterval - (diffSeconds % autosaveInterval)) % autosaveInterval) || autosaveInterval;
    
    // Ha éppen most mentettünk (0-2 másodperc), akkor "Most mentve"
    if (diffSeconds < 2) {
      return settings.language === "hu" ? "Most mentve" : settings.language === "de" ? "Gerade gespeichert" : "Just saved";
    }
    
    // Visszafelé számolás: hátralévő idő a következő mentésig
    if (timeUntilNextSave < 60) {
      // Másodpercek
      return settings.language === "hu" 
        ? `${timeUntilNextSave} mp múlva mentés` 
        : settings.language === "de" 
        ? `Speichern in ${timeUntilNextSave} s` 
        : `Save in ${timeUntilNextSave}s`;
    } else {
      // Percek
      const minutes = Math.floor(timeUntilNextSave / 60);
      const seconds = timeUntilNextSave % 60;
      if (seconds === 0) {
        return settings.language === "hu" 
          ? `${minutes} perc múlva mentés` 
          : settings.language === "de" 
          ? `Speichern in ${minutes} min` 
          : `Save in ${minutes}m`;
      } else {
        return settings.language === "hu" 
          ? `${minutes}:${seconds.toString().padStart(2, '0')} múlva mentés` 
          : settings.language === "de" 
          ? `Speichern in ${minutes}:${seconds.toString().padStart(2, '0')}` 
          : `Save in ${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  };

  // Theme-aware colors
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  const isLight = theme.name === 'light' || theme.name === 'pastel';
  
  // Header background - use surface color for better contrast
  const getHeaderBg = () => {
    if (isGradientBg && isGlassmorphism) {
      return "rgba(255, 255, 255, 0.95)";
    }
    if (isGradientBg) {
      return theme.colors.surface || "rgba(255, 255, 255, 0.9)";
    }
    return theme.colors.surface || theme.colors.background;
  };
  const headerBg = getHeaderBg();
  
  // Header text color - ensure good contrast
  const getHeaderText = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.text || "#1a1a1a";
    }
    if (isGradientBg) {
      return "#ffffff";
    }
    return theme.colors.text;
  };
  const headerText = getHeaderText();
  
  // Muted text color for date
  const getMutedText = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.textMuted || "#6b7280";
    }
    if (isGradientBg) {
      return "rgba(255, 255, 255, 0.8)";
    }
    return theme.colors.textMuted || (isLight ? "#6b7280" : "#9ca3af");
  };
  const mutedText = getMutedText();
  
  const borderColor = theme.colors.border;
  const hoverBg = theme.colors.surfaceHover || (isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)");

  // Breadcrumb items generálása
  const breadcrumbItems = useMemo(() => {
    if (!activePage || !onPageChange) {
      return [];
    }

    const items: Array<{ key: string; label: string; onClick?: () => void }> = [
      {
        key: 'home',
        label: t('sidebar.home') || 'Home',
        onClick: () => onPageChange('home'),
      },
    ];

    // Oldal-specifikus breadcrumb elemek
    const pageLabels: Record<string, string> = {
      calculator: t('sidebar.calculator') || 'Calculator',
      printers: t('sidebar.printers') || 'Printers',
      filaments: t('sidebar.filaments') || 'Filaments',
      customers: t('sidebar.customers') || 'Customers',
      offers: t('sidebar.offers') || 'Offers',
      priceTrends: t('sidebar.priceTrends') || 'Price Trends',
      calendar: t('sidebar.calendar') || 'Calendar',
      settings: t('sidebar.settings') || 'Settings',
      console: t('sidebar.console') || 'Console',
    };

    if (activePage !== 'home' && pageLabels[activePage]) {
      items.push({
        key: activePage,
        label: pageLabels[activePage],
      });
    }

    return items;
  }, [activePage, onPageChange, t]);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: isSidebarOpen ? "260px" : "0",
        right: 0,
        height: "70px",
        ...(isGradientBg && !isGlassmorphism
          ? {
              backgroundColor: headerBg,
            }
          : {
              backgroundColor: headerBg,
            }
        ),
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 999,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isNeon
          ? `0 0 20px ${theme.colors.shadow}, 0 2px 8px ${theme.colors.shadow}`
          : `0 2px 8px ${theme.colors.shadow}`,
        backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
      }}
    >
      {/* Left: Logo and Menu Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: headerText,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: typeof theme.colors.primary === 'string' && theme.colors.primary.includes('gradient')
                ? theme.colors.primary
                : theme.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "18px",
              boxShadow: isNeon ? `0 0 10px ${theme.colors.primary}` : "none",
            }}
          >
            3D
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: headerText,
              textShadow: isNeon ? `0 0 8px ${headerText}` : "none",
            }}
          >
            3DPrinterCalcApp
          </span>
        </div>
        
        {/* Breadcrumb */}
        {breadcrumbItems.length > 1 && themeStyles && (
          <div style={{ marginLeft: '24px' }}>
            <Breadcrumb
              items={breadcrumbItems}
              theme={theme}
              themeStyles={themeStyles}
              settings={settings}
            />
          </div>
        )}
      </div>

      {/* Right: Date, Time, and Last Saved */}
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        {/* Last Saved */}
        {lastSaved && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
            }}
          >
            <span style={{ 
              fontSize: "10px", 
              color: mutedText, 
              fontWeight: "400",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textShadow: isNeon ? `0 0 4px ${mutedText}` : "none",
            }}>
              {settings.language === "hu" ? "Következő mentés" : settings.language === "de" ? "Nächste Speicherung" : "Next save"}
            </span>
            <span style={{ 
              fontSize: "12px", 
              color: "#4ade80", // Halványzöld
              fontWeight: "500",
              opacity: 0.8,
              textShadow: isNeon ? `0 0 4px #4ade80` : "none",
            }}>
              {formatLastSaved(lastSaved)}
            </span>
          </div>
        )}
        
        {/* Date and Time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px",
          }}
        >
          <span style={{ 
            fontSize: "12px", 
            color: mutedText, 
            fontWeight: "500",
            textShadow: isNeon ? `0 0 4px ${mutedText}` : "none",
          }}>
            {formatDate(currentDate)}
          </span>
          <span style={{ 
            fontSize: "18px", 
            color: headerText, 
            fontWeight: "600",
            textShadow: isNeon ? `0 0 8px ${headerText}` : (isGradientBg && !isGlassmorphism ? "0 1px 3px rgba(0,0,0,0.3)" : "none"),
          }}>
            {formatTime(currentDate)}
          </span>
        </div>
      </div>
    </header>
  );
};
