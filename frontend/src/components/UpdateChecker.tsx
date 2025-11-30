import React, { useState, useEffect } from "react";
import { checkForUpdates, type VersionInfo } from "../utils/version";
import { commonStyles } from "../utils/styles";
import { open } from "@tauri-apps/plugin-shell";
import { useTranslation, type LanguageCode } from "../utils/translations";
import { logWithLanguage } from "../utils/languages/global_console";

interface Props {
  settings: {
    language: LanguageCode;
    checkForBetaUpdates?: boolean;
  };
}

const LAST_UPDATE_CHECK_KEY = "lastUpdateCheck";
const UPDATE_CHECK_INTERVAL_MS = 5 * 60 * 60 * 1000; // 5 óra

export const UpdateChecker: React.FC<Props> = ({ settings }) => {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const beta = settings.checkForBetaUpdates || false;
  const t = useTranslation(settings.language);

  useEffect(() => {
    const checkUpdates = async () => {
      const info = await checkForUpdates(beta);
      setVersionInfo(info);
      // Mentjük az utolsó ellenőrzés idejét
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    };

    // Ellenőrzés indításkor (mindig)
    checkUpdates();
    
    // Következő ellenőrzés 5 óra múlva
    const scheduleNextCheck = () => {
      setTimeout(() => {
        checkUpdates();
        scheduleNextCheck(); // Újra ütemezzük 5 óra múlva
      }, UPDATE_CHECK_INTERVAL_MS);
    };
    
    scheduleNextCheck();
  }, [beta]);

  // Ha a beta beállítás változik, azonnal újra ellenőrizzük és visszaállítjuk a dismissed-et
  useEffect(() => {
    setDismissed(false); // Visszaállítjuk, hogy az új verziókat lássa
    // Beta beállítás változásakor azonnal ellenőrizzük
    const checkUpdates = async () => {
      const info = await checkForUpdates(beta);
      setVersionInfo(info);
      localStorage.setItem(LAST_UPDATE_CHECK_KEY, Date.now().toString());
    };
    checkUpdates();
  }, [settings.checkForBetaUpdates]);

  if (dismissed || !versionInfo || !versionInfo.isUpdateAvailable) {
    return null;
  }

  const handleDownload = async () => {
    if (versionInfo?.releaseUrl) {
      try {
        logWithLanguage(settings.language, "log", "update.download.open", {
          currentVersion: versionInfo.current,
          latestVersion: versionInfo.latest,
          releaseUrl: versionInfo.releaseUrl,
          isBeta: versionInfo.isBeta,
        });
        // Tauri shell plugin használata külső linkek megnyitásához
        await open(versionInfo.releaseUrl);
        logWithLanguage(settings.language, "log", "update.download.success", {
          latestVersion: versionInfo.latest,
          releaseUrl: versionInfo.releaseUrl,
        });
      } catch (error) {
        logWithLanguage(settings.language, "error", "update.download.error", {
          releaseUrl: versionInfo.releaseUrl,
          error,
        });
        // Fallback: ha a Tauri shell nem működik, próbáljuk meg a window.open-t
        try {
          window.open(versionInfo.releaseUrl, "_blank", "noopener,noreferrer");
          logWithLanguage(settings.language, "log", "update.download.fallbackSuccess", {
            latestVersion: versionInfo.latest,
          });
        } catch (fallbackError) {
          logWithLanguage(settings.language, "error", "update.download.fallbackError", {
            error: fallbackError,
          });
        }
      }
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
              {t("updateChecker.updateAvailable")} {beta && `(${t("updateChecker.betaTag")})`}
            </strong>
          </div>
          <div style={{ fontSize: "14px", color: "#495057", marginBottom: "4px" }}>
            {t("updateChecker.currentVersion")}: <strong>{versionInfo.current}</strong>
          </div>
          <div style={{ fontSize: "14px", color: "#495057" }}>
            {t("updateChecker.latestVersion")}: <strong style={{ color: "#28a745" }}>{versionInfo.latest}</strong>
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
          title={t("updateChecker.dismiss")}
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
          📥 {t("updateChecker.download")}
        </button>
      )}
    </div>
  );
};

