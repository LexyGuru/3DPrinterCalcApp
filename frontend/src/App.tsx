import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { UpdateChecker } from "./components/UpdateChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { AppSkeleton } from "./components/AppSkeleton";
import { BackupReminder } from "./components/BackupReminder";
import { AppProvider } from "./router/AppContext";
import { AppRouter } from "./router/AppRouter";
import { PAGE_TO_ROUTE, ROUTE_TO_PAGE } from "./router/routes";

// Lazy loading komponensek most a router/routes.tsx-ben vannak definiálva
import type { Printer, Settings, Filament, Offer, Customer, ThemeName, Project, Task } from "./types";
import { defaultSettings } from "./types";
import { savePrinters, loadPrinters, saveFilaments, loadFilaments, saveSettings, loadSettings, saveOffers, loadOffers, saveCustomers, loadCustomers, loadProjects, loadTasks, resetStoreInstance } from "./utils/store";
import { createAutomaticBackup, cleanupOldBackups } from "./utils/backup";
import { cleanupOldLogs } from "./utils/logCleanup";
import { cleanupOldAuditLogs } from "./utils/auditLogCleanup";
import { getThemeStyles, resolveTheme } from "./utils/themes";
import { defaultAnimationSettings } from "./types";
import { debounce } from "./utils/debounce";
import { useKeyboardShortcut } from "./utils/keyboardShortcuts";
import { ShortcutHelp } from "./components/ShortcutHelp";
import { GlobalSearch } from "./components/GlobalSearch";
import { Tutorial } from "./components/Tutorial";
import { WelcomeMessage } from "./components/WelcomeMessage";
import { HelpMenu } from "./components/HelpMenu";
import { LanguageSelector } from "./components/LanguageSelector";
import "./utils/consoleLogger"; // Initialize console logger
import "./utils/keyboardShortcuts"; // Initialize keyboard shortcuts
import { initFrontendLog, frontendLogger, writeFrontendLog, setAppLoaded, setLogSettings } from "./utils/fileLogger"; // Initialize file logger
import { logWithLanguage } from "./utils/languages/global_console";
import { useTranslation } from "./utils/translations";
import { logApplicationStartup, resetLoggingFlags } from "./utils/appLogging"; // Centralized application logging
import { PerformanceTimer, logMemoryUsage, logPerformanceSummary, logPeriodicPerformanceMetrics, type PerformanceMetric } from "./utils/performance"; // Performance metrikák
import { auditCreate } from "./utils/auditLog"; // Audit log

// Belső AppContent komponens - használja a Router hook-okat
function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // activePage a location.pathname-ből származik
  const activePage = useMemo(() => {
    return ROUTE_TO_PAGE[location.pathname] || "home";
  }, [location.pathname]);
  
  // setActivePage wrapper - navigate-et használ
  const setActivePage = useCallback((page: string) => {
    const route = PAGE_TO_ROUTE[page] || "/";
    navigate(route);
  }, [navigate]);

  return <AppInner activePage={activePage} setActivePage={setActivePage} />;
}

// Belső App komponens - tartalmazza az összes logikát
function AppInner({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStep, setLoadingStep] = useState(0);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date()); // Kezdeti érték, hogy azonnal látható legyen
  const [previousAutosaveState, setPreviousAutosaveState] = useState<boolean | undefined>(settings.autosave); // Előző autosave állapot követése
  const [quickActionTrigger, setQuickActionTrigger] = useState<string | null>(null);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialWillOpen, setTutorialWillOpen] = useState(false); // Jelzi, hogy a tutorial meg fog nyílni (még mielőtt megnyílik)
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessageShown, setWelcomeMessageShown] = useState(false); // Jelzi, hogy az üdvözlő üzenet már meg lett mutatva ebben a munkamenetben
  const [showHelpMenu, setShowHelpMenu] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [languageSelected, setLanguageSelected] = useState(false);
  const [settingsInitialModal, setSettingsInitialModal] = useState<"log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history" | null>(null);
  const t = useTranslation(settings.language);

  // 🔹 Log settings frissítése, amikor a settings változik
  useEffect(() => {
    setLogSettings(settings);
  }, [settings]);

  // 🔹 Első indítás ellenőrzése - nyelvválasztó megjelenítése
  // NE hívjuk meg a loadSettings()-et, mert az automatikusan létrehozza a data.json fájlt!
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        // Ellenőrizzük, hogy létezik-e a data.json fájl, anélkül hogy betöltjük a Store-t
        const { exists } = await import("@tauri-apps/plugin-fs");
        const { BaseDirectory } = await import("@tauri-apps/plugin-fs");
        const dataJsonExists = await exists("data.json", { baseDir: BaseDirectory.AppConfig });
        
        if (!dataJsonExists) {
          // Ha nincs data.json, akkor első indítás - mutassuk a nyelvválasztót
          setShowLanguageSelector(true);
          return;
        }
        
        // Ha létezik a data.json, akkor betöltjük a beállításokat
        const loadedSettings = await loadSettings();
        // Ha nincs nyelv beállítva, akkor első indítás
        if (!loadedSettings || !loadedSettings.language) {
          setShowLanguageSelector(true);
          return; // Ne folytassa a betöltést, várjuk meg a nyelvválasztást
        }
        // Ha van beállítás, folytassa normálisan
        setLanguageSelected(true);
        
        // Inicializáljuk a logot, ha már van nyelv
        initFrontendLog().then((path) => {
          if (path) {
            console.log("✅ Frontend log fájl inicializálva:", path);
          }
        }).catch((error) => {
          console.error("⚠️ Frontend log inicializálási hiba:", error);
        });
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
    // Factory Reset után explicit módon nullázzuk ki a lastBackupDate-et is
    const newSettings = {
      ...defaultSettings,
      language,
      lastBackupDate: undefined, // Factory Reset után nincs backup dátum
    };
    setSettings(newSettings);
    await saveSettings(newSettings);
    
    // Újra bekapcsoljuk a logolást, mielőtt inicializáljuk a logger-t
    const { setLoggingEnabled } = await import("./utils/fileLogger");
    setLoggingEnabled(true);
    
    // Inicializáljuk a logot, miután kiválasztottak egy nyelvet
    initFrontendLog().then((path) => {
      if (path) {
        console.log("✅ Frontend log fájl inicializálva:", path);
      }
    }).catch((error) => {
      console.error("⚠️ Frontend log inicializálási hiba:", error);
    });
    
    // Újra indítjuk az appot, hogy minden helyesen töltődjön be
    setTimeout(() => {
      window.location.reload();
    }, 500); // Kis késleltetés, hogy a beállítások mentésre kerüljenek
  };

  // 🔹 Factory Reset callback - az összes állapot resetelése
  const handleFactoryReset = useCallback(() => {
    // Reseteljük a Store instance-t, hogy ne hozza létre automatikusan a fájlt
    resetStoreInstance();
    
    // Reseteljük a logolási flag-eket is
    resetLoggingFlags();
    
    // Reseteljük az összes state-et
    setPrinters([]);
    setFilaments([]);
    setOffers([]);
    setCustomers([]);
    setProjects([]);
    setTasks([]);
    // Explicit módon nullázzuk ki a lastBackupDate-et is a Factory Reset után
    setSettings({ ...defaultSettings, lastBackupDate: undefined });
    setIsInitialized(false);
    setLoadingProgress(0);
    setLoadingStep(0);
    setLastSaved(null);
    setActivePage("home");
    
    // Megjelenítjük a nyelvválasztót (mint első indításnál)
    setShowLanguageSelector(true);
    setLanguageSelected(false);
    
    if (import.meta.env.DEV) {
      console.log("🔄 Factory Reset - összes állapot resetelve, nyelvválasztó megjelenítve");
    }
  }, []);

  // 🔹 Adatok újratöltése (demo adatok generálása után)
  const reloadData = useCallback(async () => {
    try {
      // Betöltjük a settings-et is, hogy a lastBackupDate frissüljön
      const loadedSettings = await loadSettings();
      if (loadedSettings) {
        setSettings(loadedSettings);
        // Beállítjuk a log settings-et is
        setLogSettings(loadedSettings);
      }
      
      const loadedPrinters = await loadPrinters();
      if (loadedPrinters.length > 0) {
        setPrinters(loadedPrinters);
      }
      const loadedFilaments = await loadFilaments();
      if (loadedFilaments.length > 0) {
        setFilaments(loadedFilaments);
      }
      const loadedOffers = await loadOffers();
      if (loadedOffers.length > 0) {
        setOffers(loadedOffers);
      }
      const loadedCustomers = await loadCustomers();
      if (loadedCustomers.length > 0) {
        setCustomers(loadedCustomers);
      }
      const loadedProjects = await loadProjects();
      if (loadedProjects.length > 0) {
        setProjects(loadedProjects);
      }
      const loadedTasks = await loadTasks();
      if (loadedTasks.length > 0) {
        setTasks(loadedTasks);
      }
      console.log("✅ Adatok újratöltve demo adatok generálása után");
    } catch (error) {
      console.error("❌ Hiba az adatok újratöltésekor:", error);
    }
  }, []);

  // 🔹 Betöltés indításkor - Progress tracking-gel (csak ha a nyelv kiválasztva)
  useEffect(() => {
    if (!languageSelected) return; // Várjuk meg a nyelvválasztást
    
    // Lock mechanizmus - csak egyszer fusson le (React StrictMode miatt)
    const loadKey = '__app_data_loaded__';
    if ((window as any)[loadKey]) {
      return; // Már fut a betöltés
    }
    (window as any)[loadKey] = true;
    
    const loadData = async () => {
      try {
        // Minimális késleltetés, hogy látható legyen a skeleton
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 1. Rendszerinformációk és mappa információk logolása (csak egyszer, logikus sorrendben)
        await logApplicationStartup(true, true);
        
        // 2. Alkalmazás betöltés indítása
        await writeFrontendLog('INFO', '');
        await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
        await writeFrontendLog('INFO', '🚀 ALKALMAZÁS BETÖLTÉS INDÍTÁSA');
        await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
        // Ne hívjuk meg a console.info()-t, mert a consoleLogger által is fájlba íródik (duplikáció)
        
        // Performance metrikák tömbje az összefoglalóhoz
        const performanceMetrics: PerformanceMetric[] = [];
        
        // Memória használat mérése az elején
        await logMemoryUsage("Alkalmazás betöltés kezdete");
        
        let loadedSettings: Settings | null = null;
        let loadedPrintersCount = 0;
        let loadedFilamentsCount = 0;
        let loadedOffersCount = 0;
        let loadedCustomersCount = 0;
        let loadedProjectsCount = 0;
        let loadedTasksCount = 0;
        
        // 1. Beállítások betöltése (Performance metrikákkal)
        setLoadingStep(0);
        setLoadingProgress(10);
        await writeFrontendLog('INFO', "📥 [MODUL: Beállítások] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb, hogy olvasható legyen
        
        let settingsStatus: "success" | "warning" | "error" | "critical" = "success";
        let settingsStatusMessage = "";
        
        // Performance metrika mérése
        const settingsTimer = new PerformanceTimer("Beállítások betöltése", "loading", false);
        try {
            loadedSettings = await loadSettings();
            const settingsMetric = await settingsTimer.stop();
            performanceMetrics.push(settingsMetric);
            
            if (loadedSettings) {
              settingsStatusMessage = `✅ [MODUL: Beállítások] Betöltve - Valuta: ${loadedSettings.currency || "N/A"}, Nyelv: ${loadedSettings.language || "N/A"}`;
              await writeFrontendLog('INFO', settingsStatusMessage);
              
              // Beállítjuk a log settings-et
              setLogSettings(loadedSettings);
              
              // Ellenőrizzük hogy az electricityPrice érvényes érték-e
              if (!loadedSettings.electricityPrice || loadedSettings.electricityPrice <= 0) {
                settingsStatus = "warning";
                const warnMsg = `⚠️ [MODUL: Beállítások] FIGYELMEZTETÉS: Érvénytelen áram ár (${loadedSettings.electricityPrice}), alapértelmezett érték használata`;
                await writeFrontendLog('WARN', warnMsg);
                logWithLanguage(settings.language, "warn", "settings.invalidElectricityPrice");
                loadedSettings.electricityPrice = defaultSettings.electricityPrice;
              }
              
              // Ha nincs téma, használjuk az alapértelmezettet
              if (!loadedSettings.theme) {
                settingsStatus = "warning";
                await writeFrontendLog('WARN', "⚠️ [MODUL: Beállítások] FIGYELMEZTETÉS: Nincs téma beállítva, alapértelmezett használata");
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
              settingsStatus = "warning";
              settingsStatusMessage = "⚠️ [MODUL: Beállítások] FIGYELMEZTETÉS: Nincs mentett beállítás, alapértelmezett használata";
              await writeFrontendLog('WARN', settingsStatusMessage);
              setSettings(defaultSettings);
              loadedSettings = defaultSettings;
            }
          } catch (error) {
            settingsStatus = "error";
            settingsStatusMessage = `❌ [MODUL: Beállítások] HIBA: ${error instanceof Error ? error.message : String(error)}`;
            await settingsTimer.stopWithError(error);
            await writeFrontendLog('ERROR', settingsStatusMessage);
            console.error("❌ Hiba a beállítások betöltésekor:", error);
            setSettings(defaultSettings);
            loadedSettings = defaultSettings;
        }
        
        // Státusz logolása
        if (settingsStatus === "success") {
          await writeFrontendLog('INFO', "✅ [MODUL: Beállítások] Státusz: Minden rendben");
        } else if (settingsStatus === "warning") {
          await writeFrontendLog('WARN', `⚠️ [MODUL: Beállítások] Státusz: Figyelmeztetés - ${settingsStatusMessage}`);
        } else {
          await writeFrontendLog('ERROR', `❌ [MODUL: Beállítások] Státusz: Hiba - ${settingsStatusMessage}`);
        }
        
        setLoadingProgress(20);
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb

        // 2. Nyomtatók betöltése
        setLoadingStep(1);
        setLoadingProgress(35);
        await writeFrontendLog('INFO', "📥 [MODUL: Nyomtatók] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb
        
        let printersStatus: "success" | "warning" | "error" = "success";
        // Performance metrika mérése
        const printersTimer = new PerformanceTimer("Nyomtatók betöltése", "loading", false);
        try {
          const loadedPrinters = await loadPrinters();
          const printersMetric = await printersTimer.stop();
          performanceMetrics.push(printersMetric);
          
          loadedPrintersCount = loadedPrinters.length;
          
          if (loadedPrinters.length > 0) {
            setPrinters(loadedPrinters);
            await writeFrontendLog('INFO', `✅ [MODUL: Nyomtatók] Betöltve - ${loadedPrinters.length} nyomtató`);
            await writeFrontendLog('INFO', "✅ [MODUL: Nyomtatók] Státusz: Minden rendben");
          } else {
            printersStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Nyomtatók] Nincs mentett nyomtató");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Nyomtatók] Státusz: Figyelmeztetés - Nincs mentett nyomtató");
          }
        } catch (error) {
          printersStatus = "error";
          await printersTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Nyomtatók] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Nyomtatók] Státusz: Hiba");
          console.error("❌ Hiba a nyomtatók betöltésekor:", error);
          setPrinters([]);
          loadedPrintersCount = 0;
        }

        // 3. Filamentek betöltése
        setLoadingStep(2);
        setLoadingProgress(50);
        await writeFrontendLog('INFO', "📥 [MODUL: Filamentek] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb
        
        let filamentsStatus: "success" | "warning" | "error" = "success";
        // Performance metrika mérése
        const filamentsTimer = new PerformanceTimer("Filamentek betöltése", "loading", false);
        try {
          const loadedFilaments = await loadFilaments();
          const filamentsMetric = await filamentsTimer.stop();
          performanceMetrics.push(filamentsMetric);
          
          loadedFilamentsCount = loadedFilaments.length;
          
          if (loadedFilaments.length > 0) {
            setFilaments(loadedFilaments);
            await writeFrontendLog('INFO', `✅ [MODUL: Filamentek] Betöltve - ${loadedFilaments.length} filament`);
            await writeFrontendLog('INFO', "✅ [MODUL: Filamentek] Státusz: Minden rendben");
          } else {
            filamentsStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Filamentek] Nincs mentett filament");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Filamentek] Státusz: Figyelmeztetés - Nincs mentett filament");
          }
        } catch (error) {
          filamentsStatus = "error";
          await filamentsTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Filamentek] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Filamentek] Státusz: Hiba");
          console.error("❌ Hiba a filamentek betöltésekor:", error);
          setFilaments([]);
          loadedFilamentsCount = 0;
        }

        // 4. Árajánlatok betöltése
        setLoadingStep(3);
        setLoadingProgress(70);
        await writeFrontendLog('INFO', "📥 [MODUL: Árajánlatok] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb
        
        let offersStatus: "success" | "warning" | "error" = "success";
        // Performance metrika mérése
        const offersTimer = new PerformanceTimer("Árajánlatok betöltése", "loading", false);
        try {
          const loadedOffers = await loadOffers();
          const offersMetric = await offersTimer.stop();
          performanceMetrics.push(offersMetric);
          
          loadedOffersCount = loadedOffers.length;
          
          if (loadedOffers.length > 0) {
            setOffers(loadedOffers);
            await writeFrontendLog('INFO', `✅ [MODUL: Árajánlatok] Betöltve - ${loadedOffers.length} árajánlat`);
            await writeFrontendLog('INFO', "✅ [MODUL: Árajánlatok] Státusz: Minden rendben");
          } else {
            offersStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Árajánlatok] Nincs mentett árajánlat");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Árajánlatok] Státusz: Figyelmeztetés - Nincs mentett árajánlat");
          }
        } catch (error) {
          offersStatus = "error";
          await offersTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Árajánlatok] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Árajánlatok] Státusz: Hiba");
          console.error("❌ Hiba az árajánlatok betöltésekor:", error);
          setOffers([]);
          loadedOffersCount = 0;
        }

        // 5. Ügyfelek betöltése
        setLoadingStep(4);
        setLoadingProgress(85);
        await writeFrontendLog('INFO', "📥 [MODUL: Ügyfelek] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb
        
        let customersStatus: "success" | "warning" | "error" = "success";
        // Performance metrika mérése
        const customersTimer = new PerformanceTimer("Ügyfelek betöltése", "loading", false);
        try {
          const loadedCustomers = await loadCustomers();
          const customersMetric = await customersTimer.stop();
          performanceMetrics.push(customersMetric);
          
          loadedCustomersCount = loadedCustomers.length;
          
          if (loadedCustomers.length > 0) {
            setCustomers(loadedCustomers);
            await writeFrontendLog('INFO', `✅ [MODUL: Ügyfelek] Betöltve - ${loadedCustomers.length} ügyfél`);
            await writeFrontendLog('INFO', "✅ [MODUL: Ügyfelek] Státusz: Minden rendben");
          } else {
            customersStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Ügyfelek] Nincs mentett ügyfél");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Ügyfelek] Státusz: Figyelmeztetés - Nincs mentett ügyfél");
          }
        } catch (error) {
          customersStatus = "error";
          await customersTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Ügyfelek] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Ügyfelek] Státusz: Hiba");
          console.error("❌ Hiba az ügyfelek betöltésekor:", error);
          setCustomers([]);
          loadedCustomersCount = 0;
        }

        // 6. Projektek betöltése
        setLoadingStep(5);
        setLoadingProgress(90);
        await writeFrontendLog('INFO', "📥 [MODUL: Projektek] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let projectsStatus: "success" | "warning" | "error" = "success";
        const projectsTimer = new PerformanceTimer("Projektek betöltése", "loading", false);
        try {
          const loadedProjects = await loadProjects();
          const projectsMetric = await projectsTimer.stop();
          performanceMetrics.push(projectsMetric);
          
          loadedProjectsCount = loadedProjects.length;
          
          if (loadedProjects.length > 0) {
            setProjects(loadedProjects);
            await writeFrontendLog('INFO', `✅ [MODUL: Projektek] Betöltve - ${loadedProjects.length} projekt`);
            await writeFrontendLog('INFO', "✅ [MODUL: Projektek] Státusz: Minden rendben");
          } else {
            projectsStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Projektek] Nincs mentett projekt");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Projektek] Státusz: Figyelmeztetés - Nincs mentett projekt");
          }
        } catch (error) {
          projectsStatus = "error";
          await projectsTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Projektek] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Projektek] Státusz: Hiba");
          console.error("❌ Hiba a projektek betöltésekor:", error);
          setProjects([]);
          loadedProjectsCount = 0;
        }

        // 7. Feladatok betöltése
        setLoadingStep(6);
        setLoadingProgress(95);
        await writeFrontendLog('INFO', "📥 [MODUL: Feladatok] Betöltés indítása...");
        
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let tasksStatus: "success" | "warning" | "error" = "success";
        const tasksTimer = new PerformanceTimer("Feladatok betöltése", "loading", false);
        try {
          const loadedTasks = await loadTasks();
          const tasksMetric = await tasksTimer.stop();
          performanceMetrics.push(tasksMetric);
          
          loadedTasksCount = loadedTasks.length;
          
          if (loadedTasks.length > 0) {
            setTasks(loadedTasks);
            await writeFrontendLog('INFO', `✅ [MODUL: Feladatok] Betöltve - ${loadedTasks.length} feladat`);
            await writeFrontendLog('INFO', "✅ [MODUL: Feladatok] Státusz: Minden rendben");
          } else {
            tasksStatus = "warning";
            await writeFrontendLog('INFO', "ℹ️ [MODUL: Feladatok] Nincs mentett feladat");
            await writeFrontendLog('WARN', "⚠️ [MODUL: Feladatok] Státusz: Figyelmeztetés - Nincs mentett feladat");
          }
        } catch (error) {
          tasksStatus = "error";
          await tasksTimer.stopWithError(error);
          const errorMsg = `❌ [MODUL: Feladatok] HIBA: ${error instanceof Error ? error.message : String(error)}`;
          await writeFrontendLog('ERROR', errorMsg);
          await writeFrontendLog('ERROR', "❌ [MODUL: Feladatok] Státusz: Hiba");
          console.error("❌ Hiba a feladatok betöltésekor:", error);
          setTasks([]);
          loadedTasksCount = 0;
        }

        // 8. Inicializálás
        setLoadingStep(7);
        setLoadingProgress(100);
        await writeFrontendLog('INFO', "📥 [MODUL: Inicializálás] Alkalmazás inicializálása...");
        
        await new Promise(resolve => setTimeout(resolve, 800)); // Lassabb, hogy olvasható legyen
        
        // Betöltési összefoglaló
        const statusSummary = {
          settings: settingsStatus,
          printers: printersStatus,
          filaments: filamentsStatus,
          offers: offersStatus,
          customers: customersStatus,
          projects: projectsStatus,
          tasks: tasksStatus,
        };
        
        const hasWarnings = Object.values(statusSummary).some(s => s === "warning");
        const hasErrors = Object.values(statusSummary).some(s => s === "error");
        
        let summaryStatus = "✅ Minden rendben";
        if (hasErrors) {
          summaryStatus = "❌ Hibák vannak";
        } else if (hasWarnings) {
          summaryStatus = "⚠️ Figyelmeztetések vannak";
        }
        
        await writeFrontendLog('INFO', '─────────────────────────────────────────────────────────────────');
        const summaryMsg = `✅ Alkalmazás betöltés befejezve - Nyomtatók: ${loadedPrintersCount}, Filamentek: ${loadedFilamentsCount}, Árajánlatok: ${loadedOffersCount}, Ügyfelek: ${loadedCustomersCount}, Projektek: ${loadedProjectsCount}, Feladatok: ${loadedTasksCount}, Beállítások: ${loadedSettings ? "✅" : "⚠️ Alapértelmezett"}`;
        const statusMsg = `📊 Betöltési összefoglaló: ${summaryStatus}`;
        const detailMsg = `📊 Részletes státuszok - Beállítások: ${settingsStatus}, Nyomtatók: ${printersStatus}, Filamentek: ${filamentsStatus}, Árajánlatok: ${offersStatus}, Ügyfelek: ${customersStatus}, Projektek: ${projectsStatus}, Feladatok: ${tasksStatus}`;
        
        // Közvetlenül fájlba írunk, nem frontendLogger-rel (hogy ne legyen duplikáció)
        await writeFrontendLog('INFO', summaryMsg);
        await writeFrontendLog('INFO', statusMsg);
        await writeFrontendLog('INFO', detailMsg);
        await writeFrontendLog('INFO', '═══════════════════════════════════════════════════════════');
        
        // Performance összefoglaló logolása
        if (performanceMetrics.length > 0) {
          await logPerformanceSummary(performanceMetrics);
        }
        
        // Memória használat mérése a végén
        await logMemoryUsage("Alkalmazás betöltés vége");
        
        // Ne írunk console-ra is, mert a writeFrontendLog() már fájlba ír,
        // és a console.info() újra fájlba írna a consoleLogger miatt (duplikáció)
        
        // Kis késleltetés a smooth átmenethez
        await new Promise(resolve => setTimeout(resolve, 1000)); // Lassabb, hogy látható legyen a 100%
        
        setIsInitialized(true);
        setLastSaved(new Date());
        
        // Jelöljük, hogy az alkalmazás betöltődött - ezt követően írunk fájlba minden logot
        setAppLoaded(true);
        
        frontendLogger.info("✅ Alkalmazás inicializálva és kész a használatra");
        
        // 🔹 Tutorial indítás (ha be van kapcsolva), tutorial után jön az üdvözlő üzenet
        const settingsToUse = loadedSettings || defaultSettings;
        const shouldShowTutorial = 
          languageSelected &&
          (settingsToUse?.showTutorialOnStartup !== false) && 
          (settingsToUse?.tutorialCompleted !== true);
        
        if (shouldShowTutorial) {
          // 🔹 Jelöljük, hogy a tutorial meg fog nyílni - így a BackupReminder komponens nem jelenik meg
          setTutorialWillOpen(true);
          
          // 🔹 Azonnal beállítjuk a lastBackupDate-et, hogy ne jelenjen meg a backup emlékeztető tutorial alatt
          if (!settingsToUse?.lastBackupDate) {
            const updatedSettingsForTutorial: Settings = {
              ...settingsToUse,
              lastBackupDate: new Date().toISOString(),
            };
            await saveSettings(updatedSettingsForTutorial);
            setSettings(updatedSettingsForTutorial);
            if (import.meta.env.DEV) {
              console.log("✅ lastBackupDate beállítva tutorial indításához - backup emlékeztető letiltva");
            }
          }
          
          // Kis késleltetés, hogy az app betöltődjön
          setTimeout(() => {
            setShowTutorial(true);
            if (import.meta.env.DEV) {
              console.log("✅ Tutorial elindítva");
            }
          }, 800);
        } else {
          setTutorialWillOpen(false);
          
          // 🔹 Ha nincs tutorial, akkor közvetlenül megjelenítjük az üdvözlő üzenetet (ha be van kapcsolva)
          if (!welcomeMessageShown && (settingsToUse?.showWelcomeMessageOnStartup !== false)) {
            setTimeout(() => {
              setShowWelcomeMessage(true);
              if (import.meta.env.DEV) {
                console.log("✅ Üdvözlő üzenet megjelenítve (nincs tutorial)");
              }
            }, 800);
          }
        }
      } catch (error) {
        const errorMsg = `❌ [KRITIKUS HIBA] Alkalmazás betöltés során váratlan hiba: ${error instanceof Error ? error.message : String(error)}`;
        frontendLogger.error(errorMsg);
        frontendLogger.error("❌ [KRITIKUS HIBA] Státusz: Kritikus hiba - Az alkalmazás nem tudott teljesen betöltődni");
        console.error("❌ Hiba az adatok betöltésekor:", error);
        setIsInitialized(true); // Mégis inicializáljuk, hogy ne ragadjon be
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [languageSelected]);

  // 🔹 Automatikus mentés debounce-szal (csak inicializálás után)
  const autosaveEnabled = settings.autosave === true; // Csak akkor engedélyezett, ha explicit true
  const autosaveInterval = (settings.autosaveInterval || 30) * 1000; // Másodperc -> milliszekundum

  // Helper function to update last saved timestamp
  const updateLastSaved = () => {
    const now = new Date();
    setLastSaved(now);
    if (import.meta.env.DEV) {
      console.log("💾 Last saved timestamp frissítve:", now.toLocaleTimeString());
    }
  };

  // 🔹 Automatikus backup létrehozása (vészbackup)
  const createAutomaticBackupIfEnabled = useCallback(async () => {
    // Csak akkor hozzuk létre a backup-ot, ha az autosave be van kapcsolva
    if (!autosaveEnabled || !isInitialized) {
      return;
    }

    try {
      // Használjuk a settings state-et (ne a loadSettings()-et), hogy ne írjuk felül a friss értékeket
      // A settings state mindig tartalmazza a legfrissebb értékeket (pl. téma változás)
      const settingsToUse = settings;
      
      // Létrehozzuk az automatikus backup-ot a legfrissebb adatokkal
      const backupResult = await createAutomaticBackup(printers, filaments, offers, settingsToUse);
      
      if (backupResult) {
        // Csak akkor frissítjük a beállításokat, ha valóban új backup jött létre
        // Ha már létezett mai backup, akkor NEM írjuk felül a beállításokat (hogy ne veszítsük el a friss értékeket)
        if (backupResult.isNew) {
          // Új backup jött létre - frissítjük a lastBackupDate-et
          // Betöltjük a legfrissebb beállításokat, hogy ne veszítsük el a friss értékeket (pl. téma)
          const currentSettings = await loadSettings();
          const latestSettings = currentSettings || settingsToUse;
          
          // Csak a lastBackupDate-et frissítjük, a többi beállítást megtartjuk
          const updatedSettings = {
            ...latestSettings,
            lastBackupDate: backupResult.timestamp,
          };
          await saveSettings(updatedSettings);
          // Frissítjük a settings state-et a legfrissebb beállításokkal
          setSettings(updatedSettings);
          
          // Töröljük a régi backupokat (max 10 db)
          const maxBackups = latestSettings.maxAutomaticBackups || 10;
          await cleanupOldBackups(maxBackups);
        } else {
          // Már létezett mai backup - NEM írjuk felül a beállításokat, hogy ne veszítsük el a friss értékeket (pl. téma)
          // NE mentjük a beállításokat, ha már létezett mai backup - ez elkerüli, hogy a régi értékek írják felül a friss értékeket
          if (import.meta.env.DEV) {
            console.log("ℹ️ Mai backup már létezett, beállítások nem lettek frissítve (hogy ne veszítsük el a friss értékeket)");
          }
        }

        if (import.meta.env.DEV) {
          console.log("✅ Automatikus vészbackup létrehozva:", backupResult.timestamp, backupResult.isNew ? "(új)" : "(már létezett)");
        }
      }
    } catch (error) {
      console.error("❌ Hiba az automatikus backup létrehozásakor:", error);
    }
  }, [autosaveEnabled, isInitialized, printers, filaments, offers, settings]);

  // Debounced automatikus backup - nem minden save után, hanem csak az autosave intervallum szerint
  const debouncedAutomaticBackup = debounce(() => {
    createAutomaticBackupIfEnabled();
  }, autosaveInterval);

  // Debounced save functions
  const debouncedSavePrinters = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      savePrinters(printers).then(() => {
        updateLastSaved();
        // 🔹 Autosave mentés után automatikus vészbackup létrehozása
        debouncedAutomaticBackup();
      }).catch((error) => {
        console.error("Hiba a nyomtatók mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveFilaments = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveFilaments(filaments).then(() => {
        updateLastSaved();
        // 🔹 Autosave mentés után automatikus vészbackup létrehozása
        debouncedAutomaticBackup();
      }).catch((error) => {
        console.error("Hiba a filamentek mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveSettings = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveSettings(settings).then(() => {
        updateLastSaved();
        // 🔹 Autosave mentés után automatikus vészbackup létrehozása
        debouncedAutomaticBackup();
      }).catch((error) => {
        console.error("Hiba a beállítások mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveOffers = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveOffers(offers).then(() => {
        updateLastSaved();
        // 🔹 Autosave mentés után automatikus vészbackup létrehozása
        debouncedAutomaticBackup();
      }).catch((error) => {
        console.error("Hiba az árajánlatok mentésekor:", error);
      });
    }
  }, autosaveInterval);

  const debouncedSaveCustomers = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveCustomers(customers).then(() => {
        updateLastSaved();
        // 🔹 Autosave mentés után automatikus vészbackup létrehozása
        debouncedAutomaticBackup();
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

  // Settings módosításakor azonnal mentjük a data.json-ba az onChange-ben
  // Itt NEM mentjük, mert az onChange-ben már mentjük, hogy ne legyen duplikáció
  // Az autosave csak a printers, filaments, offers, customers adatoknál debounce-ol
  // A settings mindig azonnal mentésre kerül az onChange-ben, hogy ne legyen konfliktus az auto_backup fájlokkal

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

  // 🔹 Autosave újraindítása, amikor be van kapcsolva
  useEffect(() => {
    if (!isInitialized) {
      // Inicializálás előtt még ne csináljunk semmit
      setPreviousAutosaveState(autosaveEnabled);
      return;
    }

    // Ha az autosave be van kapcsolva
    if (autosaveEnabled) {
      // Ha az előző állapot explicit false volt, akkor újraindítjuk a számlálót
      if (previousAutosaveState === false) {
        // Újraindítjuk a lastSaved dátumot, hogy a számláló a teljes intervallumtól kezdjen
        updateLastSaved();
        
        // 🔹 Amikor az autosave bekapcsol, azonnal létrehozzuk az első vészbackup-ot
        createAutomaticBackupIfEnabled();
        
        if (import.meta.env.DEV) {
          console.log("🔄 Autosave újraindítva - számláló resetálva és első vészbackup létrehozva");
        }
      }
      // Frissítjük az előző állapotot
      setPreviousAutosaveState(true);
    } else {
      // Ha ki van kapcsolva, csak frissítjük az állapotot
      setPreviousAutosaveState(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autosaveEnabled, isInitialized, previousAutosaveState, createAutomaticBackupIfEnabled]);

  // 🔹 Naponta egyszer automatikus backup ellenőrzés - még akkor is, ha nincs változás
  // Ez biztosítja, hogy naponta egyszer létrejöjjön a backup, még akkor is, ha nincs változás
  useEffect(() => {
    if (!autosaveEnabled || !isInitialized) {
      return;
    }

    // Ellenőrizzük, hogy van-e már mai backup, és ha nincs, hozzuk létre
    const checkAndCreateDailyBackup = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("🔍 Napi automatikus backup ellenőrzés...");
        }
        
        // A createAutomaticBackupIfEnabled már ellenőrzi, hogy van-e mai backup
        // Ha nincs, létrehozza, ha van, nem csinál semmit
        await createAutomaticBackupIfEnabled();
        
        if (import.meta.env.DEV) {
          console.log("✅ Napi automatikus backup ellenőrzés elvégezve");
        }
      } catch (error) {
        console.error("❌ Hiba a napi automatikus backup ellenőrzéskor:", error);
      }
    };

    // Azonnal ellenőrizzük az indításkor (késleltetett, hogy ne zavarja a betöltést)
    const initialTimeout = setTimeout(() => {
      checkAndCreateDailyBackup();
    }, 5000); // 5 másodperc késleltetés az indítás után

    // Utána minden órában ellenőrizzük (hogy biztosan naponta egyszer legyen backup)
    const intervalId = setInterval(() => {
      checkAndCreateDailyBackup();
    }, 60 * 60 * 1000); // 1 óra

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [autosaveEnabled, isInitialized, createAutomaticBackupIfEnabled]);

  // 🔹 Automatikus log rotáció (törlés) - alkalmazás indításakor és naponta
  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const performLogCleanup = async () => {
      try {
        const retentionDays = settings.logRetentionDays ?? 0;
        
        if (retentionDays > 0) {
          if (import.meta.env.DEV) {
            console.log(`🔍 Automatikus log rotáció ellenőrzés (${retentionDays} nap)...`);
          }
          
          const deletedCount = await cleanupOldLogs(retentionDays);
          
          if (deletedCount > 0 && import.meta.env.DEV) {
            console.log(`✅ ${deletedCount} régi log fájl törölve`);
          }
        }
      } catch (error) {
        console.error("❌ Hiba az automatikus log rotáció során:", error);
      }
    };

    // Fut az indítás után kis késleltetéssel
    const initialTimeout = setTimeout(() => {
      performLogCleanup();
    }, 10000); // 10 másodperc késleltetés az indítás után

    // Utána naponta egyszer fut (24 óra)
    const intervalId = setInterval(() => {
      performLogCleanup();
    }, 24 * 60 * 60 * 1000); // 24 óra

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isInitialized, settings.logRetentionDays]);

  // Automatikus audit log rotáció (naponta egyszer)
  useEffect(() => {
    if (!isInitialized) return;

    const performAuditLogCleanup = async () => {
      try {
        const retentionDays = settings.auditLogRetentionDays ?? 0;
        
        if (retentionDays > 0) {
          if (import.meta.env.DEV) {
            console.log(`🔍 Automatikus audit log rotáció ellenőrzés (${retentionDays} nap)...`);
          }
          
          const deletedCount = await cleanupOldAuditLogs(retentionDays);
          
          if (deletedCount > 0 && import.meta.env.DEV) {
            console.log(`✅ ${deletedCount} régi audit log fájl törölve`);
          }
        }
      } catch (error) {
        console.error("❌ Hiba az automatikus audit log rotáció során:", error);
      }
    };

    // Fut az indítás után kis késleltetéssel
    const initialTimeout = setTimeout(() => {
      performAuditLogCleanup();
    }, 12000); // 12 másodperc késleltetés az indítás után (log cleanup után)

    // Utána naponta egyszer fut (24 óra)
    const intervalId = setInterval(() => {
      performAuditLogCleanup();
    }, 24 * 60 * 60 * 1000); // 24 óra

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isInitialized, settings.auditLogRetentionDays]);

  // 🔹 Performance metrikák rendszeres logolása (5 percenként)
  useEffect(() => {
    if (!isInitialized) return;

    const logPerformanceMetrics = async () => {
      try {
        if (import.meta.env.DEV) {
          console.log("⚡ Performance metrikák rendszeres logolása...");
        }
        
        await logPeriodicPerformanceMetrics();
        
        if (import.meta.env.DEV) {
          console.log("✅ Performance metrikák logolva");
        }
      } catch (error) {
        console.error("❌ Hiba a performance metrikák rendszeres logolása során:", error);
      }
    };

    // Fut az indítás után kis késleltetéssel (15 másodperc, hogy ne zavarja a betöltést)
    const initialTimeout = setTimeout(() => {
      logPerformanceMetrics();
    }, 15000); // 15 másodperc késleltetés az indítás után

    // Utána 5 percenként fut
    const intervalId = setInterval(() => {
      logPerformanceMetrics();
    }, 5 * 60 * 1000); // 5 perc

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [isInitialized]);

  const handleSaveOffer = useCallback(async (offer: Offer) => {
    setOffers(prevOffers => [...prevOffers, offer]);
    
    // Audit log
    try {
      await auditCreate("offer", offer.id, offer.customerName, {
        status: offer.status,
        profitPercentage: offer.profitPercentage,
        printerId: offer.printerId,
        totalCost: offer.costs?.totalCost,
      });
    } catch (error) {
      console.warn("Audit log hiba:", error);
    }
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

  // Help Menu (F1)
  useKeyboardShortcut("F1", () => {
    if (!showHelpMenu && !showShortcutHelp && !showGlobalSearch && !showTutorial && !showWelcomeMessage) {
      setShowHelpMenu(true);
    }
  });

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

  // Page component most az AppRouter kezeli (React Router alapú)

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

    const totalSteps = 8;
    return [
      { label: t("loading.settings"), progress: calculateStepProgress(0, totalSteps) },
      { label: t("loading.printers"), progress: calculateStepProgress(1, totalSteps) },
      { label: t("loading.filaments"), progress: calculateStepProgress(2, totalSteps) },
      { label: t("loading.offers"), progress: calculateStepProgress(3, totalSteps) },
      { label: t("loading.customers"), progress: calculateStepProgress(4, totalSteps) },
      { label: t("loading.projects") || "Projektek betöltése...", progress: calculateStepProgress(5, totalSteps) },
      { label: t("loading.tasks") || "Feladatok betöltése...", progress: calculateStepProgress(6, totalSteps) },
      { label: t("loading.initialization"), progress: calculateStepProgress(7, totalSteps) },
    ];
  }, [loadingProgress, t]);

  // App Context value
  const appContextValue = useMemo(() => ({
    settings,
    printers,
    filaments,
    offers,
    customers,
    projects,
    tasks,
    theme: currentTheme,
    themeStyles,
    quickActionTrigger,
    settingsInitialModal,
    setSettings,
    setPrinters,
    setFilaments,
    setOffers,
    setCustomers,
    setProjects,
    setTasks,
    setQuickActionTrigger,
    setSettingsInitialModal,
    handleSaveOffer,
    debouncedSaveSettings,
    handleFactoryReset,
    onNavigate: (page: string, modal?: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history") => {
      setActivePage(page);
      if (modal) {
        setSettingsInitialModal(modal);
      } else {
        setSettingsInitialModal(null);
      }
    },
  }), [
    settings, printers, filaments, offers, customers, projects, tasks,
    currentTheme, themeStyles, quickActionTrigger, settingsInitialModal,
    setSettings, setPrinters, setFilaments, setOffers, setCustomers,
    setProjects, setTasks, setQuickActionTrigger, setSettingsInitialModal,
    handleSaveOffer, debouncedSaveSettings, handleFactoryReset, setActivePage
  ]);

  return (
    <ErrorBoundary>
      <ToastProvider settings={settings}>
        <AppProvider value={appContextValue}>
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
            onHelpClick={() => setShowHelpMenu(true)}
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
            offers={offers}
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
              <>
                {/* Blokkoló overlay - minden interakciót lefog */}
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 10000,
                    pointerEvents: "auto",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    MozUserSelect: "none",
                    msUserSelect: "none",
                    cursor: "wait",
                  }}
                  onWheel={(e) => e.preventDefault()}
                  onTouchMove={(e) => e.preventDefault()}
                  onClick={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                  onMouseDown={(e) => e.preventDefault()}
                  onMouseUp={(e) => e.preventDefault()}
                  onMouseMove={(e) => e.preventDefault()}
                  onKeyDown={(e) => e.preventDefault()}
                  onKeyUp={(e) => e.preventDefault()}
                />
                <AppSkeleton 
                  theme={currentTheme}
                  settings={settings}
                  loadingSteps={loadingSteps}
                  currentStep={loadingStep}
                />
              </>
            ) : (
              <AppRouter
                settings={settings}
                theme={currentTheme}
                themeStyles={themeStyles}
                animationSettings={animationSettings}
                pageTransitionVariants={pageTransitionVariants}
                pageTransitionTiming={pageTransitionTiming}
                t={(key: string) => t(key as any)}
              />
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

          {/* Welcome Message - új indításkor, tutorial után */}
          <WelcomeMessage
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
            isOpen={showWelcomeMessage}
            onClose={() => {
              setShowWelcomeMessage(false);
              setWelcomeMessageShown(true);
            }}
          />

          {/* Help Menu - F1 billentyűvel vagy Sidebar menüponttal */}
          <HelpMenu
            settings={settings}
            theme={currentTheme}
            themeStyles={themeStyles}
            isOpen={showHelpMenu}
            onClose={() => setShowHelpMenu(false)}
          />

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
            onDataReload={reloadData}
            onComplete={async () => {
              setShowTutorial(false);
              setTutorialWillOpen(false); // Reset, hogy a BackupReminder komponens újra működjön
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
              
              // 🔹 Tutorial bezárása után megjelenítjük az üdvözlő üzenetet (ha be van kapcsolva)
              if (!welcomeMessageShown && (updatedSettings.showWelcomeMessageOnStartup !== false)) {
                setTimeout(() => {
                  setShowWelcomeMessage(true);
                  if (import.meta.env.DEV) {
                    console.log("✅ Üdvözlő üzenet megjelenítve tutorial után");
                  }
                }, 500);
              }
            }}
            onSkip={() => {
              // Skip esetén csak bezárjuk, de NEM állítjuk be a completed-et
              setShowTutorial(false);
              setTutorialWillOpen(false); // Reset, hogy a BackupReminder komponens újra működjön
              if (import.meta.env.DEV) {
                console.log("⏭️ Tutorial kihagyva (nincs completed beállítva)");
              }
              
              // 🔹 Tutorial kihagyása után megjelenítjük az üdvözlő üzenetet (ha be van kapcsolva)
              if (!welcomeMessageShown && (settings.showWelcomeMessageOnStartup !== false)) {
                setTimeout(() => {
                  setShowWelcomeMessage(true);
                  if (import.meta.env.DEV) {
                    console.log("✅ Üdvözlő üzenet megjelenítve tutorial kihagyása után");
                  }
                }, 500);
              }
            }}
            currentPage={activePage}
            onNavigate={(page) => {
              setActivePage(page);
            }}
          />

          {/* Backup Reminder - automatikus emlékeztető régi backup-okhoz - NE mutassa, ha a tutorial aktív vagy meg fog nyílni */}
          {isInitialized && !showTutorial && !tutorialWillOpen && <BackupReminder settings={settings} showTutorial={showTutorial} />}
        </div>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

// Fő App komponens - Router és Provider wrapper
export default function App() {
  return <AppContent />;
}
