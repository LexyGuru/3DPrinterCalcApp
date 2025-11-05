import React from "react";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { CURRENT_VERSION } from "../utils/version";

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
    { key: "home", label: t("sidebar.home") },
    { key: "filaments", label: t("sidebar.filaments") },
    { key: "printers", label: t("sidebar.printers") },
    { key: "calculator", label: t("sidebar.calculator") },
    { key: "offers", label: t("sidebar.offers") },
    { key: "settings", label: t("sidebar.settings") },
  ];
  
  return (
    <div style={{
      position: "fixed",
      left: 0,
      top: 0,
      width: "200px",
      backgroundColor: theme.colors.sidebarBg,
      color: theme.colors.sidebarText,
      height: "100vh",
      boxShadow: `2px 0 5px ${theme.colors.shadow}`,
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box"
    }}>
      <div style={{ padding: "20px", flex: "1", overflowY: "auto" }}>
        <h3 style={{ color: theme.colors.sidebarText, marginTop: 0, marginBottom: "20px" }}>{t("sidebar.menu")}</h3>
        {pages.map(page => (
          <div
            key={page.key}
            onClick={() => setActivePage(page.key)}
            style={{
              padding: "10px",
              cursor: "pointer",
              fontWeight: activePage === page.key ? "bold" : "normal",
              color: activePage === page.key ? theme.colors.sidebarActive : theme.colors.sidebarText,
              backgroundColor: activePage === page.key ? theme.colors.sidebarActive + "20" : "transparent",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (activePage !== page.key) {
                e.currentTarget.style.backgroundColor = theme.colors.sidebarHover;
              }
            }}
            onMouseLeave={(e) => {
              if (activePage !== page.key) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {page.label}
          </div>
        ))}
      </div>
      
      {/* Footer információ az alján */}
      <div style={{
        padding: "16px",
        borderTop: `1px solid ${theme.colors.border}`,
        backgroundColor: theme.colors.surface,
        fontSize: "11px",
        color: theme.colors.textMuted,
        textAlign: "center",
        flexShrink: 0
      }}>
        <div style={{ marginBottom: "8px", fontWeight: "600", color: theme.colors.text }}>
          Készítő: LexyGuru
        </div>
        <div style={{ marginBottom: "4px" }}>
          Verzió: <strong style={{ color: theme.colors.text }}>{CURRENT_VERSION}</strong>
        </div>
        <div>
          {isBeta ? (
            <span style={{ 
              display: "inline-block",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "#ffc107",
              color: theme.colors.background === "#1a1a1a" ? theme.colors.text : "#000",
              fontWeight: "600",
              fontSize: "10px"
            }}>
              BETA
            </span>
          ) : (
            <span style={{ 
              display: "inline-block",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: theme.colors.success,
              color: "#fff",
              fontWeight: "600",
              fontSize: "10px"
            }}>
              RELEASE
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
