import React from "react";
import type { Theme } from "../../../utils/themes";
import type { TranslationKey } from "../../../utils/translations";

export type SettingsTab = "general" | "display" | "security" | "advanced" | "data" | "library";

interface SettingsTabsProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
  theme: Theme;
  t: (key: TranslationKey | string, params?: Record<string, string | number>) => string;
}

export const SettingsTabs: React.FC<SettingsTabsProps> = ({
  activeTab,
  onTabChange,
  theme,
  t,
}) => {
  const isGradientBackground = theme.colors.background?.includes("gradient");
  
  const tabButtonStyle = (isActive: boolean) => ({
    padding: "12px 24px",
    border: "none",
    borderBottom: isActive ? `3px solid ${theme.colors.primary}` : `3px solid transparent`,
    backgroundColor: isActive
      ? (isGradientBackground ? "rgba(255, 255, 255, 0.9)" : theme.colors.surfaceHover)
      : (isGradientBackground ? "rgba(255, 255, 255, 0.7)" : "transparent"),
    color: isActive
      ? (isGradientBackground ? "#1a202c" : theme.colors.primary)
      : (isGradientBackground ? "#1a202c" : theme.colors.text),
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: isActive ? "700" : "600",
    transition: "all 0.2s",
    borderRadius: "4px 4px 0 0",
    backdropFilter: isGradientBackground ? "blur(8px)" : "none",
  });

  const tabs: Array<{ id: SettingsTab; icon: string; labelKey: string }> = [
    { id: "general", icon: "⚙️", labelKey: "settings.tabs.general" },
    { id: "display", icon: "🎨", labelKey: "settings.tabs.display" },
    { id: "security", icon: "🔒", labelKey: "settings.tabs.security" },
    { id: "advanced", icon: "🔧", labelKey: "settings.tabs.advanced" },
    { id: "data", icon: "💾", labelKey: "settings.tabs.data" },
    { id: "library", icon: "🧵", labelKey: "settings.tabs.library" },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        marginBottom: "0",
        borderBottom: `1px solid ${theme.colors.border}`,
        backgroundColor: isGradientBackground ? "rgba(255, 255, 255, 0.85)" : theme.colors.surface,
        borderRadius: "8px 8px 0 0",
        overflow: "auto",
        backdropFilter: isGradientBackground ? "blur(10px)" : "none",
        opacity: isGradientBackground ? 0.9 : 1,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          style={tabButtonStyle(activeTab === tab.id)}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = isGradientBackground
                ? "rgba(255, 255, 255, 0.85)"
                : theme.colors.surfaceHover;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.backgroundColor = isGradientBackground
                ? "rgba(255, 255, 255, 0.7)"
                : "transparent";
            }
          }}
        >
          {tab.icon} {t(tab.labelKey)}
        </button>
      ))}
    </div>
  );
};
