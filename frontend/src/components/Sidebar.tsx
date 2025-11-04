import React from "react";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";
import { CURRENT_VERSION } from "../utils/version";

interface Props {
  activePage: string;
  setActivePage: (page: string) => void;
  settings: Settings;
  isBeta?: boolean;
}

export const Sidebar: React.FC<Props> = ({ activePage, setActivePage, settings, isBeta = false }) => {
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
      backgroundColor: "#f5f5f5",
      color: "#111111",
      height: "100vh",
      boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box"
    }}>
      <div style={{ padding: "20px", flex: "1", overflowY: "auto" }}>
        <h3 style={{ color: "#111", marginTop: 0, marginBottom: "20px" }}>{t("sidebar.menu")}</h3>
        {pages.map(page => (
          <div
            key={page.key}
            onClick={() => setActivePage(page.key)}
            style={{
              padding: "10px",
              cursor: "pointer",
              fontWeight: activePage === page.key ? "bold" : "normal",
              color: activePage === page.key ? "#007bff" : "#111",
              borderRadius: "4px",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => {
              if (activePage !== page.key) {
                e.currentTarget.style.backgroundColor = "#e9ecef";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            {page.label}
          </div>
        ))}
      </div>
      
      {/* Footer információ az alján */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #dee2e6",
        backgroundColor: "#f8f9fa",
        fontSize: "11px",
        color: "#6c757d",
        textAlign: "center",
        flexShrink: 0
      }}>
        <div style={{ marginBottom: "8px", fontWeight: "600", color: "#495057" }}>
          Készítő: LexyGuru
        </div>
        <div style={{ marginBottom: "4px" }}>
          Verzió: <strong style={{ color: "#212529" }}>{CURRENT_VERSION}</strong>
        </div>
        <div>
          {isBeta ? (
            <span style={{ 
              display: "inline-block",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "#ffc107",
              color: "#000",
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
              backgroundColor: "#28a745",
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
