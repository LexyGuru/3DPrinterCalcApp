import React, { useState, useEffect } from "react";
import { checkForUpdates, type VersionInfo } from "../utils/version";
import { commonStyles } from "../utils/styles";

interface Props {
  settings: {
    language: "hu" | "en" | "de";
    checkForBetaUpdates?: boolean;
  };
}

export const UpdateChecker: React.FC<Props> = ({ settings }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const beta = settings.checkForBetaUpdates || false;

  useEffect(() => {
    // Ellenőrzés indításkor, amikor a beta beállítás változik, és 5 perc múlva
    checkUpdates();
    const interval = setInterval(checkUpdates, 5 * 60 * 1000); // 5 perc
    
    return () => clearInterval(interval);
  }, [beta]);

  // Ha a beta beállítás változik, azonnal újra ellenőrizzük és visszaállítjuk a dismissed-et
  useEffect(() => {
    setDismissed(false); // Visszaállítjuk, hogy az új verziókat lássa
    checkUpdates();
  }, [settings.checkForBetaUpdates]);

  const checkUpdates = async () => {
    const info = await checkForUpdates(beta);
    setVersionInfo(info);
  };

  const translations: Record<string, Record<string, string>> = {
    hu: {
      updateAvailable: "Új verzió elérhető!",
      currentVersion: "Jelenlegi verzió",
      latestVersion: "Legújabb verzió",
      download: "Letöltés",
      checking: "Ellenőrzés...",
      dismiss: "✕",
      beta: "Beta",
    },
    en: {
      updateAvailable: "Update available!",
      currentVersion: "Current version",
      latestVersion: "Latest version",
      download: "Download",
      checking: "Checking...",
      dismiss: "✕",
      beta: "Beta",
    },
    de: {
      updateAvailable: "Update verfügbar!",
      currentVersion: "Aktuelle Version",
      latestVersion: "Neueste Version",
      download: "Herunterladen",
      checking: "Prüfe...",
      dismiss: "✕",
      beta: "Beta",
    },
  };

  const t = translations[settings.language] || translations.hu;

  if (dismissed || !versionInfo || !versionInfo.isUpdateAvailable) {
    return null;
  }

  const handleDownload = () => {
    if (versionInfo?.releaseUrl) {
      // Tauri alkalmazásban a window.open jobban működik
      window.open(versionInfo.releaseUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      right: "20px",
      zIndex: 10000,
      backgroundColor: "#fff",
      borderRadius: "12px",
      padding: "16px 20px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
      border: "2px solid #007bff",
      width: "min(400px, calc(100vw - 240px))",
      maxWidth: "400px",
      boxSizing: "border-box",
      animation: "slideIn 0.3s ease-out",
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "20px" }}>🔔</span>
            <strong style={{ fontSize: "16px", color: "#007bff" }}>
              {t.updateAvailable} {beta && `(${t.beta})`}
            </strong>
          </div>
          <div style={{ fontSize: "14px", color: "#495057", marginBottom: "4px" }}>
            {t.currentVersion}: <strong>{versionInfo.current}</strong>
          </div>
          <div style={{ fontSize: "14px", color: "#495057" }}>
            {t.latestVersion}: <strong style={{ color: "#28a745" }}>{versionInfo.latest}</strong>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: "#6c757d",
            padding: "0",
            marginLeft: "12px",
          }}
          title={t.dismiss}
        >
          ✕
        </button>
      </div>
      
      {versionInfo.releaseUrl && (
        <button
          onClick={handleDownload}
          style={{
            ...commonStyles.button,
            ...commonStyles.buttonPrimary,
            width: "100%",
            textAlign: "center",
            marginTop: "8px",
          }}
        >
          📥 {t.download}
        </button>
      )}
    </div>
  );
};

