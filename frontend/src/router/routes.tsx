import type { RouteObject } from "react-router-dom";
// DINAMIKUS import - biztosítja, hogy a React.lazy elérhető legyen, amikor a routeWrappers betöltődik
// A routeWrappers.tsx a 'lazy' függvényt használja, ami a vendor-react chunk-ban van
// Dinamikus importtal biztosítjuk, hogy a vendor-react chunk előbb töltődjön be
let routeWrappersModule: typeof import("./routeWrappers") | null = null;

async function getRouteWrappers() {
  if (!routeWrappersModule) {
    routeWrappersModule = await import("./routeWrappers");
  }
  return routeWrappersModule;
}

/**
 * Route konfiguráció a React Router számára.
 * Minden route lazy-loaded komponenst használ code splitting-hez.
 */
export interface RouteConfig {
  path: string;
  element: React.LazyExoticComponent<any>;
  props?: Record<string, any>;
}

/**
 * Route path mapping - könnyebb navigációhoz
 */
export const ROUTE_PATHS = {
  HOME: "/",
  FILAMENTS: "/filaments",
  FILAMENT_STOCK: "/filament-stock",
  PRINTERS: "/printers",
  CALCULATOR: "/calculator",
  OFFERS: "/offers",
  CUSTOMERS: "/customers",
  PRICE_TRENDS: "/price-trends",
  BUDGET: "/budget",
  CALENDAR: "/calendar",
  PROJECTS: "/projects",
  TASKS: "/tasks",
  SETTINGS: "/settings",
  CONSOLE: "/console",
} as const;

/**
 * Oldal nevek route path-ekhez mapping
 */
export const PAGE_TO_ROUTE: Record<string, string> = {
  "home": ROUTE_PATHS.HOME,
  "filaments": ROUTE_PATHS.FILAMENTS,
  "filament-stock": ROUTE_PATHS.FILAMENT_STOCK,
  "printers": ROUTE_PATHS.PRINTERS,
  "calculator": ROUTE_PATHS.CALCULATOR,
  "offers": ROUTE_PATHS.OFFERS,
  "customers": ROUTE_PATHS.CUSTOMERS,
  "priceTrends": ROUTE_PATHS.PRICE_TRENDS,
  "budget": ROUTE_PATHS.BUDGET,
  "calendar": ROUTE_PATHS.CALENDAR,
  "projects": ROUTE_PATHS.PROJECTS,
  "tasks": ROUTE_PATHS.TASKS,
  "settings": ROUTE_PATHS.SETTINGS,
  "console": ROUTE_PATHS.CONSOLE,
};

/**
 * Route path-ek oldal nevekhez mapping
 */
export const ROUTE_TO_PAGE: Record<string, string> = Object.fromEntries(
  Object.entries(PAGE_TO_ROUTE).map(([page, route]) => [route, page])
);

/**
 * Route objektumok - wrapper komponenseket használ, amik a context-ből veszik a props-okat
 * Dinamikus import használata, hogy biztosan elérje a React.lazy-t
 */
export async function createRoutes(): Promise<RouteObject[]> {
  const wrappers = await getRouteWrappers();
  const {
    HomeWrapper,
    FilamentsWrapper,
    FilamentStockManagementWrapper,
    PrintersWrapper,
    CalculatorWrapper,
    OffersWrapper,
    CustomersWrapper,
    PriceTrendsWrapper,
    BudgetManagementWrapper,
    CalendarWrapper,
    ProjectsWrapper,
    TasksWrapper,
    SettingsWrapper,
    ConsoleWrapper,
  } = wrappers;
  
  return [
    {
      path: ROUTE_PATHS.HOME,
      element: <HomeWrapper />,
    },
    {
      path: ROUTE_PATHS.FILAMENTS,
      element: <FilamentsWrapper />,
    },
    {
      path: ROUTE_PATHS.FILAMENT_STOCK,
      element: <FilamentStockManagementWrapper />,
    },
    {
      path: ROUTE_PATHS.PRINTERS,
      element: <PrintersWrapper />,
    },
    {
      path: ROUTE_PATHS.CALCULATOR,
      element: <CalculatorWrapper />,
    },
    {
      path: ROUTE_PATHS.OFFERS,
      element: <OffersWrapper />,
    },
    {
      path: ROUTE_PATHS.CUSTOMERS,
      element: <CustomersWrapper />,
    },
    {
      path: ROUTE_PATHS.PRICE_TRENDS,
      element: <PriceTrendsWrapper />,
    },
    {
      path: ROUTE_PATHS.BUDGET,
      element: <BudgetManagementWrapper />,
    },
    {
      path: ROUTE_PATHS.CALENDAR,
      element: <CalendarWrapper />,
    },
    {
      path: ROUTE_PATHS.PROJECTS,
      element: <ProjectsWrapper />,
    },
    {
      path: ROUTE_PATHS.TASKS,
      element: <TasksWrapper />,
    },
    {
      path: ROUTE_PATHS.SETTINGS,
      element: <SettingsWrapper />,
    },
    {
      path: ROUTE_PATHS.CONSOLE,
      element: <ConsoleWrapper />,
    },
  ];
}

