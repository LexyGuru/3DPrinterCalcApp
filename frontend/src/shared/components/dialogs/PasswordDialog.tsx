// PasswordDialog - Újrafelhasználható jelszó dialog komponens
// Használható: app jelszavas védelem, ügyféladat titkosítás jelszó kérésekor

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Theme } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import type { LanguageCode } from "../../../types";

interface PasswordDialogProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onConfirm: (password: string) => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  showError?: boolean;
  errorMessage?: string;
  theme: Theme;
  isNewPassword?: boolean; // Ha true, akkor új jelszó beállítása (két mező: jelszó + megerősítés)
  confirmPasswordLabel?: string;
  minLength?: number;
  language?: LanguageCode; // Nyelv a fordításokhoz
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  showError = false,
  errorMessage,
  theme,
  isNewPassword = false,
  confirmPasswordLabel,
  minLength = 4,
  language = "hu",
}) => {
  const t = useTranslation(language);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus az input mezőre amikor megnyílik
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Reset amikor bezáródik
  useEffect(() => {
    if (!isOpen) {
      setPassword("");
      setConfirmPassword("");
      setLocalError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validáció
    if (!password || password.length < minLength) {
      setLocalError(t("auth.passwordMinLength" as any, { minLength }) || `A jelszónak legalább ${minLength} karakternek kell lennie`);
      return;
    }

    if (isNewPassword) {
      if (!confirmPassword) {
        setLocalError(t("auth.confirmPasswordRequired" as any) || "Kérjük, erősítse meg a jelszót");
        return;
      }

      if (password !== confirmPassword) {
        setLocalError(t("auth.passwordsDoNotMatch" as any) || "A jelszavak nem egyeznek");
        return;
      }
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(password);
      // Sikeres submit után reset
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : "Ismeretlen hiba");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPassword("");
    setConfirmPassword("");
    setLocalError(null);
    onCancel?.();
  };

  const displayError = localError || (showError ? errorMessage : null);

  const isGradientBackground = theme?.colors.background?.includes("gradient");
  const dialogBg = isGradientBackground
    ? "rgba(255, 255, 255, 0.98)"
    : theme?.colors.surface || "#fff";
  const dialogTextColor = isGradientBackground
    ? "#1a202c"
    : theme?.colors.text || "#212529";
  const dialogTextMuted = isGradientBackground
    ? "#4a5568"
    : theme?.colors.textMuted || "#495057";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="password-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
            backdropFilter: isGradientBackground ? "blur(5px)" : "none",
          }}
          onClick={handleCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={{
              backgroundColor: dialogBg,
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "500px",
              width: "calc(90% - 48px)",
              minWidth: "320px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxSizing: "border-box",
              boxShadow: isGradientBackground
                ? "0 8px 32px rgba(0,0,0,0.2), 0 2px 8px rgba(0,0,0,0.1)"
                : "0 4px 20px rgba(0,0,0,0.3)",
              border: isGradientBackground
                ? `1px solid ${theme?.colors.border || "rgba(0,0,0,0.1)"}`
                : "none",
              backdropFilter: isGradientBackground ? "blur(20px)" : "none",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                color: dialogTextColor,
                fontSize: "20px",
                fontWeight: "700",
              }}
            >
              {title}
            </h3>

            {message && (
              <p
                style={{
                  margin: "0 0 20px 0",
                  color: dialogTextMuted,
                  fontSize: "14px",
                  lineHeight: "1.6",
                }}
              >
                {message}
              </p>
            )}

            <form onSubmit={handleSubmit} style={{ width: "100%", boxSizing: "border-box" }}>
              <div style={{ marginBottom: isNewPassword ? "16px" : "20px", width: "100%", boxSizing: "border-box" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: dialogTextColor,
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  {t("auth.password" as any) || "Jelszó"}
                </label>
                <input
                  ref={inputRef}
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLocalError(null);
                  }}
                  disabled={isSubmitting}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: `1px solid ${displayError ? theme?.colors.danger || "#dc3545" : theme?.colors.border || "#ced4da"}`,
                    backgroundColor: theme?.colors.background || "#fff",
                    color: dialogTextColor,
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  placeholder={isNewPassword ? (t("auth.passwordMinLengthPlaceholder" as any, { minLength }) || `Minimum ${minLength} karakter`) : (t("auth.enterPasswordPlaceholder" as any) || "Adja meg a jelszót")}
                  autoComplete={isNewPassword ? "new-password" : "current-password"}
                />
              </div>

              {isNewPassword && (
                <div style={{ marginBottom: "20px", width: "100%", boxSizing: "border-box" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      color: dialogTextColor,
                      fontSize: "14px",
                      fontWeight: "600",
                    }}
                  >
                    {confirmPasswordLabel || (t("auth.confirmPassword" as any) || "Jelszó megerősítése")}
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError(null);
                    }}
                    disabled={isSubmitting}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: `1px solid ${displayError ? theme?.colors.danger || "#dc3545" : theme?.colors.border || "#ced4da"}`,
                      backgroundColor: theme?.colors.background || "#fff",
                      color: dialogTextColor,
                      fontSize: "14px",
                      outline: "none",
                      transition: "border-color 0.2s",
                      boxSizing: "border-box",
                    }}
                    placeholder={t("auth.confirmPasswordPlaceholder" as any) || "Erősítse meg a jelszót"}
                    autoComplete="new-password"
                  />
                </div>
              )}

              {displayError && (
                <div
                  style={{
                    marginBottom: "20px",
                    padding: "12px",
                    borderRadius: "8px",
                    backgroundColor: `${theme?.colors.danger || "#dc3545"}20`,
                    border: `1px solid ${theme?.colors.danger || "#dc3545"}`,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      color: theme?.colors.danger || "#dc3545",
                      fontSize: "13px",
                      lineHeight: "1.5",
                    }}
                  >
                    {displayError}
                  </p>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                {onCancel && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    style={{
                      padding: "10px 20px",
                      borderRadius: "8px",
                      border: `1px solid ${theme?.colors.border || "#ced4da"}`,
                      backgroundColor: theme?.colors.surface || "#fff",
                      color: dialogTextColor,
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      opacity: isSubmitting ? 0.6 : 1,
                    }}
                  >
                    {cancelText || (t("common.cancel" as any) || "Mégse")}
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !password || (isNewPassword && !confirmPassword)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: "8px",
                    border: "none",
                    backgroundColor:
                      isSubmitting || !password || (isNewPassword && !confirmPassword)
                        ? theme?.colors.textMuted || "#6c757d"
                        : theme?.colors.primary || "#007bff",
                    color: "#fff",
                    cursor:
                      isSubmitting || !password || (isNewPassword && !confirmPassword)
                        ? "not-allowed"
                        : "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    opacity:
                      isSubmitting || !password || (isNewPassword && !confirmPassword)
                        ? 0.6
                        : 1,
                  }}
                >
                  {isSubmitting ? (t("common.processing" as any) || "Feldolgozás...") : (confirmText || (t("common.ok" as any) || "OK"))}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

