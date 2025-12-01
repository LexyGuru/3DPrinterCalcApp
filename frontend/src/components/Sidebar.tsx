import React, { useState, useMemo } from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { CURRENT_VERSION } from "../utils/version";
import { FadeIn } from "../utils/animations";

// Helper function to get contrasting text color for footer
const getContrastingTextColor = (backgroundColor: string): string => {
  // Simple luminance calculation
  const hexToRgb = (hex: string) => {
    const normalized = hex.trim().replace("#", "");
    const value = parseInt(normalized.length === 3 ? normalized.split("").map(c => c + c).join("") : normalized, 16);
    return {
      r: (value >> 16) & 255,
      g: (value >> 8) & 255,
      b: value & 255,
    };
  };

  const getLuminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    const normalize = (channel: number) => {
      const c = channel / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
  };

  // Extract hex color from rgba or hex string
  let bgHex = backgroundColor;
  if (backgroundColor.startsWith("rgba") || backgroundColor.startsWith("rgb")) {
    // For rgba/rgb, we need to approximate - use a light gray for light backgrounds
    // This is a simplified approach - for rgba we'd need to blend with actual background
    if (backgroundColor.includes("255, 255, 255") || backgroundColor.includes("249, 250, 251")) {
      bgHex = "#f9fafb"; // Light gray
    } else {
      bgHex = "#2d2d2d"; // Dark gray
    }
  }

  const luminance = getLuminance(bgHex);
  // If background is light (luminance > 0.5), use dark text, otherwise light text
  return luminance > 0.5 ? "#1a202c" : "#ffffff";
};

interface Props {
  activePage: string;
  setActivePage: (page: string) => void;
  settings: Settings;
  isBeta?: boolean;
  theme: Theme;
  isOpen: boolean;
}

interface MenuSection {
  title: string;
  items: Array<{
    key: string;
    label: string;
    icon: string;
  }>;
}

export const Sidebar: React.FC<Props> = ({ activePage, setActivePage, settings, isBeta = false, theme, isOpen }) => {
  const t = useTranslation(settings.language);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["main"]));

  // Responsive font size based on language
  const getFontSize = (baseSize: number) => {
    // Chinese, Japanese, Korean characters need slightly smaller font
    const cjkLanguages = ["zh", "ja", "ko"];
    if (cjkLanguages.includes(settings.language)) {
      return `${baseSize * 0.9}px`;
    }
    // Russian, Ukrainian, etc. might need adjustment
    const cyrillicLanguages = ["ru", "uk"];
    if (cyrillicLanguages.includes(settings.language)) {
      return `${baseSize * 0.95}px`;
    }
    return `${baseSize}px`;
  };

  // Menu sections organized like the hospital dashboard
  const menuSections: MenuSection[] = useMemo(() => [
    {
      title: t("sidebar.section.main") || "MAIN",
      items: [
        { key: "home", label: t("sidebar.home"), icon: "🏠" },
        { key: "calculator", label: t("sidebar.calculator"), icon: "🧮" },
      ],
    },
    {
      title: t("sidebar.section.management") || "MANAGEMENT",
      items: [
        { key: "printers", label: t("sidebar.printers"), icon: "🖨️" },
        { key: "filaments", label: t("sidebar.filaments"), icon: "🧵" },
        { key: "filament-stock", label: t("sidebar.filamentStock") || "Készletnyilvántartás", icon: "📦" },
        { key: "customers", label: t("sidebar.customers"), icon: "👥" },
        { key: "offers", label: t("sidebar.offers"), icon: "📋" },
        { key: "projects", label: t("sidebar.projects") || "Projektek", icon: "📁" },
        { key: "tasks", label: t("sidebar.tasks") || "Feladatok", icon: "✅" },
      ],
    },
    {
      title: t("sidebar.section.analytics") || "ANALYTICS",
      items: [
        { key: "priceTrends", label: t("sidebar.priceTrends"), icon: "📈" },
        { key: "calendar", label: t("sidebar.calendar") || "Naptár", icon: "📅" },
      ],
    },
    {
      title: t("sidebar.section.system") || "SYSTEM",
      items: [
        { key: "settings", label: t("sidebar.settings"), icon: "⚙️" },
        ...(settings.showConsole ? [{ key: "console", label: t("sidebar.console"), icon: "🖥️" }] : []),
      ],
    },
  ], [t, settings.language, settings.showConsole]);

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionTitle)) {
        next.delete(sectionTitle);
      } else {
        next.add(sectionTitle);
      }
      return next;
    });
  };

  // Theme-aware colors
  const isGradientBg = typeof theme.colors.sidebarBg === 'string' && theme.colors.sidebarBg.includes('gradient');
  const isNeon = theme.name === 'neon' || theme.name === 'cyberpunk';
  const isGlassmorphism = theme.name === 'gradient' || theme.name === 'sunset' || theme.name === 'ocean';
  
  // Get sidebar colors from theme
  const sidebarBg = theme.colors.sidebarBg;
  const sidebarText = theme.colors.sidebarText;
  const sidebarActive = typeof theme.colors.sidebarActive === 'string' 
    ? theme.colors.sidebarActive 
    : theme.colors.primary;
  const sidebarHover = theme.colors.sidebarHover;
  const borderColor = theme.colors.border;
  
  // Calculate section title color (muted version of sidebar text)
  const getSectionTitleColor = () => {
    // For light themes, use darker muted color
    if (theme.name === 'light' || theme.name === 'pastel') {
      return theme.colors.textMuted || "#6b7280";
    }
    // For dark themes, use lighter muted color
    return theme.colors.textMuted || "rgba(255, 255, 255, 0.6)";
  };
  const sectionTitleColor = getSectionTitleColor();

  // Footer background - slightly darker/lighter than sidebar
  const getFooterBg = () => {
    if (isGradientBg) {
      return "transparent";
    }
    if (isGlassmorphism) {
      return "rgba(255, 255, 255, 0.05)";
    }
    // Slightly adjust sidebar background for footer
    if (theme.name === 'light' || theme.name === 'pastel') {
      return theme.colors.surfaceHover || "#f9fafb";
    }
    return theme.colors.surface || sidebarBg;
  };
  const footerBg = getFooterBg();
  
  // Footer text color - dynamically calculated for good contrast
  const footerTextColor = useMemo(() => {
    // For transparent or gradient backgrounds, use sidebar text
    if (footerBg === "transparent" || isGradientBg) {
      return sidebarText;
    }
    // For glassmorphism, use light text
    if (isGlassmorphism) {
      return "#ffffff";
    }
    // Calculate contrasting color based on footer background
    return getContrastingTextColor(footerBg);
  }, [footerBg, isGradientBg, isGlassmorphism, sidebarText]);
  
  // Footer muted text color - slightly less contrast
  const footerMutedTextColor = useMemo(() => {
    if (footerBg === "transparent" || isGradientBg) {
      return sectionTitleColor;
    }
    if (isGlassmorphism) {
      return "rgba(255, 255, 255, 0.7)";
    }
    // For light backgrounds, use darker muted, for dark backgrounds use lighter muted
    const isLight = footerTextColor === "#1a202c";
    return isLight ? "#6b7280" : "rgba(255, 255, 255, 0.6)";
  }, [footerBg, footerTextColor, isGradientBg, sectionTitleColor]);

  const sidebarWidth = isOpen ? 260 : 0;

  return (
    <aside
      data-sidebar="true"
      role="navigation"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: `${sidebarWidth}px`,
        ...(isGradientBg
          ? {
              backgroundImage: sidebarBg,
              backgroundAttachment: "fixed",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }
          : {
              backgroundColor: sidebarBg,
            }
        ),
        color: sidebarText,
        height: "100vh",
        boxShadow: isOpen 
          ? (isNeon 
              ? `0 0 20px ${theme.colors.shadow}, 2px 0 10px ${theme.colors.shadow}`
              : `2px 0 10px ${theme.colors.shadow}`)
          : "none",
        zIndex: 1001,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        borderRight: isOpen ? `1px solid ${borderColor}` : "none",
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s",
        overflow: "hidden",
        backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
      }}
    >
      {isOpen && (
        <>
          <div style={{ padding: "20px 16px", flex: "1", overflowY: "auto", overflowX: "hidden" }}>
            {/* Logo/Title */}
            <FadeIn delay={0.1}>
              <div style={{ marginBottom: "32px", paddingBottom: "20px", borderBottom: `1px solid ${borderColor}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
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
                      flexShrink: 0,
                      boxShadow: isNeon ? `0 0 10px ${theme.colors.primary}` : "none",
                    }}
                  >
                    3D
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3
                      style={{
                        color: sidebarText,
                        margin: 0,
                        fontSize: getFontSize(18),
                        fontWeight: "700",
                        lineHeight: "1.2",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        textShadow: isNeon ? `0 0 8px ${sidebarText}` : "none",
                      }}
                    >
                      3DPrinterCalcApp
                    </h3>
                    <p
                      style={{
                        color: sectionTitleColor,
                        margin: "4px 0 0 0",
                        fontSize: getFontSize(11),
                        fontWeight: "500",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {t("sidebar.menu") || "Menu"}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Menu Sections */}
            {menuSections.map((section, sectionIndex) => {
              const isExpanded = expandedSections.has(section.title);

              return (
                <FadeIn key={section.title} delay={0.1 + sectionIndex * 0.05}>
                  <div style={{ marginBottom: "8px" }}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(section.title)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        marginBottom: "4px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        color: sectionTitleColor,
                        fontSize: getFontSize(11),
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        borderRadius: "6px",
                        transition: "all 0.2s",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = sidebarHover;
                        e.currentTarget.style.color = sidebarText;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = sectionTitleColor;
                      }}
                    >
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {section.title}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        style={{
                          transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                          transition: "transform 0.2s",
                          flexShrink: 0,
                          marginLeft: "8px",
                        }}
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>

                    {/* Section Items */}
                    {isExpanded && (
                      <div style={{ paddingLeft: "8px" }}>
                        {section.items.map((item) => {
                          const isActive = activePage === item.key;
                          const activeBg = isGlassmorphism
                            ? "rgba(255, 255, 255, 0.15)"
                            : isNeon
                            ? `${sidebarActive}20`
                            : typeof sidebarActive === 'string' && sidebarActive.includes('gradient')
                            ? sidebarActive
                            : `${sidebarActive}20`;
                          
                          return (
                            <div
                              key={item.key}
                              onClick={() => setActivePage(item.key)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setActivePage(item.key);
                                }
                              }}
                              role="button"
                              tabIndex={0}
                              aria-label={item.label}
                              aria-current={isActive ? "page" : undefined}
                              style={{
                                padding: "10px 12px 10px 16px",
                                marginBottom: "4px",
                                cursor: "pointer",
                                fontWeight: isActive ? "600" : "500",
                                color: isActive ? sidebarActive : sidebarText,
                                backgroundColor: isActive ? activeBg : "transparent",
                                borderRadius: "6px",
                                border: isActive ? `1px solid ${sidebarActive}` : "1px solid transparent",
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                outline: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                fontSize: getFontSize(14),
                                lineHeight: "1.4",
                                boxShadow: isActive && isNeon ? `0 0 10px ${sidebarActive}40` : "none",
                                textShadow: isActive && isNeon ? `0 0 4px ${sidebarActive}` : "none",
                              }}
                              onMouseEnter={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = sidebarHover;
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = "transparent";
                                }
                              }}
                              onFocus={(e) => {
                                if (!isActive) {
                                  e.currentTarget.style.backgroundColor = sidebarHover;
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
                            >
                              <span
                                style={{
                                  fontSize: "18px",
                                  flexShrink: 0,
                                  filter: isActive && isNeon ? `drop-shadow(0 0 4px ${sidebarActive})` : "none",
                                }}
                              >
                                {item.icon}
                              </span>
                              <span
                                style={{
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  minWidth: 0,
                                }}
                              >
                                {item.label}
                              </span>
                              {isActive && (
                                <span
                                  style={{
                                    fontSize: getFontSize(12),
                                    color: sidebarActive,
                                    flexShrink: 0,
                                    textShadow: isNeon ? `0 0 4px ${sidebarActive}` : "none",
                                  }}
                                >
                                  ✓
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Footer */}
          <FadeIn delay={0.3}>
            <div
              style={{
                padding: "16px",
                borderTop: `1px solid ${borderColor}`,
                ...(isGradientBg
                  ? { backgroundColor: "transparent" }
                  : { backgroundColor: footerBg }
                ),
                backdropFilter: isGlassmorphism ? "blur(10px)" : "none",
                fontSize: getFontSize(11),
                color: footerTextColor,
                textAlign: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  marginBottom: "8px",
                  fontWeight: "600",
                  color: footerTextColor,
                  fontSize: getFontSize(11),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  textShadow: isNeon ? `0 0 4px ${footerTextColor}` : "none",
                }}
              >
                {t("sidebar.footer.author") || "Készítő: LexyGuru"}
              </div>
              <div
                style={{
                  marginBottom: "4px",
                  color: footerMutedTextColor,
                  fontSize: getFontSize(10),
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t("sidebar.footer.version") || "Verzió"}:{" "}
                <strong style={{ color: footerTextColor }}>{CURRENT_VERSION}</strong>
              </div>
              <div>
                {isBeta ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: theme.colors.danger || "#ffc107", // Danger/Warning szín a témából
                      color: theme.name === 'light' || theme.name === 'pastel' ? "#000" : "#fff", // Kontrasztos szín
                      fontWeight: "700",
                      fontSize: getFontSize(10),
                      letterSpacing: "0.5px",
                      boxShadow: isNeon ? `0 0 10px ${theme.colors.danger || "#ffc107"}` : "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    BETA
                  </span>
                ) : (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: typeof theme.colors.success === 'string' && theme.colors.success.includes('gradient')
                        ? theme.colors.success
                        : theme.colors.success,
                      color: "#fff", // Fehér szöveg mindig jól olvasható a success háttéren
                      fontWeight: "700",
                      fontSize: getFontSize(10),
                      letterSpacing: "0.5px",
                      boxShadow: isNeon ? `0 0 10px ${theme.colors.success}` : "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    RELEASE
                  </span>
                )}
              </div>
            </div>
          </FadeIn>
        </>
      )}
    </aside>
  );
};
