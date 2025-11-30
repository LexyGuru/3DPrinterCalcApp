import React, { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Theme } from "../utils/themes";
import { Skeleton, SkeletonCard } from "./Skeleton";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";

interface AppSkeletonProps {
  theme: Theme;
  settings: Settings;
  loadingSteps?: LoadingStep[];
  currentStep?: number;
}

interface LoadingStep {
  label: string;
  progress: number;
}

/**
 * App betöltési skeleton - látványos betöltési képernyő
 * Fix layout, hogy a pipák ne menjenek felfelé
 */
export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  theme,
  settings,
  loadingSteps = [],
  currentStep = 0,
}) => {
  const t = useTranslation(settings.language);
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const themeStyles = useMemo(() => ({
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    border: theme.colors.border,
    gradient: theme.colors.gradient || `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover || theme.colors.primary})`,
  }), [theme]);

  const overallProgress = useMemo(() => {
    return loadingSteps.length > 0 
      ? Math.round(loadingSteps.reduce((acc, step) => acc + step.progress, 0) / loadingSteps.length)
      : 0;
  }, [loadingSteps]);

  // Automatikus scroll az aktív modulra - csak 3 modul látható egyszerre
  useEffect(() => {
    if (stepRefs.current[currentStep] && stepsContainerRef.current) {
      const activeElement = stepRefs.current[currentStep];
      const container = stepsContainerRef.current;
      
      if (activeElement) {
        // Számoljuk ki a scroll pozíciót úgy, hogy az aktív modul a középen legyen
        const containerHeight = container.clientHeight;
        const elementOffsetTop = activeElement.offsetTop;
        const elementHeight = activeElement.clientHeight;
        
        // Az aktív modul pozíciója a container közepére
        const targetScrollTop = elementOffsetTop - (containerHeight / 2) + (elementHeight / 2);
        
        // Smooth scroll az aktív modulra
        container.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior: "smooth",
        });
      }
    }
  }, [currentStep, loadingSteps.length]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: "url('/images/app-logo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        zIndex: 9999,
        pointerEvents: "auto", // A loading screen-re lehet kattintani, de az interakciókat blokkoljuk
        userSelect: "none", // Ne lehessen kijelölni szöveget
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
      }}
      onWheel={(e) => e.preventDefault()} // Görgetés tiltása
      onTouchMove={(e) => e.preventDefault()} // Touch görgetés tiltása
      onClick={(e) => e.preventDefault()} // Kattintás blokkolása
      onContextMenu={(e) => e.preventDefault()} // Jobb klikk blokkolása
    >
      {/* Glassmorphism overlay - átlátszó háttér a tartalomnak */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: `${themeStyles.background}E6`, // 90% opacity
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }} />
      
      {/* Fő konténer - scrollozható programozottan, de felhasználói interakció tiltva */}
      <div 
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "32px",
          overflowY: "auto", // Automatikus scroll engedélyezve (programozottan)
          overflowX: "hidden",
          position: "relative",
          zIndex: 1,
          pointerEvents: "none", // Ne lehessen kattintani semmire
          userSelect: "none", // Ne lehessen kijelölni
          WebkitUserSelect: "none",
          MozUserSelect: "none",
          msUserSelect: "none",
        }}
        onWheel={(e) => e.preventDefault()} // Görgetés tiltva
        onTouchMove={(e) => e.preventDefault()} // Touch görgetés tiltva
        onClick={(e) => e.preventDefault()} // Kattintás tiltva
        onContextMenu={(e) => e.preventDefault()} // Jobb klikk tiltva
        onMouseDown={(e) => e.preventDefault()} // Egér lenyomás tiltva
      >
        {/* Title area - fix tetején */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            marginBottom: "32px",
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* App név */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            style={{
              color: themeStyles.text,
              fontSize: "28px",
              fontWeight: 700,
              margin: "0 0 8px 0",
              backgroundImage: themeStyles.gradient,
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            3D Printer Calculator
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              color: themeStyles.textMuted,
              fontSize: "14px",
              margin: 0,
              textShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          >
            {t("loading.title")}
          </motion.p>
      </motion.div>

        {/* Overall Progress Bar - fix pozíció - glassmorphism háttérrel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          width: "100%",
            maxWidth: "600px",
            marginBottom: "24px",
            padding: "20px",
            backgroundColor: `${themeStyles.surface}CC`, // 80% opacity
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.border}80`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
            marginBottom: "16px",
        }}>
          <span style={{ 
            color: themeStyles.text, 
            fontSize: "16px", 
            fontWeight: 600 
          }}>
            {t("loading.title")}
          </span>
            <motion.span
              key={overallProgress}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              style={{ 
                color: themeStyles.primary,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              {overallProgress}%
            </motion.span>
        </div>
        <div style={{
          width: "100%",
            height: "12px",
          backgroundColor: themeStyles.surface,
            borderRadius: "6px",
          overflow: "hidden",
          border: `1px solid ${themeStyles.border}`,
            position: "relative",
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
                width: `${overallProgress}%`,
            }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              height: "100%",
                background: themeStyles.gradient,
                borderRadius: "6px",
                boxShadow: `0 0 20px ${themeStyles.primary}60`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Shimmer effekt */}
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                }}
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "linear",
            }}
          />
            </motion.div>
        </div>
      </motion.div>

        {/* Loading steps - fix magasságú container, csak 3 modul látható, automatikus scroll - glassmorphism háttérrel */}
        <div 
          ref={stepsContainerRef}
          style={{
            width: "100%",
            maxWidth: "600px",
            height: "280px", // Fix magasság - pontosan 3 modul fér el (3 × ~90px magasság)
            overflowY: "auto", // Automatikus scroll engedélyezve (programozottan)
            overflowX: "hidden",
            marginBottom: "24px",
            padding: "20px",
            paddingRight: "28px",
            backgroundColor: `${themeStyles.surface}CC`, // 80% opacity
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.border}80`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            position: "relative",
            pointerEvents: "none", // Ne lehessen kattintani
            userSelect: "none", // Ne lehessen kijelölni
            WebkitUserSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
          }}
          onWheel={(e) => e.preventDefault()} // Görgetés tiltva
          onTouchMove={(e) => e.preventDefault()} // Touch görgetés tiltva
          onClick={(e) => e.preventDefault()} // Kattintás tiltva
          onContextMenu={(e) => e.preventDefault()} // Jobb klikk tiltva
          onMouseDown={(e) => e.preventDefault()} // Egér lenyomás tiltva
        >
          {/* Custom scrollbar styling - rejtett scrollbar */}
          <style>{`
            div::-webkit-scrollbar {
              width: 0px;
              display: none;
            }
            div::-webkit-scrollbar-track {
              display: none;
            }
            div::-webkit-scrollbar-thumb {
              display: none;
            }
          `}</style>
          
          {loadingSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            const isPending = index > currentStep;
            
            return (
              <motion.div
                key={index}
                ref={(el) => {
                  stepRefs.current[index] = el;
                }}
                initial={{ opacity: 0, x: -30 }}
                animate={{ 
                  opacity: isPending ? 0.3 : 1,
                  x: 0,
                }}
                transition={{ 
                  delay: index * 0.1,
                  duration: 0.4,
                }}
                style={{
                  marginBottom: "12px",
                  padding: "16px",
                  minHeight: "90px", // Fix magasság minden modulhoz
                  backgroundColor: isActive 
                    ? themeStyles.surface 
                    : isCompleted 
                    ? `${themeStyles.primary}10`
                    : "transparent",
                  borderRadius: "12px",
                  border: isActive 
                    ? `2px solid ${themeStyles.primary}` 
                    : isCompleted
                    ? `1px solid ${themeStyles.primary}40`
                    : `1px solid ${themeStyles.border}40`,
                  transition: "all 0.3s ease",
                  boxShadow: isActive 
                    ? `0 4px 12px ${themeStyles.primary}30`
                    : "none",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                }}>
                  {/* Checkmark vagy loader ikon */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}>
                  {isCompleted ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          width: "32px",
                          height: "32px",
                      borderRadius: "50%",
                      backgroundColor: themeStyles.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                          fontSize: "18px",
                      fontWeight: "bold",
                          boxShadow: `0 2px 8px ${themeStyles.primary}60`,
                        }}
                      >
                      ✓
                      </motion.div>
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          borderWidth: "3px",
                          borderStyle: "solid",
                          borderColor: `${themeStyles.primary}30`,
                          borderTopColor: themeStyles.primary,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        backgroundColor: themeStyles.surface,
                        border: `2px solid ${themeStyles.border}`,
                      }} />
                  )}
                  </div>
                  
                  {/* Step label és progress */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      color: isActive ? themeStyles.text : themeStyles.textMuted,
                      fontSize: "15px",
                      fontWeight: isActive ? 600 : 400,
                      marginBottom: "8px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {step.label}
                    </div>
                    {step.progress > 0 && (
                      <div style={{
                        width: "100%",
                        height: "6px",
                        backgroundColor: themeStyles.surface,
                        borderRadius: "3px",
                        overflow: "hidden",
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(step.progress)}%` }}
                          transition={{ duration: 0.6, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            background: themeStyles.gradient,
                            borderRadius: "3px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  
                  {/* Progress százalék */}
                  {step.progress > 0 && (
                    <motion.span
                      key={step.progress}
                      initial={{ scale: 1.2 }}
                      animate={{ scale: 1 }}
                      style={{
                        color: isActive ? themeStyles.primary : themeStyles.textMuted,
                        fontSize: "14px",
                        fontWeight: 600,
                        minWidth: "45px",
                        textAlign: "right",
                      }}
                    >
                      {Math.round(step.progress)}%
                    </motion.span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Információs szöveg - glassmorphism háttérrel */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        style={{
            width: "100%",
            maxWidth: "600px",
            marginTop: "auto",
            paddingTop: "24px",
            padding: "20px",
            backgroundColor: `${themeStyles.surface}CC`, // 80% opacity
            backdropFilter: "blur(15px)",
            WebkitBackdropFilter: "blur(15px)",
            borderRadius: "16px",
            border: `1px solid ${themeStyles.border}80`,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <motion.p
          style={{
              color: themeStyles.textMuted,
              fontSize: "13px",
            textAlign: "center",
            margin: 0,
              lineHeight: "1.6",
          }}
        >
            {t("loading.info")}
        </motion.p>
          
          {/* Pulsing dot animáció */}
          <motion.div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "16px",
            }}
          >
            {[0, 1, 2].map((i) => (
        <motion.div
                key={i}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: themeStyles.primary,
                }}
          animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
          }}
        />
            ))}
          </motion.div>
      </motion.div>
      </div>
    </motion.div>
  );
};

/**
 * Page-specific skeleton loaders
 */

export const FilamentsSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Skeleton width="200px" height="32px" theme={theme} animation="wave" style={{ marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} theme={theme} height="120px" />
        ))}
      </div>
    </div>
  );
};

export const PrintersSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Skeleton width="200px" height="32px" theme={theme} animation="wave" style={{ marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} theme={theme} height="200px" />
        ))}
      </div>
    </div>
  );
};

export const OffersSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div style={{ padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonCard key={index} theme={theme} height="250px" />
      ))}
    </div>
  );
};

export const CustomersSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Skeleton width="200px" height="32px" theme={theme} animation="wave" style={{ marginBottom: "24px" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {Array.from({ length: 8 }).map((_, index) => (
          <SkeletonCard key={index} theme={theme} height="150px" />
        ))}
      </div>
    </div>
  );
};
