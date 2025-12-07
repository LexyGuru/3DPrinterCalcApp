import { useRoutes, useLocation } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { LazyErrorBoundary } from "../components/LazyErrorBoundary";
import { createRoutes, ROUTE_TO_PAGE } from "./routes";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import type { RouteObject } from "react-router-dom";

interface AppRouterProps {
  settings: Settings;
  theme: Theme;
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
  animationSettings,
  pageTransitionVariants,
  pageTransitionTiming,
  t,
}: AppRouterProps) {
  const location = useLocation();

  // Dinamikus route betöltés - biztosítja, hogy a React.lazy elérhető legyen
  const [routes, setRoutes] = useState<RouteObject[]>([]);
  
  useEffect(() => {
    console.log("🔄 [AppRouter] Routes betöltése...");
    createRoutes()
      .then((loadedRoutes) => {
        console.log("✅ [AppRouter] Routes betöltve:", loadedRoutes.length);
        setRoutes(loadedRoutes);
      })
      .catch((error) => {
        console.error("❌ [AppRouter] Hiba a routes betöltésekor:", error);
        console.error("❌ [AppRouter] Hiba részletei:", {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
      });
  }, []);

  const element = useRoutes(routes);

  // Ha még nincsenek routes, mutassunk loading állapotot
  if (routes.length === 0) {
    return (
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
    );
  }

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

