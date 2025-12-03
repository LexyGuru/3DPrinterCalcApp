import { createContext, useContext, type ReactNode } from "react";
import type { Printer, Settings, Filament, Offer, Customer, Project, Task, Theme } from "../types";
import type { ThemeStyles } from "../utils/themes";

/**
 * App Context - tartalmazza az összes state-et és függvényt,
 * amit a route komponenseknek át kell adni.
 */
export interface AppContextType {
  // State
  settings: Settings;
  printers: Printer[];
  filaments: Filament[];
  offers: Offer[];
  customers: Customer[];
  projects: Project[];
  tasks: Task[];
  theme: Theme;
  themeStyles: ThemeStyles;
  quickActionTrigger: string | null;
  settingsInitialModal: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history" | null;
  
  // Setters
  setSettings: (settings: Settings) => void;
  setPrinters: (printers: Printer[]) => void;
  setFilaments: (filaments: Filament[]) => void;
  setOffers: (offers: Offer[]) => void;
  setCustomers: (customers: Customer[]) => void;
  setProjects: (projects: Project[]) => void;
  setTasks: (tasks: Task[]) => void;
  setQuickActionTrigger: (trigger: string | null) => void;
  setSettingsInitialModal: (modal: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history" | null) => void;
  
  // Callbacks
  handleSaveOffer: (offer: Offer) => Promise<void>;
  debouncedSaveSettings: () => void;
  handleFactoryReset: () => void;
  onNavigate?: (page: string, modal?: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history") => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children, value }: { children: ReactNode; value: AppContextType }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}

