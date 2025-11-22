import React, { useState, useEffect, useMemo } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { Breadcrumb } from "./Breadcrumb";
import { useTranslation } from "../utils/translations";
import { Tooltip } from "./Tooltip";

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
  onQuickAction?: (action: string) => void;
}

export const Header: React.FC<Props> = ({ settings, theme, onMenuToggle, isSidebarOpen, lastSaved, autosaveInterval = 30, activePage, onPageChange, themeStyles, onQuickAction }) => {
  const t = useTranslation(settings.language);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
      // A currentDate frissítése automatikusan újrarendereli a komponenst,
      // így a lastSaved relatív idő is frissül
    }, 1000);
    return () => clearInterval(timer);
  }, [lastSaved]);

  // Viewport szélesség követése responsive layout-hoz
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      // Másodpercek - ne használjunk padStart-ot, hogy ne legyen mindig 2 jegyű
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
        // Csak akkor használjunk padStart-ot, ha a másodpercek 2 jegyűek (10-59)
        const secondsStr = seconds < 10 ? seconds.toString() : seconds.toString().padStart(2, '0');
        return settings.language === "hu" 
          ? `${minutes}:${secondsStr} múlva mentés` 
          : settings.language === "de" 
          ? `Speichern in ${minutes}:${secondsStr}` 
          : `Save in ${minutes}:${secondsStr}`;
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

  // Responsive breakpoints - dinamikus elrejtés kisebb méreteknél
  // A breakpoint-ok úgy vannak beállítva, hogy mielőtt levágásra kerülnének az elemek, elrejtődjön a kevésbé fontos
  const showBreadcrumb = windowWidth > 1000; // Breadcrumb csak 1000px felett
  const showDate = windowWidth > 900; // Dátum csak 900px felett
  const showLastSaved = windowWidth > 800; // Következő mentés csak 800px felett
  const compactQuickActions = windowWidth < 700; // Kompakt gombok 700px alatt

  // Breadcrumb items generálása - stabil referencia az onClick-hez
  const breadcrumbItems = useMemo(() => {
    if (!activePage || !onPageChange) {
      return [];
    }

    const items: Array<{ key: string; label: string; onClick?: () => void }> = [
      {
        key: 'home',
        label: t('sidebar.home') || 'Home',
        onClick: () => {
          if (onPageChange) {
            onPageChange('home');
          }
        },
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
        // Az utolsó elemnek nincs onClick-je (nem kattintható)
      });
    }

    return items;
  }, [activePage, onPageChange, t]);

  // Gyors műveletek gombok az aktuális oldal alapján
  const quickActions = useMemo(() => {
    if (!activePage || !onPageChange || !onQuickAction) {
      return [];
    }

    const actions: Array<{ key: string; label: string; icon: string; onClick: () => void; tooltip: string }> = [];

    switch (activePage) {
      case 'filaments':
        actions.push({
          key: 'add-filament',
          label: t('header.quickActions.addFilament') || 'Új filament',
          icon: '➕',
          onClick: () => {
            if (onQuickAction) onQuickAction('add-filament');
            // The Filaments component will handle opening the form
          },
          tooltip: t('header.quickActions.addFilamentTooltip') || 'Új filament hozzáadása',
        });
        break;
      case 'printers':
        actions.push({
          key: 'add-printer',
          label: t('header.quickActions.addPrinter') || 'Új nyomtató',
          icon: '🖨️',
          onClick: () => {
            if (onQuickAction) onQuickAction('add-printer');
            // The Printers component will handle opening the form
          },
          tooltip: t('header.quickActions.addPrinterTooltip') || 'Új nyomtató hozzáadása',
        });
        break;
      case 'customers':
        actions.push({
          key: 'add-customer',
          label: t('header.quickActions.addCustomer') || 'Új ügyfél',
          icon: '👥',
          onClick: () => {
            if (onQuickAction) onQuickAction('add-customer');
            // The Customers component will handle opening the form
          },
          tooltip: t('header.quickActions.addCustomerTooltip') || 'Új ügyfél hozzáadása',
        });
        break;
      case 'offers':
        actions.push({
          key: 'new-offer',
          label: t('header.quickActions.newOffer') || 'Új árajánlat',
          icon: '📋',
          onClick: () => {
            onPageChange('calculator');
            onQuickAction('new-offer');
          },
          tooltip: t('header.quickActions.newOfferTooltip') || 'Új árajánlat létrehozása',
        });
        break;
      case 'calculator':
        actions.push({
          key: 'new-offer',
          label: t('header.quickActions.newOffer') || 'Új árajánlat',
          icon: '📋',
          onClick: () => onQuickAction('new-offer'),
          tooltip: t('header.quickActions.newOfferTooltip') || 'Új árajánlat létrehozása',
        });
        break;
      case 'home':
        actions.push({
          key: 'calculator',
          label: t('header.quickActions.calculator') || 'Kalkulátor',
          icon: '🧮',
          onClick: () => onPageChange('calculator'),
          tooltip: t('header.quickActions.calculatorTooltip') || 'Kalkulátor megnyitása',
        });
        break;
    }

    return actions;
  }, [activePage, onPageChange, onQuickAction, t]);

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
        gap: "16px",
        padding: "0 24px",
        overflow: "hidden", // Prevenálja a túlcsordulást
        zIndex: 999,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isNeon
          ? `0 0 20px ${theme.colors.shadow}, 0 2px 8px ${theme.colors.shadow}`
          : `0 2px 8px ${theme.colors.shadow}`,
        backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
      }}
    >
      {/* Left: Logo and Menu Toggle */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "16px",
        flexShrink: 0, // Ne zsugorodjon
      }}>
        <Tooltip 
          content={isSidebarOpen 
            ? (settings.language === "hu" ? "Menü elrejtése" : settings.language === "de" ? "Menü ausblenden" : "Hide menu")
            : (settings.language === "hu" ? "Menü megjelenítése" : settings.language === "de" ? "Menü anzeigen" : "Show menu")
          }
          position="bottom"
          theme={theme}
        >
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
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = hoverBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label={isSidebarOpen 
              ? (settings.language === "hu" ? "Menü elrejtése" : settings.language === "de" ? "Menü ausblenden" : "Hide menu")
              : (settings.language === "hu" ? "Menü megjelenítése" : settings.language === "de" ? "Menü anzeigen" : "Show menu")
            }
          >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        </Tooltip>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          flexShrink: 0,
        }}>
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
              flexShrink: 0,
            }}
          >
            3D
          </div>
          {windowWidth > 400 && (
            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                color: headerText,
                textShadow: isNeon ? `0 0 8px ${headerText}` : "none",
                whiteSpace: "nowrap",
              }}
            >
              3DPrinterCalcApp
            </span>
          )}
        </div>
      </div>

      {/* Center: Breadcrumb */}
      {showBreadcrumb && breadcrumbItems.length > 1 && themeStyles && (
        <div style={{ 
          flex: "1 1 auto",
          minWidth: 0, // Lehetővé teszi a zsugorodást
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
        }}>
          <Breadcrumb
            items={breadcrumbItems}
            theme={theme}
            themeStyles={themeStyles}
            settings={settings}
          />
        </div>
      )}

      {/* Right: Quick Actions and Status Info */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        gap: "12px",
        flexShrink: 0,
        justifyContent: "flex-end",
        marginLeft: "auto", // Mindig jobbra tolja az egész konténert
      }}>
        {/* Quick Actions - balra a status info kártyától */}
        {quickActions.length > 0 && themeStyles && (
          <div 
            data-tutorial="quick-actions"
            data-quick-actions="true"
            style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: compactQuickActions ? "4px" : "8px", 
            flexShrink: 0,
          }}>
            {quickActions.map((action) => (
              <Tooltip key={action.key} content={action.tooltip}>
                <button
                  onClick={action.onClick}
                  onMouseEnter={(e) => {
                    if (themeStyles.buttonHover) {
                      Object.assign(e.currentTarget.style, themeStyles.buttonHover);
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = themeStyles.buttonPrimary.boxShadow;
                  }}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonPrimary,
                    padding: compactQuickActions ? "6px 8px" : "8px 12px",
                    fontSize: compactQuickActions ? "12px" : "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: compactQuickActions ? "4px" : "6px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  aria-label={action.tooltip}
                >
                  <span>{action.icon}</span>
                  {!compactQuickActions && <span>{action.label}</span>}
                </button>
              </Tooltip>
            ))}
          </div>
        )}
        
        {/* Status Info - mindig a legjobbra, kompakt, modern kártya stílusban */}
        {(showLastSaved || showDate) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
              gap: "3px",
              padding: "6px 12px",
              borderRadius: "8px",
              backgroundColor: isLight 
                ? "rgba(0, 0, 0, 0.03)" 
                : "rgba(255, 255, 255, 0.05)",
              border: `1px solid ${isLight ? "rgba(0, 0, 0, 0.08)" : "rgba(255, 255, 255, 0.1)"}`,
              flexShrink: 0,
              minWidth: "160px",
              lineHeight: "1.4",
              marginLeft: "auto", // Mindig jobbra tolja
            }}
          >
            {/* Last Saved */}
            {showLastSaved && lastSaved && (
              <div style={{ 
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "1px",
              }}>
                <span style={{ 
                  fontSize: "9px", 
                  color: mutedText, 
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  textShadow: isNeon ? `0 0 4px ${mutedText}` : "none",
                  whiteSpace: "nowrap",
                  opacity: 0.8,
                }}>
                  {settings.language === "hu" ? "Következő mentés" : settings.language === "de" ? "Nächste Speicherung" : "Next save"}
                </span>
                <span style={{ 
                  fontSize: "11px", 
                  color: theme.colors.success || "#4ade80",
                  fontWeight: "600",
                  textShadow: isNeon ? `0 0 4px ${theme.colors.success || "#4ade80"}` : "none",
                  whiteSpace: "nowrap",
                }}>
                  {formatLastSaved(lastSaved)}
                </span>
              </div>
            )}
            
            {/* Date and Time - egy sorban vagy egymás alatt */}
            {showDate && (
              <div style={{ 
                display: "flex",
                alignItems: "center",
                gap: "8px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}>
                <span style={{ 
                  fontSize: "11px", 
                  color: mutedText, 
                  fontWeight: "500",
                  textShadow: isNeon ? `0 0 4px ${mutedText}` : "none",
                  whiteSpace: "nowrap",
                  opacity: 0.9,
                }}>
                  {formatDate(currentDate)}
                </span>
                <span style={{ 
                  fontSize: "16px", 
                  color: headerText, 
                  fontWeight: "700",
                  textShadow: isNeon ? `0 0 8px ${headerText}` : (isGradientBg && !isGlassmorphism ? "0 1px 3px rgba(0,0,0,0.3)" : "none"),
                  whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {formatTime(currentDate)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
