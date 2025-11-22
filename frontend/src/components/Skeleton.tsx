import React from "react";
import type { Theme } from "../utils/themes";
import { motion } from "framer-motion";

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  theme?: Theme;
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
  style?: React.CSSProperties;
}

/**
 * Skeleton komponens - animált placeholder betöltéshez
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = "100%",
  height = "1em",
  borderRadius = "4px",
  theme,
  className = "",
  variant = "rectangular",
  animation = "wave",
  style,
}) => {
  const baseStyle: React.CSSProperties = {
    ...style,
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
    borderRadius: variant === "circular" ? "50%" : variant === "text" ? "4px" : borderRadius,
    backgroundColor: theme?.colors?.surfaceHover || "#e9ecef",
    position: "relative",
    overflow: "hidden",
  };

  const shimmerStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: theme
      ? `linear-gradient(90deg, transparent, ${theme.colors.surfaceHover || "rgba(255,255,255,0.2)"}, transparent)`
      : "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
    animation: animation === "wave" ? "shimmer 1.5s infinite" : "none",
  };

  return (
    <div style={baseStyle} className={className}>
      {animation === "wave" && <div style={shimmerStyle} />}
      <style>{`
        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
      {animation === "pulse" && (
        <motion.div
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ width: "100%", height: "100%", backgroundColor: "inherit" }}
        />
      )}
    </div>
  );
};

/**
 * Skeleton Text - szöveg placeholder
 */
export const SkeletonText: React.FC<{
  lines?: number;
  width?: string | number;
  theme?: Theme;
  lastLineWidth?: string | number;
}> = ({ lines = 3, width = "100%", theme, lastLineWidth = "60%" }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          width={index === lines - 1 ? lastLineWidth : width}
          height="16px"
          variant="text"
          theme={theme}
          animation="wave"
        />
      ))}
    </div>
  );
};

/**
 * Skeleton Card - kártya placeholder
 */
export const SkeletonCard: React.FC<{
  theme?: Theme;
  height?: string | number;
}> = ({ theme, height = "200px" }) => {
  return (
    <div
      style={{
        backgroundColor: theme?.colors?.surface || "#ffffff",
        borderRadius: "12px",
        padding: "24px",
        border: `1px solid ${theme?.colors?.border || "#e9ecef"}`,
        height: typeof height === "number" ? `${height}px` : height,
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Skeleton width="60%" height="24px" theme={theme} animation="wave" />
      <SkeletonText lines={3} theme={theme} />
      <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
        <Skeleton width="80px" height="36px" borderRadius="8px" theme={theme} animation="wave" />
        <Skeleton width="80px" height="36px" borderRadius="8px" theme={theme} animation="wave" />
      </div>
    </div>
  );
};

/**
 * Skeleton Table - táblázat placeholder
 */
export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  theme?: Theme;
}> = ({ rows = 5, columns = 4, theme }) => {
  return (
    <div
      style={{
        backgroundColor: theme?.colors?.surface || "#ffffff",
        borderRadius: "12px",
        overflow: "hidden",
        border: `1px solid ${theme?.colors?.border || "#e9ecef"}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: "16px",
          padding: "16px",
          backgroundColor: theme?.colors?.tableHeaderBg || theme?.colors?.surfaceHover || "#f8f9fa",
          borderBottom: `1px solid ${theme?.colors?.border || "#e9ecef"}`,
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} width="100%" height="20px" theme={theme} animation="wave" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: "16px",
            padding: "16px",
            borderBottom: rowIndex < rows - 1 ? `1px solid ${theme?.colors?.border || "#e9ecef"}` : "none",
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              width={colIndex === 0 ? "80%" : "100%"}
              height="16px"
              theme={theme}
              animation="wave"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

