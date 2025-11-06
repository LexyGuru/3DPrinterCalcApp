import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from "react";
import { Sidebar } from "./components/Sidebar";
import { UpdateChecker } from "./components/UpdateChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy loading komponensek (code splitting)
const Home = lazy(() => import("./components/Home").then(module => ({ default: module.Home })));
const Filaments = lazy(() => import("./components/Filaments").then(module => ({ default: module.Filaments })));
const Printers = lazy(() => import("./components/Printers").then(module => ({ default: module.Printers })));
const Calculator = lazy(() => import("./components/Calculator").then(module => ({ default: module.Calculator })));
const Offers = lazy(() => import("./components/Offers").then(module => ({ default: module.Offers })));
const SettingsPage = lazy(() => import("./components/Settings").then(module => ({ default: module.SettingsPage })));
const Console = lazy(() => import("./components/Console").then(module => ({ default: module.Console })));
import type { Printer, Settings, Filament, Offer } from "./types";
import { defaultSettings } from "./types";
import { savePrinters, loadPrinters, saveFilaments, loadFilaments, saveSettings, loadSettings, saveOffers, loadOffers } from "./utils/store";
import { themes, getThemeStyles } from "./utils/themes";
import { debounce } from "./utils/debounce";
import { useKeyboardShortcut } from "./utils/keyboardShortcuts";
import { ShortcutHelp } from "./components/ShortcutHelp";
import "./utils/consoleLogger"; // Initialize console logger
import "./utils/keyboardShortcuts"; // Initialize keyboard shortcuts

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  // 🔹 Betöltés indításkor
  useEffect(() => {
    const loadData = async () => {
      const loadedPrinters = await loadPrinters();
      const loadedFilaments = await loadFilaments();
      const loadedSettings = await loadSettings();
      const loadedOffers = await loadOffers();
      
      if (loadedPrinters.length > 0) {
        setPrinters(loadedPrinters);
      }
      if (loadedFilaments.length > 0) {
        setFilaments(loadedFilaments);
      }
      if (loadedOffers.length > 0) {
        setOffers(loadedOffers);
      }
      if (loadedSettings) {
        // Ellenőrizzük hogy az electricityPrice érvényes érték-e
        if (!loadedSettings.electricityPrice || loadedSettings.electricityPrice <= 0) {
          if (import.meta.env.DEV) {
            console.warn("Betöltött beállításokban az electricityPrice érvénytelen, alapértelmezett értéket használunk");
          }
          loadedSettings.electricityPrice = defaultSettings.electricityPrice;
        }
        // Ha nincs téma, használjuk az alapértelmezettet
        if (!loadedSettings.theme) {
          loadedSettings.theme = defaultSettings.theme;
        }
        setSettings(loadedSettings);
      } else {
        // Ha nincs betöltött beállítás, használjuk az alapértelmezett értékeket
        setSettings(defaultSettings);
      }
      setIsInitialized(true);
    };
    loadData();
  }, []);

  // 🔹 Automatikus mentés debounce-szal (csak inicializálás után)
  const autosaveEnabled = settings.autosave !== false; // Alapértelmezetten true
  const autosaveInterval = (settings.autosaveInterval || 30) * 1000; // Másodperc -> milliszekundum

  // Debounced save functions
  const debouncedSavePrinters = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      savePrinters(printers);
    }
  }, autosaveInterval);

  const debouncedSaveFilaments = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveFilaments(filaments);
    }
  }, autosaveInterval);

  const debouncedSaveSettings = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveSettings(settings);
    }
  }, autosaveInterval);

  const debouncedSaveOffers = debounce(() => {
    if (isInitialized && autosaveEnabled) {
      saveOffers(offers);
    }
  }, autosaveInterval);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSavePrinters();
    } else if (isInitialized && !autosaveEnabled) {
      // Ha az autosave ki van kapcsolva, azonnal mentjük
      savePrinters(printers);
    }
  }, [printers, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveFilaments();
    } else if (isInitialized && !autosaveEnabled) {
      saveFilaments(filaments);
    }
  }, [filaments, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveSettings();
    } else if (isInitialized && !autosaveEnabled) {
      saveSettings(settings);
    }
  }, [settings, isInitialized, autosaveEnabled]);

  useEffect(() => {
    if (isInitialized && autosaveEnabled) {
      debouncedSaveOffers();
    } else if (isInitialized && !autosaveEnabled) {
      saveOffers(offers);
    }
  }, [offers, isInitialized, autosaveEnabled]);

  const handleSaveOffer = useCallback((offer: Offer) => {
    setOffers(prevOffers => [...prevOffers, offer]);
  }, []);

  // Get current theme (memoized)
  const currentTheme = useMemo(() => {
    const themeName = settings.theme || "light";
    return themes[themeName];
  }, [settings.theme]);

  const themeStyles = useMemo(() => getThemeStyles(currentTheme), [currentTheme]);

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
        return <Calculator printers={printers} filaments={filaments} settings={settings} onSaveOffer={handleSaveOffer} theme={currentTheme} themeStyles={themeStyles} />; 
      case "offers":
        return <Offers offers={offers} setOffers={setOffers} settings={settings} theme={currentTheme} themeStyles={themeStyles} printers={printers} />;
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
  }, [activePage, filaments, printers, offers, settings, currentTheme, themeStyles, handleSaveOffer]);

  // Determine if this is a beta build from environment variable (set at build time)
  const isBeta = import.meta.env.VITE_IS_BETA === 'true';

  return (
    <ErrorBoundary>
      <ToastProvider settings={settings}>
        <div style={{ 
          height: "100vh", 
          width: "100vw", 
          overflow: "hidden",
          backgroundColor: currentTheme.colors.background,
          color: currentTheme.colors.text,
        }}>
          <UpdateChecker settings={settings} />
          <Sidebar activePage={activePage} setActivePage={setActivePage} settings={settings} isBeta={isBeta} theme={currentTheme} />
          <main style={{ 
            padding: 20, 
            backgroundColor: currentTheme.colors.background, 
            color: currentTheme.colors.text,
            overflowY: "auto",
            overflowX: "hidden",
            position: "relative",
            left: "200px",
            width: "calc(100vw - 200px)",
            height: "100vh",
            boxSizing: "border-box"
          }}>
            {!isInitialized ? (
              <LoadingSpinner message={settings.language === "hu" ? "Betöltés..." : settings.language === "de" ? "Laden..." : "Loading..."} />
            ) : (
              <Suspense fallback={<LoadingSpinner message={settings.language === "hu" ? "Betöltés..." : settings.language === "de" ? "Laden..." : "Loading..."} />}>
                {PageComponent}
              </Suspense>
            )}
          </main>
          {showShortcutHelp && (
            <ShortcutHelp
              settings={settings}
              theme={currentTheme}
              themeStyles={themeStyles}
              onClose={() => setShowShortcutHelp(false)}
            />
          )}
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
