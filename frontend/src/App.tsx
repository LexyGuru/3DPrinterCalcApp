import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UpdateChecker } from "./components/UpdateChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { AppSkeleton } from "./components/AppSkeleton";

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
import { GlobalSearch } from "./components/GlobalSearch";
import { Tutorial } from "./components/Tutorial";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { LanguageSelector } from "./components/LanguageSelector";
import "./utils/consoleLogger"; // Initialize console logger
import "./utils/keyboardShortcuts"; // Initialize keyboard shortcuts
import { initFrontendLog } from "./utils/fileLogger"; // Initialize file logger
import { logWithLanguage } from "./utils/languages/global_console";
import { useTranslation } from "./utils/translations";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date()); // Kezdeti érték, hogy azonnal látható legyen
  const [quickActionTrigger, setQuickActionTrigger] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const t = useTranslation(settings.language);

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

  // 🔹 Első indítás ellenőrzése - nyelvválasztó megjelenítése
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const loadedSettings = await loadSettings();
        // Ha nincs mentett beállítás, vagy nincs nyelv beállítva, akkor első indítás
        if (!loadedSettings || !loadedSettings.language) {
          setShowLanguageSelector(true);
          return; // Ne folytassa a betöltést, várjuk meg a nyelvválasztást
        }
        // Ha van beállítás, folytassa normálisan
        setLanguageSelected(true);
      } catch (error) {
        console.error("Hiba a beállítások ellenőrzésekor:", error);
        // Hiba esetén is mutassuk a nyelvválasztót
        setShowLanguageSelector(true);
      }
    };
    checkFirstLaunch();
  }, []);

  // 🔹 Nyelvválasztó callback - nyelv kiválasztása után
  const handleLanguageSelect = async (language: import("./types").LanguageCode) => {
    const newSettings = {
      ...defaultSettings,
      language,
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    setLanguageSelected(true);
    setShowLanguageSelector(false);
  };

  // 🔹 Betöltés indításkor - Progress tracking-gel (csak ha a nyelv kiválasztva)
  useEffect(() => {
    if (!languageSelected) return; // Várjuk meg a nyelvválasztást
    
    const loadData = async () => {
      // Minimális késleltetés, hogy látható legyen a skeleton
      await new Promise(resolve => setTimeout(resolve, 200));
      
      try {
        // 1. Beállítások
        setLoadingStep(0);
        setLoadingProgress(10);
        await new Promise(resolve => setTimeout(resolve, 100)); // Smooth progress update
        const loadedSettings = await loadSettings();
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
          setSettings(defaultSettings);
        }
        setLoadingProgress(20);
        await new Promise(resolve => setTimeout(resolve, 150));

        // 2. Nyomtatók
        setLoadingStep(1);
        setLoadingProgress(35);
        await new Promise(resolve => setTimeout(resolve, 100));
        const loadedPrinters = await loadPrinters();
        if (loadedPrinters.length > 0) {
          setPrinters(loadedPrinters);
        }

        // 3. Filamentek
        setLoadingStep(2);
        setLoadingProgress(50);
        await new Promise(resolve => setTimeout(resolve, 100));
        const loadedFilaments = await loadFilaments();
        if (loadedFilaments.length > 0) {
          setFilaments(loadedFilaments);
        }

        // 4. Árajánlatok
        setLoadingStep(3);
        setLoadingProgress(70);
        await new Promise(resolve => setTimeout(resolve, 100));
        const loadedOffers = await loadOffers();
        if (loadedOffers.length > 0) {
          setOffers(loadedOffers);
        }

        // 5. Ügyfelek
        setLoadingStep(4);
        setLoadingProgress(85);
        await new Promise(resolve => setTimeout(resolve, 100));
        const loadedCustomers = await loadCustomers();
        if (loadedCustomers.length > 0) {
          setCustomers(loadedCustomers);
        }

        // 6. Befejezés
        setLoadingStep(5);
        setLoadingProgress(100);
        
        // Kis késleltetés a smooth átmenethez
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setIsInitialized(true);
        setLastSaved(new Date());
        
        // Tutorial indítás, ha be van állítva és még nem nézték meg
        // Csak akkor mutassuk, ha:
        // 1. showTutorialOnStartup explicit true (vagy undefined, ami alapértelmezett true)
        // 2. ÉS tutorialCompleted NEM true (vagyis false vagy undefined)
        // 3. ÉS a nyelv már kiválasztva (nem első indítás)
        const shouldShowTutorial = 
          languageSelected &&
          (loadedSettings?.showTutorialOnStartup !== false) && 
          (loadedSettings?.tutorialCompleted !== true);
        
        if (import.meta.env.DEV) {
          console.log("🔍 Tutorial ellenőrzés:", {
            languageSelected,
            showTutorialOnStartup: loadedSettings?.showTutorialOnStartup,
            tutorialCompleted: loadedSettings?.tutorialCompleted,
            shouldShowTutorial,
          });
        }
        
        if (shouldShowTutorial) {
          // Kis késleltetés, hogy az app betöltődjön
          setTimeout(() => {
            setShowTutorial(true);
            if (import.meta.env.DEV) {
              console.log("✅ Tutorial elindítva");
            }
          }, 800);
        }
      } catch (error) {
        console.error("Hiba az adatok betöltésekor:", error);
        setIsInitialized(true); // Mégis inicializáljuk, hogy ne ragadjon be
      }
    };
    loadData();
  }, [languageSelected, settings.language]);

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

  // Alapértelmezett téma a nyelvválasztóhoz (ha még nincs beállítás)
  const defaultTheme = useMemo(
    () => resolveTheme("light", undefined),
    []
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

  // Global search (Ctrl/Cmd + K)
  useKeyboardShortcut("k", () => {
    if (!showGlobalSearch) {
      setShowGlobalSearch(true);
    }
  }, { ctrl: true });

  useKeyboardShortcut("k", () => {
    if (!showGlobalSearch) {
      setShowGlobalSearch(true);
    }
  }, { meta: true });

  // Tutorial event listener (Settings-ből való újraindításhoz)
  useEffect(() => {
    const handleStartTutorial = () => {
      // Reset tutorial completed status és indítsd újra
      const newSettings = { ...settings, tutorialCompleted: false };
      setSettings(newSettings);
      setShowTutorial(true);
      // Azonnal mentjük
      saveSettings(newSettings).catch((error) => {
        console.error("❌ Hiba a tutorial reset mentésekor:", error);
      });
    };
    
    window.addEventListener('start-tutorial', handleStartTutorial);
    
    return () => {
      window.removeEventListener('start-tutorial', handleStartTutorial);
    };
  }, [settings]);

  // Reset quickActionTrigger when page changes or after form opens
  useEffect(() => {
    if (quickActionTrigger) {
      // If we just navigated to a page, trigger the form after a short delay
      const timer = setTimeout(() => {
        if (quickActionTrigger && (
          (quickActionTrigger === 'add-filament' && activePage === 'filaments') ||
          (quickActionTrigger === 'add-printer' && activePage === 'printers') ||
          (quickActionTrigger === 'add-customer' && activePage === 'customers')
        )) {
          // Form will be opened by the component's useEffect
          setTimeout(() => setQuickActionTrigger(null), 200);
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [activePage, quickActionTrigger]);

  // Page component (memoized)
  const PageComponent = useMemo(() => {
    switch (activePage) {
      case "filaments": 
        return <Filaments filaments={filaments} setFilaments={setFilaments} settings={settings} theme={currentTheme} themeStyles={themeStyles} triggerAddForm={quickActionTrigger === 'add-filament'} onSettingsChange={(newSettings) => {
          setSettings(newSettings);
          debouncedSaveSettings();
        }} />; 
      case "printers":
        return <Printers printers={printers} setPrinters={setPrinters} settings={settings} theme={currentTheme} themeStyles={themeStyles} triggerAddForm={quickActionTrigger === 'add-printer'} onSettingsChange={(newSettings) => {
          setSettings(newSettings);
          debouncedSaveSettings();
        }} />;
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
            customers={customers}
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
            triggerAddForm={quickActionTrigger === 'add-customer'}
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
        return <Home settings={settings} offers={offers} theme={currentTheme} onSettingsChange={(newSettings) => {
          setSettings(newSettings);
          // A Home komponensben az onLayoutChange már meghívja a saveSettings-t
        }} />;
    }
  }, [activePage, filaments, printers, offers, customers, settings, currentTheme, themeStyles, handleSaveOffer, setFilaments, setPrinters, setOffers, setCustomers, quickActionTrigger]);

  // Determine if this is a beta build from environment variable (set at build time)
  const isBeta = import.meta.env.VITE_IS_BETA === 'true';

  const loadingSteps = useMemo(() => {
    const calculateStepProgress = (stepIndex: number, totalSteps: number) => {
      const stepStart = (stepIndex / totalSteps) * 100;
      const stepEnd = ((stepIndex + 1) / totalSteps) * 100;
      
      if (loadingProgress < stepStart) return 0;
      if (loadingProgress >= stepEnd) return 100;
      
      // Interpolate between step start and end
      const progressInStep = ((loadingProgress - stepStart) / (stepEnd - stepStart)) * 100;
      return Math.min(100, Math.max(0, progressInStep));
    };

    const totalSteps = 6;
    return [
      { label: t("loading.settings"), progress: calculateStepProgress(0, totalSteps) },
      { label: t("loading.printers"), progress: calculateStepProgress(1, totalSteps) },
      { label: t("loading.filaments"), progress: calculateStepProgress(2, totalSteps) },
      { label: t("loading.offers"), progress: calculateStepProgress(3, totalSteps) },
      { label: t("loading.customers"), progress: calculateStepProgress(4, totalSteps) },
      { label: t("loading.initialization"), progress: calculateStepProgress(5, totalSteps) },
    ];
  }, [loadingProgress, t]);

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
            onQuickAction={(action) => {
              // Navigate to the appropriate page if needed
              if (action === 'add-filament' && activePage !== 'filaments') {
                setActivePage('filaments');
                setQuickActionTrigger(action);
              } else if (action === 'add-printer' && activePage !== 'printers') {
                setActivePage('printers');
                setQuickActionTrigger(action);
              } else if (action === 'add-customer' && activePage !== 'customers') {
                setActivePage('customers');
                setQuickActionTrigger(action);
              } else if (action === 'add-filament' || action === 'add-printer' || action === 'add-customer') {
                // If already on the page, just trigger the form
                setQuickActionTrigger(action);
                // Reset after a short delay
                setTimeout(() => setQuickActionTrigger(null), 100);
              }
            }}
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
              <AppSkeleton 
                theme={currentTheme}
                settings={settings}
                loadingSteps={loadingSteps}
                currentStep={loadingStep}
              />
            ) : (
              <Suspense fallback={
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  width: "100%",
                  backgroundColor: currentTheme.colors.background?.includes('gradient') 
                    ? 'transparent' 
                    : currentTheme.colors.background,
                }}>
                  <LoadingSpinner size="large" message={t("loading.title")} />
                </div>
              }>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={activePage}
                    data-page={activePage}
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
          <GlobalSearch
            isOpen={showGlobalSearch}
            onClose={() => setShowGlobalSearch(false)}
            onNavigate={(page) => {
              setActivePage(page);
              // If navigating to a page with quick action, trigger it
              if (page === 'filaments' || page === 'printers' || page === 'customers') {
                setQuickActionTrigger(`add-${page}`);
              } else if (page === 'calculator') {
                // For calculator, we might want to trigger new offer
                setQuickActionTrigger('new-offer');
              }
            }}
            theme={currentTheme}
            themeStyles={themeStyles}
            settings={settings}
            offers={offers}
            onAddFilamentFromLibrary={(libraryEntry) => {
              // Hozzáadás a mentett filamentekhez
              const newFilament: Filament = {
                brand: libraryEntry.manufacturer,
                type: libraryEntry.material,
                weight: 1000, // Alapértelmezett súly
                pricePerKg: 0, // Alapértelmezett ár (felhasználó beállíthatja)
                color: libraryEntry.rawColor || undefined,
                colorHex: libraryEntry.hex || undefined,
                colorMode: libraryEntry.colorMode,
                multiColorHint: libraryEntry.multiColorHint || undefined,
              };
              setFilaments([...filaments, newFilament]);
              // Navigálás a filamentek oldalra
              setActivePage('filaments');
            }}
          />
          
          {/* Language Selector - első indításkor */}
          {showLanguageSelector && (
            <LanguageSelector
              onLanguageSelect={handleLanguageSelect}
              theme={currentTheme || defaultTheme}
            />
          )}

          {/* Tutorial */}
          <Tutorial
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
            isOpen={showTutorial}
            onOpenGlobalSearch={() => {
              // Megnyitjuk a GlobalSearch-et a tutorial során
              if (!showGlobalSearch) {
                setShowGlobalSearch(true);
              }
            }}
            onCloseGlobalSearch={() => {
              // Bezárjuk a GlobalSearch-et, ha elhagyjuk a global-search lépést
              if (showGlobalSearch) {
                setShowGlobalSearch(false);
              }
            }}
            onComplete={async () => {
              setShowTutorial(false);
              const updatedSettings = { 
                ...settings, 
                tutorialCompleted: true,
                showTutorialOnStartup: false, // Ne mutassa többet indításkor
              };
              setSettings(updatedSettings);
              // Azonnal mentjük, hogy biztosan elmentődjön
              try {
                await saveSettings(updatedSettings);
                if (import.meta.env.DEV) {
                  console.log("✅ Tutorial completed státusz mentve:", updatedSettings);
                }
              } catch (error) {
                console.error("❌ Hiba a tutorial completed státusz mentésekor:", error);
              }
            }}
            onSkip={() => {
              // Skip esetén csak bezárjuk, de NEM állítjuk be a completed-et
              setShowTutorial(false);
              if (import.meta.env.DEV) {
                console.log("⏭️ Tutorial kihagyva (nincs completed beállítva)");
              }
            }}
            currentPage={activePage}
            onNavigate={(page) => {
              setActivePage(page);
            }}
          />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
