import React from "react";
import { motion } from "framer-motion";
import type { Theme } from "../utils/themes";
import { Skeleton, SkeletonCard, SkeletonTable } from "./Skeleton";

interface AppSkeletonProps {
  theme: Theme;
  loadingSteps?: LoadingStep[];
  currentStep?: number;
}

interface LoadingStep {
  label: string;
  progress: number;
}

/**
 * App betöltési skeleton - látványos betöltési képernyő
 */
export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  theme,
  loadingSteps = [],
  currentStep = 0,
}) => {
  const themeStyles = {
    background: theme.colors.background,
    surface: theme.colors.surface,
    text: theme.colors.text,
    textMuted: theme.colors.textMuted,
    primary: theme.colors.primary,
    border: theme.colors.border,
  };

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
        backgroundColor: themeStyles.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        zIndex: 9999,
      }}
    >
      {/* Logo/Title area */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        <div style={{ margin: "0 auto 16px" }}>
          <Skeleton
            width={120}
            height={120}
            variant="circular"
            theme={theme}
            animation="wave"
          />
        </div>
        <div style={{ margin: "0 auto 8px" }}>
          <Skeleton width={200} height="32px" theme={theme} animation="wave" />
        </div>
        <div style={{ margin: "0 auto" }}>
          <Skeleton width={150} height="16px" theme={theme} animation="wave" />
        </div>
      </motion.div>

      {/* Overall Progress Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          width: "100%",
          maxWidth: "500px",
          marginBottom: "40px",
        }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "12px",
        }}>
          <span style={{ 
            color: themeStyles.text, 
            fontSize: "16px", 
            fontWeight: 600 
          }}>
            Betöltés...
          </span>
          <span style={{ 
            color: themeStyles.textMuted, 
            fontSize: "14px" 
          }}>
            {loadingSteps.length > 0 
              ? Math.round(loadingSteps.reduce((acc, step) => acc + step.progress, 0) / loadingSteps.length)
              : 0}%
          </span>
        </div>
        <div style={{
          width: "100%",
          height: "8px",
          backgroundColor: themeStyles.surface,
          borderRadius: "4px",
          overflow: "hidden",
          border: `1px solid ${themeStyles.border}`,
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ 
              width: `${loadingSteps.length > 0 
                ? Math.round(loadingSteps.reduce((acc, step) => acc + step.progress, 0) / loadingSteps.length)
                : 0}%` 
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              height: "100%",
              background: theme.colors.gradient 
                ? theme.colors.gradient 
                : `linear-gradient(90deg, ${themeStyles.primary}, ${theme.colors.primaryHover || themeStyles.primary})`,
              borderRadius: "4px",
              boxShadow: `0 0 10px ${themeStyles.primary}40`,
            }}
          />
        </div>
      </motion.div>

      {/* Loading steps */}
      {loadingSteps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{
            width: "100%",
            maxWidth: "500px",
            marginBottom: "32px",
          }}
        >
          {loadingSteps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ 
                  opacity: isActive || isCompleted ? 1 : 0.4, 
                  x: 0 
                }}
                transition={{ delay: index * 0.1 }}
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: isActive ? themeStyles.surface : "transparent",
                  borderRadius: "8px",
                  border: isActive ? `1px solid ${themeStyles.primary}` : `1px solid transparent`,
                  transition: "all 0.3s ease",
                }}
              >
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}>
                  {isCompleted ? (
                    <div style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      backgroundColor: themeStyles.primary,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontSize: "12px",
                      fontWeight: "bold",
                    }}>
                      ✓
                    </div>
                  ) : (
                    <Skeleton
                      width={24}
                      height={24}
                      variant="circular"
                      theme={theme}
                      animation={isActive ? "wave" : "none"}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{
                      color: isActive ? themeStyles.text : themeStyles.textMuted,
                      fontSize: "14px",
                      fontWeight: isActive ? 600 : 400,
                      marginBottom: "4px",
                    }}>
                      {step.label}
                    </div>
                    {step.progress > 0 && (
                      <div style={{
                        width: "100%",
                        height: "4px",
                        backgroundColor: themeStyles.surface,
                        borderRadius: "2px",
                        overflow: "hidden",
                      }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round(step.progress)}%` }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{
                            height: "100%",
                            backgroundColor: themeStyles.primary,
                            borderRadius: "2px",
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Preview skeleton - mutatja, hogy mi fog betöltődni */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          width: "100%",
          maxWidth: "900px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <SkeletonCard theme={theme} height="200px" />
        <SkeletonCard theme={theme} height="200px" />
        <SkeletonCard theme={theme} height="200px" />
      </motion.div>

      {/* Loading text with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <motion.p
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            color: themeStyles.text,
            fontSize: "16px",
            fontWeight: 500,
            textAlign: "center",
            margin: 0,
          }}
        >
          {loadingSteps[currentStep]?.label || "Betöltés..."}
        </motion.p>
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            width: "40px",
            height: "4px",
            backgroundColor: themeStyles.primary,
            borderRadius: "2px",
          }}
        />
      </motion.div>
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
      <SkeletonTable rows={8} columns={6} theme={theme} />
    </div>
  );
};

export const PrintersSkeleton: React.FC<{ theme: Theme }> = ({ theme }) => {
  return (
    <div style={{ padding: "24px" }}>
      <Skeleton width="200px" height="32px" theme={theme} animation="wave" style={{ marginBottom: "24px" }} />
      <SkeletonTable rows={5} columns={5} theme={theme} />
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
      <SkeletonTable rows={6} columns={4} theme={theme} />
    </div>
  );
};

