import React from "react";
import type { Settings } from "../types";
import { useTranslation } from "../utils/translations";

interface Props {
  activePage: string;
  setActivePage: (page: string) => void;
  settings: Settings;
}

export const Sidebar: React.FC<Props> = ({ activePage, setActivePage, settings }) => {
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
      padding: "20px",
      height: "100vh",
      boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
      zIndex: 1000,
      overflowY: "auto",
      boxSizing: "border-box"
    }}>
      <h3 style={{ color: "#111" }}>{t("sidebar.menu")}</h3>
      {pages.map(page => (
        <div
          key={page.key}
          onClick={() => setActivePage(page.key)}
          style={{
            padding: "10px",
            cursor: "pointer",
            fontWeight: activePage === page.key ? "bold" : "normal",
            color: activePage === page.key ? "#007bff" : "#111"
          }}
        >
          {page.label}
        </div>
      ))}
    </div>
  );
};
