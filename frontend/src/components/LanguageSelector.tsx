import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LanguageCode } from "../types";
import type { Theme } from "../utils/themes";

interface LanguageSelectorProps {
  onLanguageSelect: (language: LanguageCode) => void;
  theme: Theme;
}

const LANGUAGES: Array<{ code: LanguageCode; name: string; flag: string }> = [
  { code: "hu", name: "Magyar", flag: "🇭🇺" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pl", name: "Polski", flag: "🇵🇱" },
  { code: "cs", name: "Čeština", flag: "🇨🇿" },
  { code: "sk", name: "Slovenčina", flag: "🇸🇰" },
  { code: "pt-BR", name: "Português", flag: "🇵🇹" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  onLanguageSelect,
  theme,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode | null>(null);

  const handleSelect = (language: LanguageCode) => {
    setSelectedLanguage(language);
    // Kis késleltetés a smooth animációhoz
    setTimeout(() => {
      onLanguageSelect(language);
    }, 300);
  };

  const isLight = theme.colors.background?.includes('gradient') || 
                  (typeof theme.colors.background === 'string' && 
                   (theme.colors.background.includes('#fff') || 
                    theme.colors.background.includes('#ffffff') ||
                    theme.colors.background.includes('rgb(255')));

  const cardBg = isLight 
    ? "rgba(255, 255, 255, 0.95)"
    : theme.colors.surface || "rgba(30, 30, 30, 0.95)";
  
  const textColor = isLight ? "#1a202c" : theme.colors.text;
  const borderColor = theme.colors.border;
  const primaryColor = theme.colors.primary;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isLight 
            ? "rgba(0, 0, 0, 0.3)" 
            : "rgba(0, 0, 0, 0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10000,
          backdropFilter: "blur(8px)",
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            backgroundColor: cardBg,
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "600px",
            width: "90%",
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.3)`,
            border: `1px solid ${borderColor}`,
          }}
        >
          <motion.h2
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: textColor,
              marginBottom: "8px",
              textAlign: "center",
            }}
          >
            🌍 Select Language / Válassz nyelvet / Sprache wählen
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              fontSize: "14px",
              color: isLight ? "#666" : theme.colors.textMuted,
              marginBottom: "24px",
              textAlign: "center",
            }}
          >
            Please select your preferred language / Kérjük, válassza ki az előnyben részesített nyelvet / Bitte wählen Sie Ihre bevorzugte Sprache
          </motion.p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {LANGUAGES.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSelect(lang.code)}
                disabled={selectedLanguage !== null}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: `2px solid ${
                    selectedLanguage === lang.code
                      ? primaryColor
                      : borderColor
                  }`,
                  backgroundColor:
                    selectedLanguage === lang.code
                      ? primaryColor + "20"
                      : isLight
                      ? "rgba(0, 0, 0, 0.03)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: textColor,
                  fontSize: "14px",
                  fontWeight: selectedLanguage === lang.code ? "600" : "500",
                  cursor: selectedLanguage === null ? "pointer" : "default",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                  opacity: selectedLanguage !== null && selectedLanguage !== lang.code ? 0.5 : 1,
                }}
              >
                <span style={{ fontSize: "32px" }}>{lang.flag}</span>
                <span>{lang.name}</span>
              </motion.button>
            ))}
          </div>

          {selectedLanguage && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: "24px",
                textAlign: "center",
                color: isLight ? "#666" : theme.colors.textMuted,
                fontSize: "12px",
              }}
            >
              Loading...
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

