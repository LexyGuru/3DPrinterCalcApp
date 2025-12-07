// KRITIKUS: lazy közvetlenül importálva a react-ből
import { lazy } from "react";
import { useAppContext } from "./AppContext";
import { useNavigate } from "react-router-dom";
import { PAGE_TO_ROUTE } from "./routes";
import type { Settings } from "../types";
import { saveSettings } from "../utils/store";

// Lazy loaded route components - explicit lazy használata (nem React.lazy)
// A 'lazy' közvetlenül importálva van a 'react'-ből, így biztosan elérhető
const Home = lazy(() => import("../components/Home").then(module => ({ default: module.Home })));
const Filaments = lazy(() => import("../components/Filaments").then(module => ({ default: module.Filaments })));
const FilamentStockManagement = lazy(() => import("../components/FilamentStockManagement").then(module => ({ default: module.FilamentStockManagement })));
const Printers = lazy(() => import("../components/Printers").then(module => ({ default: module.Printers })));
const Calculator = lazy(() => import("../components/Calculator").then(module => ({ default: module.Calculator })));
const Offers = lazy(() => import("../components/Offers").then(module => ({ default: module.Offers })));
const Customers = lazy(() => import("../components/Customers").then(module => ({ default: module.Customers })));
const PriceTrends = lazy(() => import("../components/PriceTrends").then(module => ({ default: module.PriceTrends })));
const Calendar = lazy(() => import("../components/Calendar").then(module => ({ default: module.Calendar })));
const Projects = lazy(() => import("../components/Projects").then(module => ({ default: module.Projects })));
const Tasks = lazy(() => import("../components/Tasks").then(module => ({ default: module.Tasks })));
const SettingsPage = lazy(() => import("../components/Settings").then(module => ({ default: module.SettingsPage })));
const Console = lazy(() => import("../components/Console").then(module => ({ default: module.Console })));
const BudgetManagement = lazy(() => import("../components/BudgetManagement").then(module => ({ default: module.BudgetManagement })));

// Wrapper komponensek - a context-ből veszik a props-okat
export function HomeWrapper() {
  const context = useAppContext();
  const navigate = useNavigate();
  
  return (
    <Home
      settings={context.settings}
      offers={context.offers}
      filaments={context.filaments}
      printers={context.printers}
      projects={context.projects}
      tasks={context.tasks}
      theme={context.theme}
      onSettingsChange={(newSettings: Settings) => {
        context.setSettings(newSettings);
      }}
      onNavigate={(page: string, modal?: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history") => {
        const route = PAGE_TO_ROUTE[page] || "/";
        navigate(route);
        if (modal) {
          context.setSettingsInitialModal(modal);
        } else {
          context.setSettingsInitialModal(null);
        }
      }}
    />
  );
}

export function FilamentsWrapper() {
  const context = useAppContext();
  
  return (
    <Filaments
      filaments={context.filaments}
      setFilaments={context.setFilaments}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      triggerAddForm={context.quickActionTrigger === 'add-filament'}
      onSettingsChange={(newSettings: Settings) => {
        context.setSettings(newSettings);
        context.debouncedSaveSettings();
      }}
    />
  );
}

export function FilamentStockManagementWrapper() {
  const context = useAppContext();
  
  return (
    <FilamentStockManagement
      filaments={context.filaments}
      setFilaments={context.setFilaments}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

export function PrintersWrapper() {
  const context = useAppContext();
  
  return (
    <Printers
      printers={context.printers}
      setPrinters={context.setPrinters}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      triggerAddForm={context.quickActionTrigger === 'add-printer'}
      onSettingsChange={(newSettings: Settings) => {
        context.setSettings(newSettings);
        context.debouncedSaveSettings();
      }}
    />
  );
}

export function CalculatorWrapper() {
  const context = useAppContext();
  
  return (
    <Calculator
      printers={context.printers}
      filaments={context.filaments}
      customers={context.customers}
      settings={context.settings}
      onSaveOffer={context.handleSaveOffer}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

export function OffersWrapper() {
  const context = useAppContext();
  
  return (
    <Offers
      offers={context.offers}
      setOffers={context.setOffers}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      printers={context.printers}
      filaments={context.filaments}
      setFilaments={context.setFilaments}
      customers={context.customers}
      onSettingsChange={(newSettings: Settings) => {
        context.setSettings(newSettings);
        context.debouncedSaveSettings();
      }}
    />
  );
}

export function CustomersWrapper() {
  const context = useAppContext();
  
  return (
    <Customers
      customers={context.customers}
      setCustomers={context.setCustomers}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      offers={context.offers}
      triggerAddForm={context.quickActionTrigger === 'add-customer'}
      onSave={context.updateLastSaved}
    />
  );
}

export function PriceTrendsWrapper() {
  const context = useAppContext();
  
  return (
    <PriceTrends
      filaments={context.filaments}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

export function BudgetManagementWrapper() {
  const context = useAppContext();
  
  return (
    <BudgetManagement
      offers={context.offers}
      setOffers={context.setOffers}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

export function CalendarWrapper() {
  const context = useAppContext();
  
  return (
    <Calendar
      offers={context.offers}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

export function ProjectsWrapper() {
  const context = useAppContext();
  
  return (
    <Projects
      projects={context.projects}
      setProjects={context.setProjects}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      offers={context.offers}
      triggerAddForm={context.quickActionTrigger === 'add-project'}
    />
  );
}

export function TasksWrapper() {
  const context = useAppContext();
  
  return (
    <Tasks
      tasks={context.tasks}
      setTasks={context.setTasks}
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
      offers={context.offers}
      projects={context.projects}
      triggerAddForm={context.quickActionTrigger === 'add-task'}
    />
  );
}

export function SettingsWrapper() {
  const context = useAppContext();
  
  return (
    <SettingsPage
      settings={context.settings}
      onChange={async (newSettings: Settings) => {
        context.setSettings(newSettings);
        try {
          await saveSettings(newSettings);
        } catch (error) {
          console.error("❌ Hiba a beállítások mentésekor:", error);
        }
      }}
      printers={context.printers}
      setPrinters={context.setPrinters}
      filaments={context.filaments}
      setFilaments={context.setFilaments}
      offers={context.offers}
      setOffers={context.setOffers}
      theme={context.theme}
      themeStyles={context.themeStyles}
      onFactoryReset={context.handleFactoryReset}
      initialModal={context.settingsInitialModal}
      onModalOpened={() => context.setSettingsInitialModal(null)}
    />
  );
}

export function ConsoleWrapper() {
  const context = useAppContext();
  
  return (
    <Console
      settings={context.settings}
      theme={context.theme}
      themeStyles={context.themeStyles}
    />
  );
}

