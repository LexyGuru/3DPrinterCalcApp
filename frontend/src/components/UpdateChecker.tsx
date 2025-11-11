import React, { useState, useEffect } from "react";
import { checkForUpdates, type VersionInfo } from "../utils/version";
import { commonStyles } from "../utils/styles";
import { open } from "@tauri-apps/plugin-shell";
import type { LanguageCode } from "../utils/translations";

interface Props {
  settings: {
    language: LanguageCode;
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

  const translations: Partial<Record<LanguageCode, Record<string, string>>> = {
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
    fr: {
      updateAvailable: "Une mise à jour est disponible !",
      currentVersion: "Version actuelle",
      latestVersion: "Dernière version",
      download: "Télécharger",
      checking: "Vérification...",
      dismiss: "✕",
      beta: "Bêta",
    },
    "pt-BR": {
      updateAvailable: "Atualização disponível!",
      currentVersion: "Versão atual",
      latestVersion: "Última versão",
      download: "Baixar",
      checking: "Verificando...",
      dismiss: "✕",
      beta: "Beta",
    },
    es: {
      updateAvailable: "¡Actualización disponible!",
      currentVersion: "Versión actual",
      latestVersion: "Última versión",
      download: "Descargar",
      checking: "Comprobando...",
      dismiss: "✕",
      beta: "Beta",
    },
    it: {
      updateAvailable: "Aggiornamento disponibile!",
      currentVersion: "Versione attuale",
      latestVersion: "Ultima versione",
      download: "Scarica",
      checking: "Verifica...",
      dismiss: "✕",
      beta: "Beta",
    },
    pl: {
      updateAvailable: "Dostępna aktualizacja!",
      currentVersion: "Aktualna wersja",
      latestVersion: "Najnowsza wersja",
      download: "Pobierz",
      checking: "Sprawdzanie...",
      dismiss: "✕",
      beta: "Beta",
    },
    cs: {
      updateAvailable: "Je dostupná aktualizace!",
      currentVersion: "Aktuální verze",
      latestVersion: "Nejnovější verze",
      download: "Stáhnout",
      checking: "Kontroluji...",
      dismiss: "✕",
      beta: "Beta",
    },
    sk: {
      updateAvailable: "Je dostupná aktualizácia!",
      currentVersion: "Aktuálna verzia",
      latestVersion: "Najnovšia verzia",
      download: "Stiahnuť",
      checking: "Kontrolujem...",
      dismiss: "✕",
      beta: "Beta",
    },
    zh: {
      updateAvailable: "有新版本可用！",
      currentVersion: "当前版本",
      latestVersion: "最新版本",
      download: "下载",
      checking: "正在检查...",
      dismiss: "✕",
      beta: "测试版",
    },
  };

  const t = translations[settings.language] || translations.en || translations.hu!;

  if (dismissed || !versionInfo || !versionInfo.isUpdateAvailable) {
    return null;
  }

  const handleDownload = async () => {
    if (versionInfo?.releaseUrl) {
      try {
        console.log("🔄 Frissítés letöltése...", { 
          currentVersion: versionInfo.current, 
          latestVersion: versionInfo.latest,
          releaseUrl: versionInfo.releaseUrl,
          isBeta: versionInfo.isBeta 
        });
        // Tauri shell plugin használata külső linkek megnyitásához
        await open(versionInfo.releaseUrl);
        console.log("✅ Frissítés letöltés sikeresen megnyitva", { 
          latestVersion: versionInfo.latest,
          releaseUrl: versionInfo.releaseUrl 
        });
      } catch (error) {
        console.error("❌ Frissítés letöltés hiba:", error, { 
          releaseUrl: versionInfo.releaseUrl 
        });
        // Fallback: ha a Tauri shell nem működik, próbáljuk meg a window.open-t
        try {
      window.open(versionInfo.releaseUrl, '_blank', 'noopener,noreferrer');
          console.log("✅ Frissítés letöltés fallback módon megnyitva", { 
            latestVersion: versionInfo.latest 
          });
        } catch (fallbackError) {
          console.error("❌ Frissítés letöltés fallback hiba is:", fallbackError);
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

