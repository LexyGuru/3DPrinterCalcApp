import React, { useState, useEffect, useMemo } from "react";
import type { Settings, Offer } from "../types";
import type { Theme } from "../utils/themes";
import { Breadcrumb } from "./Breadcrumb";
import { useTranslation } from "../utils/translations";
import { Tooltip } from "./Tooltip";
import { getTimeSinceBackup } from "../utils/backup";

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
  offers?: Offer[];
}

export const Header: React.FC<Props> = ({
  settings,
  theme,
  onMenuToggle,
  isSidebarOpen,
  lastSaved,
  autosaveInterval = 30,
  activePage,
  onPageChange,
  themeStyles,
  onQuickAction,
  offers = [],
}) => {

  const location = useLocation();
  
  // activePage a location.pathname-ből származik (ha routing van)
  const currentActivePage = useMemo(() => {
    return ROUTE_TO_PAGE[location.pathname] || activePage || "home";
  }, [location.pathname, activePage]);
  
  // Navigate handler - routing-ot használ, ha elérhető
  const handlePageChange = (page: string) => {
    const route = PAGE_TO_ROUTE[page] || "/";
    navigate(route);
    // Fallback: ha nincs routing, használjuk az onPageChange-t
    if (onPageChange) {
      onPageChange(page);
    }
  };
  themeStyles,
  onQuickAction,
  offers = [],
}) => {
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

  const formatLastSaved = (date: Date | null, autosaveEnabled: boolean, lastBackupDate?: string | null): string => {
    // Ha az autosave be van kapcsolva, mutatjuk a következő mentésig hátralévő időt
    if (autosaveEnabled) {
    if (!date) {
        return t("header.autosave.notSavedYet");
    }
    // Használjuk a currentDate-et a relatív idő számításához, hogy frissüljön
    const diffMs = currentDate.getTime() - date.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    
    // Visszafelé számolunk: a következő mentésig hátralévő idő
    // Ha eltelt az autosave intervallum, akkor újraindítjuk a számlálót (modulo)
    const timeUntilNextSave = ((autosaveInterval - (diffSeconds % autosaveInterval)) % autosaveInterval) || autosaveInterval;
    
    // Ha éppen most mentettünk (0-2 másodperc), akkor "Most mentve"
    if (diffSeconds < 2) {
        return t("header.autosave.justSaved");
    }
    
    // Visszafelé számolás: hátralévő idő a következő mentésig
    if (timeUntilNextSave < 60) {
      // Másodpercek - ne használjunk padStart-ot, hogy ne legyen mindig 2 jegyű
        return t("header.autosave.saveInSeconds", { seconds: timeUntilNextSave });
    } else {
      // Percek
      const minutes = Math.floor(timeUntilNextSave / 60);
      const seconds = timeUntilNextSave % 60;
      if (seconds === 0) {
          return t("header.autosave.saveInMinutes", { minutes });
      } else {
        // Csak akkor használjunk padStart-ot, ha a másodpercek 2 jegyűek (10-59)
        const secondsStr = seconds < 10 ? seconds.toString() : seconds.toString().padStart(2, '0');
          return t("header.autosave.saveInMinutesSeconds", { minutes, seconds: secondsStr });
        }
      }
    } else {
      // Ha az autosave ki van kapcsolva, mutatjuk az utolsó mentés óta eltelt időt
      // Csak a lastBackupDate-et használjuk (settings-ből), nem a lastSaved Date objektumot,
      // mert a lastSaved az alkalmazás indításakor lett beállítva, nem az utolsó mentés ideje
      if (!lastBackupDate) {
        return t("common.noBackupYet");
      }
      
      const timeSince = getTimeSinceBackup(lastBackupDate);
      
      // Ha nincs timeSince vagy kevesebb mint 1 perc telt el, ellenőrizzük, hogy valóban friss-e
      // Ha a backup dátum nagyon új (alkalmazás indítása körül), akkor valószínűleg nincs valós backup
      if (!timeSince || timeSince.totalMinutes < 1) {
        // Ellenőrizzük, hogy a lastBackupDate valóban régi-e (pl. több mint 5 perc)
        // Ha nagyon új, akkor valószínűleg csak az alkalmazás indításakor lett beállítva
        const backupDate = new Date(lastBackupDate);
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - backupDate.getTime()) / (1000 * 60));
        
        // Ha a backup dátum kevesebb mint 5 perc, akkor valószínűleg nincs valós backup
        if (diffMinutes < 5) {
          return t("common.noBackupYet");
        }
        
        return t("common.justSaved");
      }
      
      // Priorítás: évek > hónapok > hetek > napok > órák > percek
      if (timeSince.years > 0) {
        return t("common.timeAgo.years", { count: timeSince.years });
      } else if (timeSince.months > 0) {
        return t("common.timeAgo.months", { count: timeSince.months });
      } else if (timeSince.weeks > 0) {
        return t("common.timeAgo.weeks", { count: timeSince.weeks });
      } else if (timeSince.days > 0) {
        return t("common.timeAgo.days", { count: timeSince.days });
      } else if (timeSince.hours > 0) {
        return t("common.timeAgo.hours", { count: timeSince.hours });
      } else {
        return t("common.timeAgo.minutes", { count: timeSince.totalMinutes });
      }
    }
  };

  // Theme-aware colors
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  
  // Header background - use surface color for better contrast
  const getHeaderBg = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.surface || "rgba(255, 255, 255, 0.95)";
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
      // Gradient háttér esetén ellenőrizzük a kontrasztot
      const surfaceLuminance = typeof theme.colors.surface === 'string' 
        ? (theme.colors.surface.includes('gradient') ? 0.5 : 0.5) 
        : 0.5;
      return surfaceLuminance > 0.5 ? theme.colors.text : "#ffffff";
    }
    return theme.colors.text;
  };
  const headerText = getHeaderText();
  
  // Muted text color for date
  const getMutedText = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.textMuted || theme.colors.textSecondary || "#6b7280";
    }
    if (isGradientBg) {
      // Gradient háttér esetén dinamikusan számoljuk
      return theme.colors.textMuted || theme.colors.textSecondary || "rgba(255, 255, 255, 0.8)";
    }
    return theme.colors.textMuted || theme.colors.textSecondary || theme.colors.text;
  };
  const mutedText = getMutedText();
  
  const borderColor = theme.colors.border;
  const hoverBg = theme.colors.surfaceHover || theme.colors.surface;

  // Responsive breakpoints - dinamikus elrejtés kisebb méreteknél
  // A breadcrumb sáv a headerben zavaró volt, ezért egyelőre kikapcsoljuk (showBreadcrumb = false)
  const showBreadcrumb = false;
  const showDate = windowWidth > 900; // Dátum csak 900px felett
  const showLastSaved = windowWidth > 800; // Következő mentés csak 800px felett
  const compactQuickActions = windowWidth < 700; // Kompakt gombok 700px alatt

  // Közelgő / esedékes nyomtatási feladatok – elfogadott, nem completed, határidő ma–holnap–holnapután
  const upcomingPrintReminders = useMemo(() => {
    if (!offers || offers.length === 0) return [];

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const maxDiffDays = 2; // 0 = ma, 1 = holnap, 2 = holnapután

    const offersWithDiff = offers
      .filter((offer) => {
        if (!offer.printDueDate) return false;
        if (offer.status === "completed" || offer.status === "rejected") return false;
        if (offer.status !== "accepted" && offer.status !== "sent") return false;

        const due = new Date(offer.printDueDate);
        const startOfDue = new Date(due);
        startOfDue.setHours(0, 0, 0, 0);

        const diffDays = Math.round(
          (startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
        );

        return diffDays >= 0 && diffDays <= maxDiffDays;
      })
      .sort((a, b) => {
        const da = new Date(a.printDueDate || a.date).getTime();
        const db = new Date(b.printDueDate || b.date).getTime();
        return da - db;
      })
      .map((offer) => {
        const due = new Date(offer.printDueDate || offer.date);
        const startOfDue = new Date(due);
        startOfDue.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (startOfDue.getTime() - startOfToday.getTime()) / (1000 * 60 * 60 * 24)
        );
        return { offer, diffDays };
      });

    if (!offersWithDiff.length) return [];

    // Csoportosítás diffDays szerint (0 = ma, 1 = holnap, 2 = holnapután)
    const dayBuckets: Record<number, typeof offersWithDiff> = {};
    for (const item of offersWithDiff) {
      if (!dayBuckets[item.diffDays]) dayBuckets[item.diffDays] = [];
      dayBuckets[item.diffDays].push(item);
    }

    const dayOrder = [0, 1, 2];

    return dayOrder
      .filter((d) => dayBuckets[d] && dayBuckets[d].length > 0)
      .map((diffDays) => {
        const bucket = dayBuckets[diffDays];
        // Már idő szerint rendezett, így az első az, amit kiemelünk
        const first = bucket[0].offer;
        const extraCount = bucket.length - 1;

        let dayLabel: string;
        if (diffDays === 0) {
          dayLabel = t("header.reminder.today");
        } else if (diffDays === 1) {
          dayLabel = t("header.reminder.tomorrow");
        } else {
          dayLabel = t("header.reminder.in2Days");
        }

        const customer =
          first.customerName && first.customerName.trim().length > 0
            ? first.customerName
            : `${t("offers.label.quote")} #${first.id}`;

        const description =
          first.description && first.description.trim().length > 0
            ? first.description.trim()
            : "";

        const baseTextParts = [
          `${dayLabel}:`,
          customer,
          description ? `– ${description}` : "",
        ].filter(Boolean);

        const baseText = baseTextParts.join(" ");

        if (extraCount > 0) {
          const extraLabel = t("header.reminder.more", { count: extraCount });
          return `${baseText} ${extraLabel}`;
        }

        return baseText;
      });
  }, [offers, settings.language, t]);

  const [currentReminderIndex, setCurrentReminderIndex] = useState(0);

  // Váltakozó üzenet 30 másodpercenként, ha több feladat van
  useEffect(() => {
    if (!upcomingPrintReminders.length) {
      return;
    }

    setCurrentReminderIndex(0);

    const interval = setInterval(() => {
      setCurrentReminderIndex((prev) => (prev + 1) % upcomingPrintReminders.length);
    }, 30000); // 30 másodperc

    return () => clearInterval(interval);
  }, [upcomingPrintReminders.length]);

  // Breadcrumb items generálása - stabil referencia az onClick-hez
  const breadcrumbItems = useMemo(() => {
    if (!currentActivePage) {
      return [];
    }

    const items: Array<{ key: string; label: string; onClick?: () => void }> = [
      {
        key: 'home',
        label: t('sidebar.home') || 'Home',
        onClick: () => {
          handlePageChange('home');
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

    if (currentActivePage !== 'home' && pageLabels[currentActivePage]) {
      items.push({
        key: currentActivePage,
        label: pageLabels[currentActivePage],
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
            ? t("header.menu.hide")
            : t("header.menu.show")
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
              ? t("header.menu.hide")
              : t("header.menu.show")
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
            upcomingPrintReminders.length > 0 ? (
              // Responsív figyelmeztető badge – a rendelkezésre álló szélességhez igazítjuk
              <div
                style={{
                  marginLeft: "4px",
                  padding: "6px 14px",
                  borderRadius: "999px",
                  backgroundColor: theme.colors.primary + "20",
                  border: `1px solid ${theme.colors.primary}`,
                  color: theme.colors.primary,
                  fontSize: "13px",
                  fontWeight: 600,
                  maxWidth: Math.max(160, windowWidth - 420),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: `0 0 10px ${theme.colors.shadow}`,
                }}
              >
                <span>⏱️</span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {upcomingPrintReminders[currentReminderIndex] || upcomingPrintReminders[0]}
                </span>
              </div>
            ) : (
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
            )
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
              backgroundColor: theme.colors.surfaceHover || (isGradientBg ? "rgba(255, 255, 255, 0.1)" : theme.colors.surface),
              border: `1px solid ${theme.colors.border}`,
              flexShrink: 0,
              minWidth: "160px",
              lineHeight: "1.4",
              marginLeft: "auto", // Mindig jobbra tolja
            }}
          >
            {/* Last Saved - mindig mutatjuk, ha showLastSaved true */}
            {showLastSaved && (
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
                  {settings.autosave === true
                    ? t("common.nextSave")
                    : t("common.lastSaved")
                  }
                </span>
                <span style={{ 
                  fontSize: "11px", 
                  color: settings.autosave === true ? (theme.colors.success || "#4ade80") : mutedText,
                  fontWeight: "600",
                  textShadow: isNeon ? `0 0 4px ${settings.autosave === true ? (theme.colors.success || "#4ade80") : mutedText}` : "none",
                  whiteSpace: "nowrap",
                }}>
                  {formatLastSaved(lastSaved, settings.autosave === true, settings.lastBackupDate)}
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
