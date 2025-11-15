import React from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { CURRENT_VERSION } from "../utils/version";
import { FadeIn } from "../utils/animations";

interface Props {
  activePage: string;
  setActivePage: (page: string) => void;
  settings: Settings;
  isBeta?: boolean;
  theme: Theme;
}

export const Sidebar: React.FC<Props> = ({ activePage, setActivePage, settings, isBeta = false, theme }) => {
  const t = useTranslation(settings.language);
  
  const pages = [
    { key: "home", label: t("sidebar.home"), icon: "🏠" },
    { key: "filaments", label: t("sidebar.filaments"), icon: "🧵" },
    { key: "printers", label: t("sidebar.printers"), icon: "🖨️" },
    { key: "calculator", label: t("sidebar.calculator"), icon: "🧮" },
    { key: "offers", label: t("sidebar.offers"), icon: "📋" },
    { key: "customers", label: t("sidebar.customers"), icon: "👥" },
    { key: "priceTrends", label: t("sidebar.priceTrends"), icon: "📈" },
    { key: "settings", label: t("sidebar.settings"), icon: "⚙️" },
    ...(settings.showConsole ? [{ key: "console", label: t("sidebar.console"), icon: "🖥️" }] : []),
  ];

  // Téma specifikus stílusok
  const isGradient = theme.colors.sidebarBg?.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  
  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "200px",
      ...(isGradient
        ? {
            backgroundImage: theme.colors.sidebarBg,
            backgroundAttachment: "fixed",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }
        : {
      backgroundColor: theme.colors.sidebarBg,
          }
      ),
      color: theme.colors.sidebarText,
      height: "100vh",
      boxShadow: isNeon
        ? `0 0 20px ${theme.colors.shadow}, 2px 0 10px ${theme.colors.shadow}`
        : `2px 0 10px ${theme.colors.shadow}`,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      borderRight: isNeon
        ? `1px solid ${theme.colors.border}`
        : `1px solid ${theme.colors.border}`,
      backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      <div style={{ padding: "20px", flex: "1", overflowY: "auto" }}>
        <FadeIn delay={0.1}>
          <h3 style={{ 
            color: theme.colors.sidebarText, 
            marginTop: 0, 
            marginBottom: "24px",
            fontSize: "18px",
            fontWeight: "700",
            textShadow: isNeon ? `0 0 10px ${theme.colors.sidebarText}` : "none",
          }}>
            {t("sidebar.menu")}
          </h3>
        </FadeIn>
        {pages.map((page, index) => {
          const isActive = activePage === page.key;
          return (
            <FadeIn key={page.key} delay={0.1 + index * 0.05}>
              <div
            onClick={() => setActivePage(page.key)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActivePage(page.key);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={page.label}
                aria-current={isActive ? "page" : undefined}
            style={{
                  padding: "12px 16px",
                  marginBottom: "8px",
              cursor: "pointer",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive 
                    ? (isNeon ? theme.colors.sidebarActive : "#ffffff")
                    : theme.colors.sidebarText,
                  backgroundColor: isActive
                    ? isGlassmorphism
                      ? "rgba(255, 255, 255, 0.15)"
                      : isNeon
                      ? theme.colors.sidebarActive + "20"
                      : theme.colors.sidebarActive
                    : "transparent",
                  borderRadius: "10px",
                  border: isActive
                    ? `2px solid ${theme.colors.sidebarActive}`
                    : `2px solid transparent`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  outline: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  boxShadow: isActive && isNeon
                    ? `0 0 15px ${theme.colors.sidebarActive}, 0 2px 8px ${theme.colors.shadow}`
                    : isActive
                    ? `0 2px 8px ${theme.colors.shadow}`
                    : "none",
                  textShadow: isActive && isNeon ? `0 0 8px ${theme.colors.sidebarActive}` : "none",
                  transform: isActive ? "translateX(4px)" : "translateX(0)",
            }}
            onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isGlassmorphism
                      ? "rgba(255, 255, 255, 0.1)"
                      : theme.colors.sidebarHover;
                    e.currentTarget.style.transform = "translateX(4px)";
                    if (isNeon) {
                      e.currentTarget.style.boxShadow = `0 0 10px ${theme.colors.sidebarActive}40`;
                    }
              }
            }}
            onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }
                }}
                onFocus={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isGlassmorphism
                      ? "rgba(255, 255, 255, 0.1)"
                      : theme.colors.sidebarHover;
                  }
                  e.currentTarget.style.outline = `2px solid ${theme.colors.primary}`;
                  e.currentTarget.style.outlineOffset = "2px";
                }}
                onBlur={(e) => {
                  if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
                  e.currentTarget.style.outline = "none";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.blur();
            }}
          >
                <span style={{ 
                  fontSize: "20px",
                  filter: isActive && isNeon ? `drop-shadow(0 0 4px ${theme.colors.sidebarActive})` : "none",
                }}>
                  {page.icon}
                </span>
                <span style={{ fontSize: "14px", flex: 1 }}>{page.label}</span>
                {isActive && (
                  <span style={{ 
                    fontSize: "12px",
                    color: theme.colors.sidebarActive,
                    textShadow: isNeon ? `0 0 4px ${theme.colors.sidebarActive}` : "none",
                  }}>
                    ✓
                  </span>
                )}
          </div>
            </FadeIn>
          );
        })}
      </div>
      
      {/* Footer információ az alján */}
      <FadeIn delay={0.3}>
      <div style={{
        padding: "16px",
        borderTop: `1px solid ${theme.colors.border}`,
          backgroundColor: isGlassmorphism
            ? "rgba(255, 255, 255, 0.1)"
            : isGradient
            ? "transparent"
            : theme.colors.sidebarBg,
          backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
        fontSize: "11px",
          color: theme.colors.sidebarText,
        textAlign: "center",
          flexShrink: 0,
      }}>
          <div style={{ 
            marginBottom: "8px", 
            fontWeight: "600", 
            color: theme.colors.sidebarText,
            textShadow: isNeon ? `0 0 4px ${theme.colors.sidebarText}` : "none",
          }}>
          Készítő: LexyGuru
        </div>
          <div style={{ marginBottom: "4px", color: theme.colors.sidebarText }}>
            Verzió: <strong style={{ 
              color: theme.colors.sidebarText,
              textShadow: isNeon ? `0 0 4px ${theme.colors.sidebarText}` : "none",
            }}>{CURRENT_VERSION}</strong>
        </div>
        <div>
          {isBeta ? (
            <span style={{ 
              display: "inline-block",
                padding: "6px 12px",
                borderRadius: "8px",
                background: isNeon
                  ? `linear-gradient(135deg, #ffc107, #ff9800)`
                  : isGradient || isGlassmorphism
                  ? `linear-gradient(135deg, #ffc107, #ff9800)`
                  : "#ffc107",
                color: isNeon || isGradient || isGlassmorphism ? "#000" : "#000",
                fontWeight: "700",
                fontSize: "11px",
                letterSpacing: "0.5px",
                boxShadow: isNeon 
                  ? `0 0 15px #ffc107, 0 2px 6px rgba(0,0,0,0.3)`
                  : isGradient || isGlassmorphism
                  ? `0 2px 8px rgba(255, 193, 7, 0.4), 0 1px 4px rgba(0,0,0,0.2)`
                  : `0 2px 6px ${theme.colors.shadow}`,
                textShadow: isNeon ? `0 0 4px rgba(0,0,0,0.3)` : "none",
                border: isGradient || isGlassmorphism ? "1px solid rgba(255, 193, 7, 0.3)" : "none",
            }}>
              BETA
            </span>
          ) : (
            <span style={{ 
              display: "inline-block",
                padding: "6px 12px",
                borderRadius: "8px",
                background: isNeon
                  ? `linear-gradient(135deg, ${theme.colors.success}, ${theme.colors.successHover})`
                  : isGradient || isGlassmorphism
                  ? (typeof theme.colors.primary === 'string' && theme.colors.primary.includes('gradient')
                    ? theme.colors.primary
                    : `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryHover})`)
                  : theme.colors.success,
              color: "#fff",
                fontWeight: "700",
                fontSize: "11px",
                letterSpacing: "0.5px",
                boxShadow: isNeon 
                  ? `0 0 15px ${theme.colors.success}, 0 2px 6px rgba(0,0,0,0.3)`
                  : isGradient || isGlassmorphism
                  ? `0 2px 8px ${theme.colors.shadow}, 0 1px 4px rgba(0,0,0,0.2)`
                  : `0 2px 6px ${theme.colors.shadow}`,
                textShadow: isGradient || isGlassmorphism ? "0 1px 2px rgba(0,0,0,0.3)" : "none",
                border: isGradient || isGlassmorphism ? "1px solid rgba(255,255,255,0.2)" : "none",
            }}>
              RELEASE
            </span>
          )}
        </div>
      </div>
      </FadeIn>
    </div>
  );
};
