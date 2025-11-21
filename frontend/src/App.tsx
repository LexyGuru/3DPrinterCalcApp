import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UpdateChecker } from "./components/UpdateChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { LoadingSkeletonPage } from "./components/LoadingSkeleton";

// Lazy loading komponensek (code splitting)
const Home = lazy(() => import("./components/Home").then(module => ({ default: module.Home })));
const Filaments = lazy(() => import("./components/Filaments").then(module => ({ default: module.Filaments })));
const Printers = lazy(() => import("./components/Printers").then(module => ({ default: module.Printers })));
const Calculator = lazy(() => import("./components/Calculator").then(module => ({ default: module.Calculator })));
const Offers = lazy(() => import("./components/Offers").then(module => ({ default: module.Offers })));
const Customers = lazy(() => import("./components/Customers").then(module => ({ default: module.Customers })));
const PriceTrends = lazy(() => import("./components/PriceTrends").then(module => ({ default: module.PriceTrends })));
const Calendar = lazy(() => import("./components/Calendar").then(module => ({ default: module.Calendar })));
const SettingsPage = lazy(() => import("./components/Settings").then(module => ({ default: module.SettingsPage })));
const Console = lazy(() => import("./components/Console").then(module => ({ default: module.Console })));
import type { Printer, Settings, Filament, Offer, Customer, ThemeName } from "./types";
import { defaultSettings } from "./types";
import { savePrinters, loadPrinters, saveFilaments, loadFilaments, saveSettings, loadSettings, saveOffers, loadOffers, saveCustomers, loadCustomers } from "./utils/store";
import { getThemeStyles, resolveTheme } from "./utils/themes";
import { defaultAnimationSettings } from "./types";
import { debounce } from "./utils/debounce";
import { useKeyboardShortcut } from "./utils/keyboardShortcuts";
import { ShortcutHelp } from "./components/ShortcutHelp";
import "./utils/consoleLogger"; // Initialize console logger
import "./utils/keyboardShortcuts"; // Initialize keyboard shortcuts
import { initFrontendLog } from "./utils/fileLogger"; // Initialize file logger
import { logWithLanguage } from "./utils/languages/global_console";
import { useTranslation } from "./utils/translations";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const t = useTranslation(settings.language);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date()); // Kezdeti érték, hogy azonnal látható legyen

  // 🔹 Frontend log inicializálása
  useEffect(() => {
    initFrontendLog().then((path) => {
      if (path) {
        console.log("✅ Frontend log fájl inicializálva:", path);
      }
    }).catch((error) => {
      console.error("⚠️ Frontend log inicializálási hiba:", error);
    });
  }, []);

  // 🔹 Betöltés indításkor
  useEffect(() => {
      const loadData = async () => {
      const loadedPrinters = await loadPrinters();
      const loadedFilaments = await loadFilaments();
      const loadedSettings = await loadSettings();
      const loadedOffers = await loadOffers();
      const loadedCustomers = await loadCustomers();
      
      if (loadedPrinters.length > 0) {
        setPrinters(loadedPrinters);
      }
      if (loadedFilaments.length > 0) {
        setFilaments(loadedFilaments);
      }
      if (loadedOffers.length > 0) {
        setOffers(loadedOffers);
      }
      if (loadedCustomers.length > 0) {
        setCustomers(loadedCustomers);
      }
      if (loadedSettings) {
        // Ellenőrizzük hogy az electricityPrice érvényes érték-e
        if (!loadedSettings.electricityPrice || loadedSettings.electricityPrice <= 0) {
          if (import.meta.env.DEV) {
            logWithLanguage(settings.language, "warn", "settings.invalidElectricityPrice");
          }
          loadedSettings.electricityPrice = defaultSettings.electricityPrice;
        }
        // Ha nincs téma, használjuk az alapértelmezettet
        if (!loadedSettings.theme) {
          loadedSettings.theme = defaultSettings.theme;
        }
        if (!loadedSettings.companyInfo) {
          loadedSettings.companyInfo = { ...defaultSettings.companyInfo };
        } else {
          loadedSettings.companyInfo = {
            ...defaultSettings.companyInfo,
            ...loadedSettings.companyInfo,
          };
        }
        if (!loadedSettings.pdfTemplate) {
          loadedSettings.pdfTemplate = defaultSettings.pdfTemplate;
        }
        setSettings(loadedSettings);
      } else {
        // Ha nincs betöltött beállítás, használjuk az alapértelmezett értékeket
        setSettings(defaultSettings);
      }
      setIsInitialized(true);
      // Beállítjuk a lastSaved-et a betöltés után
      setLastSaved(new Date());
    };
    loadData();
  }, []);

  // 🔹 Automatikus mentés debounce-szal (csak inicializálás után)
  const autosaveEnabled = settings.autosave !== false; // Alapértelmezetten true
  const autosaveInterval = (settings.autosaveInterval || 30) * 1000; // Másodperc -> milliszekundum

  // Helper function to update last saved timestamp
  const updateLastSaved = () => {
    const now = new Date();
    setLastSaved(now);
    if (import.meta.env.DEV) {
      console.log("💾 Last saved timestamp frissítve:", now.toLocaleTimeString());
    }
  };

  // Debounced save functions
  const debouncedSavePrinters = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      savePrinters(printers).then(() => {
        updateLastSaved();
      }).catch((error) => {
        console.error("Hiba a nyomtatók mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveFilaments = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveFilaments(filaments).then(() => {
        updateLastSaved();
      }).catch((error) => {
        console.error("Hiba a filamentek mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveSettings = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveSettings(settings).then(() => {
        updateLastSaved();
      }).catch((error) => {
        console.error("Hiba a beállítások mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveOffers = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveOffers(offers).then(() => {
        updateLastSaved();
      }).catch((error) => {
        console.error("Hiba az árajánlatok mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveCustomers = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveCustomers(customers).then(() => {
        updateLastSaved();
      }).catch((error) => {
        console.error("Hiba az ügyfelek mentésekor:", error);
      });
    }
  }, autosaveInterval);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSavePrinters();
    } else if (isInitialized && !autosaveEnabled) {
      // Ha az autosave ki van kapcsolva, azonnal mentjük
      savePrinters(printers).then(() => updateLastSaved());
    }
  }, [printers, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveFilaments();
    } else if (isInitialized && !autosaveEnabled) {
      saveFilaments(filaments).then(() => updateLastSaved());
    }
  }, [filaments, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveSettings();
    } else if (isInitialized && !autosaveEnabled) {
      saveSettings(settings).then(() => updateLastSaved());
    }
  }, [settings, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveOffers();
    } else if (isInitialized && !autosaveEnabled) {
      saveOffers(offers).then(() => updateLastSaved());
    }
  }, [offers, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveCustomers();
    } else if (isInitialized && !autosaveEnabled) {
      saveCustomers(customers).then(() => updateLastSaved());
    }
  }, [customers, isInitialized, autosaveEnabled]);

  const handleSaveOffer = useCallback((offer: Offer) => {
    setOffers(prevOffers => [...prevOffers, offer]);
  }, []);

  // Get current theme (memoized)
  const currentTheme = useMemo(
    () => resolveTheme((settings.theme as ThemeName | undefined) ?? "light", settings.themeSettings),
    [settings.theme, settings.themeSettings]
  );

  const themeStyles = useMemo(() => getThemeStyles(currentTheme), [currentTheme]);

  const animationSettings = useMemo(
    () => ({
      ...defaultAnimationSettings,
      ...(settings.animationSettings ?? {}),
    }),
    [settings.animationSettings]
  );

  const pageTransitionVariants = useMemo(() => {
    switch (animationSettings.pageTransition) {
      case "slide":
        return {
          initial: { opacity: 0, x: 36, y: 0, scale: 1 },
          animate: { opacity: 1, x: 0, y: 0, scale: 1 },
          exit: { opacity: 0, x: -24, y: 0, scale: 0.98 },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.96, y: 6 },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 1.04, y: -12 },
        };
      case "flip":
        return {
          initial: { opacity: 0, rotateY: 75, scale: 0.96 },
          animate: { opacity: 1, rotateY: 0, scale: 1 },
          exit: { opacity: 0, rotateY: -75, scale: 0.96 },
        };
      case "parallax":
        return {
          initial: { opacity: 0, y: 48, scale: 0.94 },
          animate: { opacity: 1, y: 0, scale: 1 },
          exit: { opacity: 0, y: -36, scale: 0.98 },
        };
      case "fade":
      default:
        return {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -12 },
        };
    }
  }, [animationSettings.pageTransition]);

  const pageTransitionTiming =
    animationSettings.pageTransition === "scale"
      ? { duration: 0.32, ease: "easeOut" as const }
      : animationSettings.pageTransition === "slide"
      ? { duration: 0.28, ease: "easeOut" as const }
      : animationSettings.pageTransition === "flip"
      ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
      : animationSettings.pageTransition === "parallax"
      ? { duration: 0.36, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
      : { duration: 0.24, ease: "easeOut" as const };

  useEffect(() => {
    if (animationSettings.smoothScroll) {
      document.documentElement.style.scrollBehavior = "smooth";
    } else {
      document.documentElement.style.scrollBehavior = "auto";
    }
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, [animationSettings.smoothScroll]);

  // Shortcut help (Ctrl/Cmd + ?)
  useKeyboardShortcut("?", () => {
    setShowShortcutHelp(true);
  }, { ctrl: true });

  useKeyboardShortcut("?", () => {
    setShowShortcutHelp(true);
  }, { meta: true });

  // Page component (memoized)
  const PageComponent = useMemo(() => {
    switch (activePage) {
      case "filaments": 
        return <Filaments filaments={filaments} setFilaments={setFilaments} settings={settings} theme={currentTheme} themeStyles={themeStyles} />; 
      case "printers":
        return <Printers printers={printers} setPrinters={setPrinters} settings={settings} theme={currentTheme} themeStyles={themeStyles} />;
      case "calculator": 
        return <Calculator printers={printers} filaments={filaments} customers={customers} settings={settings} onSaveOffer={handleSaveOffer} theme={currentTheme} themeStyles={themeStyles} />; 
      case "offers":
        return (
          <Offers
            offers={offers}
            setOffers={setOffers}
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
            printers={printers}
            filaments={filaments}
          />
        );
      case "customers":
        return (
          <Customers
            customers={customers}
            setCustomers={setCustomers}
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
            offers={offers}
          />
        );
      case "priceTrends":
        return (
          <PriceTrends
            filaments={filaments}
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
          />
        );
      case "calendar":
        return (
          <Calendar
            offers={offers}
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
          />
        );
      case "settings": 
        return <SettingsPage 
          settings={settings} 
          onChange={setSettings}
          printers={printers}
          setPrinters={setPrinters}
          filaments={filaments}
          setFilaments={setFilaments}
          offers={offers}
          setOffers={setOffers}
          theme={currentTheme}
          themeStyles={themeStyles}
        />; 
      case "console":
        return <Console settings={settings} theme={currentTheme} themeStyles={themeStyles} />;
      default: 
        return <Home settings={settings} offers={offers} theme={currentTheme} />;
    }
  }, [activePage, filaments, printers, offers, customers, settings, currentTheme, themeStyles, handleSaveOffer, setFilaments, setPrinters, setOffers, setCustomers]);

  // Determine if this is a beta build from environment variable (set at build time)
  const isBeta = import.meta.env.VITE_IS_BETA === 'true';

  const loadingMessage = t("common.loading");

  const loadingPlaceholder = animationSettings.loadingSkeletons ? (
    <LoadingSkeletonPage theme={currentTheme} />
  ) : (
    <LoadingSpinner message={loadingMessage} />
  );

  return (
    <ErrorBoundary>
      <ToastProvider settings={settings}>
        <div style={{ 
          height: "100vh", 
          width: "100vw", 
          overflow: "hidden",
          ...(currentTheme.colors.background?.includes('gradient') 
            ? {
                backgroundImage: currentTheme.colors.background,
                backgroundAttachment: "fixed",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }
            : {
                backgroundColor: currentTheme.colors.background,
              }
          ),
          color: currentTheme.colors.text,
        }}>
          <UpdateChecker settings={settings} />
          <Sidebar 
            activePage={activePage} 
            setActivePage={setActivePage} 
            settings={settings} 
            isBeta={isBeta} 
            theme={currentTheme}
            isOpen={isSidebarOpen}
          />
          <Header
            lastSaved={lastSaved} 
            settings={settings} 
            theme={currentTheme}
            onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            isSidebarOpen={isSidebarOpen}
            autosaveInterval={settings.autosaveInterval || 30}
            activePage={activePage}
            onPageChange={setActivePage}
            themeStyles={themeStyles}
          />
          <main style={{ 
            padding: "20px", 
            paddingTop: "90px",
            backgroundColor: currentTheme.colors.background?.includes('gradient')
              ? "transparent"
              : currentTheme.colors.background,
            color: currentTheme.colors.text,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            left: isSidebarOpen ? "260px" : "0",
            width: isSidebarOpen ? "calc(100vw - 260px)" : "100vw",
            height: "100vh",
            boxSizing: "border-box",
            transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            perspective: animationSettings.pageTransition === "flip" ? "1200px" : undefined,
          }}>
            {!isInitialized ? (
              loadingPlaceholder
            ) : (
              <Suspense fallback={loadingPlaceholder}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activePage}
                    initial={pageTransitionVariants.initial}
                    animate={pageTransitionVariants.animate}
                    exit={pageTransitionVariants.exit}
                    transition={pageTransitionTiming}
                    style={{
                      height: "100%",
                      transformStyle: animationSettings.pageTransition === "flip" ? "preserve-3d" : "flat",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    {PageComponent}
                  </motion.div>
                </AnimatePresence>
              </Suspense>
            )}
          </main>
          <AnimatePresence>
            {showShortcutHelp && (
              <ShortcutHelp
                settings={settings}
                theme={currentTheme}
                themeStyles={themeStyles}
                onClose={() => setShowShortcutHelp(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
