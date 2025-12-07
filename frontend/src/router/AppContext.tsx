import { createContext, useContext, type ReactNode } from "react";
import type { Printer, Settings, Filament, Offer, Customer, Project, Task } from "../types";
import type { Theme } from "../utils/themes";
import type { getThemeStyles } from "../utils/themes";

type ThemeStyles = ReturnType<typeof getThemeStyles>;

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
  setPrinters: React.Dispatch<React.SetStateAction<Printer[]>>;
  setFilaments: React.Dispatch<React.SetStateAction<Filament[]>>;
  setOffers: React.Dispatch<React.SetStateAction<Offer[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setQuickActionTrigger: (trigger: string | null) => void;
  setSettingsInitialModal: (modal: "log-viewer" | "audit-log-viewer" | "system-diagnostics" | "backup-history" | null) => void;
  
  // Callbacks
  handleSaveOffer: (offer: Offer) => Promise<void>;
  debouncedSaveSettings: () => void;
  handleFactoryReset: () => void;
  updateLastSaved?: () => void; // Callback a lastSaved frissítéséhez
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

