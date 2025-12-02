import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import type { getThemeStyles } from "../utils/themes";
import { CURRENT_VERSION } from "../utils/version";
import { open } from "@tauri-apps/plugin-shell";

interface Props {
  settings: Settings;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  isOpen: boolean;
  onClose: () => void;
}

const GITHUB_REPO = "LexyGuru/3DPrinterCalcApp";
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
const GITHUB_RELEASES_URL = `${GITHUB_URL}/releases`;
const GITHUB_ISSUES_URL = `${GITHUB_URL}/issues/new`;

export const WelcomeMessage: React.FC<Props> = ({
  settings,
  theme,
  themeStyles,
  isOpen,
  onClose,
}) => {
  const t = useTranslation(settings.language);

  const handleOpenLink = async (url: string) => {
    try {
      await open(url);
    } catch (error) {
      console.error("Hiba a link megnyitásakor:", error);
    }
  };

  const handleReportIssue = async () => {
    try {
      const title = encodeURIComponent(t("welcome.issue.title") || "Hiba jelentés");
      const body = encodeURIComponent(
        `${t("welcome.version") || "Verzió"}: ${CURRENT_VERSION}\n\n` +
        `${t("welcome.issue.descriptionPlaceholder") || "[Kérlek írj le egy részletes leírást a hibáról]"}\n\n` +
        `## ${t("welcome.issue.section.description") || "Leírás"}\n\n` +
        `\n\n` +
        `## ${t("welcome.issue.section.steps") || "Lépések a hibához vezető úthoz"}\n\n` +
        `1. \n` +
        `2. \n` +
        `3. \n\n` +
        `## ${t("welcome.issue.section.expected") || "Várt viselkedés"}\n\n` +
        `\n\n` +
        `## ${t("welcome.issue.section.actual") || "Aktuális viselkedés"}\n\n`
      );
      const issueUrl = `${GITHUB_ISSUES_URL}?title=${title}&body=${body}`;
      await open(issueUrl);
    } catch (error) {
      console.error("Hiba a GitHub issue megnyitásakor:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 9998,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              boxSizing: "border-box",
            }}
            onClick={(e) => {
              // Ne záródjon be kattintásra, csak a gombbal
              e.stopPropagation();
            }}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
              style={{
                width: "90%",
                maxWidth: "600px",
                maxHeight: "calc(100vh - 40px)",
                overflow: "hidden",
                backgroundColor: theme.colors.background?.includes('gradient')
                  ? "rgba(255, 255, 255, 0.95)"
                  : theme.colors.background,
                borderRadius: "16px",
                boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
                border: `2px solid ${theme.colors.border || "#e2e8f0"}`,
                display: "flex",
                flexDirection: "column",
                boxSizing: "border-box",
              }}
              onClick={(e) => e.stopPropagation()}
            >
            <div style={{ padding: "24px", minHeight: 0, overflowY: "auto", flex: 1 }}>
              {/* Header */}
              <div style={{ marginBottom: "24px", textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                    color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text,
                  }}
                >
                  👋 {t("welcome.title") || "Üdvözöljük!"}
                </h1>
                <p
                  style={{
                    fontSize: "14px",
                    color: theme.colors.background?.includes('gradient') ? "#4a5568" : theme.colors.textSecondary,
                  }}
                >
                  {t("welcome.subtitle") || `3D Printer Calculator App v${CURRENT_VERSION}`}
                </p>
              </div>

              {/* Content */}
              <div style={{ marginBottom: "24px" }}>
                <p
                  style={{
                    fontSize: "16px",
                    lineHeight: "1.6",
                    color: theme.colors.background?.includes('gradient') ? "#2d3748" : theme.colors.text,
                    marginBottom: "16px",
                  }}
                >
                  {t("welcome.description") || "Ez az alkalmazás segít kiszámolni a 3D nyomtatási költségeket, kezelni az árajánlatokat, és nyomon követni a projekteket és feladatokat."}
                </p>

                {/* Version info */}
                <div
                  style={{
                    padding: "12px",
                    backgroundColor: theme.colors.background?.includes('gradient')
                      ? "rgba(0, 0, 0, 0.05)"
                      : (theme.colors.primary + "15"),
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <p
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: theme.colors.background?.includes('gradient') ? "#2d3748" : theme.colors.text,
                      margin: 0,
                    }}
                  >
                    {t("welcome.version") || "Jelenlegi verzió:"} <strong>{CURRENT_VERSION}</strong>
                    {import.meta.env.VITE_IS_BETA === "true" && (
                      <span style={{ marginLeft: "8px", color: "#f59e0b" }}>
                        (BETA)
                      </span>
                    )}
                  </p>
                </div>

                {/* GitHub Links */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "16px",
                  }}
                >
                  <button
                    onClick={() => handleOpenLink(GITHUB_RELEASES_URL)}
                    style={{
                      ...themeStyles.button,
                      padding: "12px 16px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    📦 {t("welcome.viewReleases") || "Verziók"}
                  </button>
                  <button
                    onClick={() => handleOpenLink(`${GITHUB_URL}`)}
                    style={{
                      ...themeStyles.button,
                      padding: "12px 16px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    🔗 {t("welcome.viewGitHub") || "GitHub"}
                  </button>
                </div>

                {/* Report Issue Button */}
                <button
                  onClick={handleReportIssue}
                  style={{
                    ...themeStyles.button,
                    width: "100%",
                    padding: "12px 16px",
                    fontSize: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    backgroundColor: theme.colors.danger || "#ef4444",
                    color: "white",
                  }}
                >
                  🐛 {t("welcome.reportIssue") || "Hiba jelentése"}
                </button>
              </div>

              {/* Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: `1px solid ${theme.colors.border || "#e2e8f0"}`,
                }}
              >
                <button
                  onClick={onClose}
                  style={{
                    ...themeStyles.button,
                    padding: "12px 24px",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {t("welcome.continue") || "Folytatás"}
                </button>
              </div>
            </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

