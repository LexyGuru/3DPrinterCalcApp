import React, { useState, useEffect } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";

interface Props {
  settings: Settings;
  theme: Theme;
  onMenuToggle: () => void;
  isSidebarOpen: boolean;
}

export const Header: React.FC<Props> = ({ settings, theme, onMenuToggle, isSidebarOpen }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(settings.language === "hu" ? "hu-HU" : settings.language === "de" ? "de-DE" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Theme-aware colors
  const isGradientBg = typeof theme.colors.background === 'string' && theme.colors.background.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  const isLight = theme.name === 'light' || theme.name === 'pastel';
  
  // Header background - use surface color for better contrast
  const getHeaderBg = () => {
    if (isGradientBg && isGlassmorphism) {
      return "rgba(255, 255, 255, 0.95)";
    }
    if (isGradientBg) {
      return theme.colors.surface || "rgba(255, 255, 255, 0.9)";
    }
    return theme.colors.surface || theme.colors.background;
  };
  const headerBg = getHeaderBg();
  
  // Header text color - ensure good contrast
  const getHeaderText = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.text || "#1a1a1a";
    }
    if (isGradientBg) {
      return "#ffffff";
    }
    return theme.colors.text;
  };
  const headerText = getHeaderText();
  
  // Muted text color for date
  const getMutedText = () => {
    if (isGradientBg && isGlassmorphism) {
      return theme.colors.textMuted || "#6b7280";
    }
    if (isGradientBg) {
      return "rgba(255, 255, 255, 0.8)";
    }
    return theme.colors.textMuted || (isLight ? "#6b7280" : "#9ca3af");
  };
  const mutedText = getMutedText();
  
  const borderColor = theme.colors.border;
  const hoverBg = theme.colors.surfaceHover || (isLight ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.1)");

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: isSidebarOpen ? "260px" : "0",
        right: 0,
        height: "70px",
        ...(isGradientBg && !isGlassmorphism
          ? {
              backgroundColor: headerBg,
            }
          : {
              backgroundColor: headerBg,
            }
        ),
        borderBottom: `1px solid ${borderColor}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        zIndex: 999,
        transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isNeon
          ? `0 0 20px ${theme.colors.shadow}, 0 2px 8px ${theme.colors.shadow}`
          : `0 2px 8px ${theme.colors.shadow}`,
        backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
      }}
    >
      {/* Left: Logo and Menu Toggle */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: headerText,
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = hoverBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: typeof theme.colors.primary === 'string' && theme.colors.primary.includes('gradient')
                ? theme.colors.primary
                : theme.colors.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "18px",
              boxShadow: isNeon ? `0 0 10px ${theme.colors.primary}` : "none",
            }}
          >
            3D
          </div>
          <span
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: headerText,
              textShadow: isNeon ? `0 0 8px ${headerText}` : "none",
            }}
          >
            3DPrinterCalcApp
          </span>
        </div>
      </div>

      {/* Right: Date and Time */}
      <div style={{ display: "flex", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: "2px",
          }}
        >
          <span style={{ 
            fontSize: "12px", 
            color: mutedText, 
            fontWeight: "500",
            textShadow: isNeon ? `0 0 4px ${mutedText}` : "none",
          }}>
            {formatDate(currentDate)}
          </span>
          <span style={{ 
            fontSize: "18px", 
            color: headerText, 
            fontWeight: "600",
            textShadow: isNeon ? `0 0 8px ${headerText}` : (isGradientBg && !isGlassmorphism ? "0 1px 3px rgba(0,0,0,0.3)" : "none"),
          }}>
            {formatTime(currentDate)}
          </span>
        </div>
      </div>
    </header>
  );
};
