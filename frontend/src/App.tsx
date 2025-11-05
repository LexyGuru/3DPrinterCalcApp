import { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./components/Home";
import { Filaments } from "./components/Filaments";
import { Printers } from "./components/Printers";
import { Calculator } from "./components/Calculator";
import { Offers } from "./components/Offers";
import { SettingsPage } from "./components/Settings";
import { UpdateChecker } from "./components/UpdateChecker";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/Toast";
import { LoadingSpinner } from "./components/LoadingSpinner";
import type { Printer, Settings, Filament, Offer } from "./types";
import { defaultSettings } from "./types";
import { savePrinters, loadPrinters, saveFilaments, loadFilaments, saveSettings, loadSettings, saveOffers, loadOffers } from "./utils/store";

export default function App() {
  const [activePage, setActivePage] = useState("home");
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

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
        setSettings(loadedSettings);
      } else {
        // Ha nincs betöltött beállítás, használjuk az alapértelmezett értékeket
        setSettings(defaultSettings);
      }
      setIsInitialized(true);
    };
    loadData();
  }, []);

  // 🔹 Mentés, ha változik (csak inicializálás után)
  useEffect(() => {
    if (isInitialized) {
      savePrinters(printers);
    }
  }, [printers, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveFilaments(filaments);
    }
  }, [filaments, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings);
    }
  }, [settings, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      saveOffers(offers);
    }
  }, [offers, isInitialized]);

  const handleSaveOffer = (offer: Offer) => {
    setOffers([...offers, offer]);
  };

  let PageComponent;
  switch (activePage) {
    case "filaments": 
      PageComponent = <Filaments filaments={filaments} setFilaments={setFilaments} settings={settings} />; 
      break;
    case "printers":
      PageComponent = <Printers printers={printers} setPrinters={setPrinters} settings={settings} />;
      break;
    case "calculator": 
      PageComponent = <Calculator printers={printers} filaments={filaments} settings={settings} onSaveOffer={handleSaveOffer} />; 
      break;
    case "offers":
      PageComponent = <Offers offers={offers} setOffers={setOffers} settings={settings} />;
      break;
    case "settings": 
      PageComponent = <SettingsPage 
        settings={settings} 
        onChange={setSettings}
        printers={printers}
        setPrinters={setPrinters}
        filaments={filaments}
        setFilaments={setFilaments}
        offers={offers}
        setOffers={setOffers}
      />; 
      break;
    default: PageComponent = <Home settings={settings} offers={offers} />;
  }

  // Determine if this is a beta build from environment variable (set at build time)
  const isBeta = import.meta.env.VITE_IS_BETA === 'true';

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div style={{ height: "100vh", width: "100vw", overflow: "hidden" }}>
          <UpdateChecker settings={settings} />
          <Sidebar activePage={activePage} setActivePage={setActivePage} settings={settings} isBeta={isBeta} />
          <main style={{ 
            padding: 20, 
            backgroundColor: "#ffffff", 
            color: "#111111",
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
              PageComponent
            )}
          </main>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}
