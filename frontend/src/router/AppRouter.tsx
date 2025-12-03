import { useRoutes, useLocation, useNavigate } from "react-router-dom";
import { Suspense, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LazyErrorBoundary } from "../components/LazyErrorBoundary";
import { createRoutes, ROUTE_TO_PAGE } from "./routes";
import { useAppContext } from "./AppContext";
import type { Settings, Theme } from "../types";
import type { ThemeStyles } from "../utils/themes";

interface AppRouterProps {
  settings: Settings;
  theme: Theme;
  themeStyles: ThemeStyles;
  animationSettings: any;
  pageTransitionVariants: any;
  pageTransitionTiming: any;
  t: (key: string) => string;
}

/**
 * App Router komponens - kezeli a route-okat és a navigációt
 */
export function AppRouter({
  settings,
  theme,
  themeStyles,
  animationSettings,
  pageTransitionVariants,
  pageTransitionTiming,
  t,
}: AppRouterProps) {
  const context = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  const routes = createRoutes();
  const element = useRoutes(routes);

  return (
    <LazyErrorBoundary 
      settings={settings}
      onError={(error, errorInfo) => {
        if (import.meta.env.DEV) {
          console.error("Lazy component error:", error, errorInfo);
        }
      }}
    >
      <Suspense fallback={
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          backgroundColor: theme.colors.background?.includes('gradient') 
            ? 'transparent' 
            : theme.colors.background,
        }}>
          <LoadingSpinner size="large" message={t("loading.title")} />
        </div>
      }>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            data-page={ROUTE_TO_PAGE[location.pathname] || "home"}
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
            {element}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </LazyErrorBoundary>
  );
}

