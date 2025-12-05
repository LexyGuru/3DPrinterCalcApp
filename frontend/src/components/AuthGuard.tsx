// AuthGuard - App jelszavas védelem komponens
// Kezeli: indításkori jelszó kérés, inaktivitás után auto-lock

import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Settings } from "../types";
import { PasswordDialog } from "../shared";
import { verifyAppPassword } from "../utils/auth";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";

interface AuthGuardProps {
  settings: Settings;
  children: React.ReactNode;
  theme: Theme;
  // onSettingsChange?: (settings: Settings) => void; // Jelenleg nem használt, de később lehet hasznos
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  settings,
  children,
  theme,
}) => {
  const t = useTranslation(settings.language);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [lastActivityTime, setLastActivityTime] = useState<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Ellenőrizzük, hogy szükséges-e a jelszavas védelem
  const requiresPassword = settings.appPasswordEnabled && settings.appPasswordHash;

  // Aktiválási időzítő frissítése
  const updateActivityTime = useCallback(() => {
    setLastActivityTime(Date.now());
    setPasswordError(null);
  }, []);

  // Felhasználói aktivitás figyelése (egér mozgás, kattintás, billentyűzet)
  useEffect(() => {
    if (!requiresPassword || !isAuthenticated || !settings.autoLockMinutes || settings.autoLockMinutes === 0) {
      return;
    }

    const handleActivity = () => {
      updateActivityTime();
    };

    // Event listener-ek hozzáadása
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity, true);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity, true);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, [requiresPassword, isAuthenticated, settings.autoLockMinutes, updateActivityTime]);

  // Auto-lock ellenőrzése (inaktivitás után)
  useEffect(() => {
    if (!requiresPassword || !isAuthenticated || !settings.autoLockMinutes || settings.autoLockMinutes === 0) {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // Auto-lock időzítő beállítása
    const checkInactivity = () => {
      const now = Date.now();
      const inactivityDuration = (now - lastActivityTime) / 1000 / 60; // percben

      if (inactivityDuration >= settings.autoLockMinutes!) {
        // Auto-lock aktiválása
        setIsAuthenticated(false);
        setShowPasswordDialog(true);
        setPasswordError(null);
      }
    };

    // Ellenőrzés 30 másodpercenként
    inactivityTimerRef.current = setInterval(checkInactivity, 30000);

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [requiresPassword, isAuthenticated, settings.autoLockMinutes, lastActivityTime]);

  // Jelszó ellenőrzése indításkor
  useEffect(() => {
    if (!requiresPassword) {
      setIsAuthenticated(true);
      return;
    }

    // Ha nincs jelszó hash, akkor nincs védelem
    if (!settings.appPasswordHash) {
      setIsAuthenticated(true);
      return;
    }

    // Jelszó kérése indításkor
    setShowPasswordDialog(true);
  }, [requiresPassword, settings.appPasswordHash]);

  // Jelszó ellenőrzése
  const handlePasswordSubmit = async (password: string) => {
    setPasswordError(null);

    try {
      const isValid = await verifyAppPassword(password, settings);

      if (isValid) {
        setIsAuthenticated(true);
        setShowPasswordDialog(false);
        updateActivityTime(); // Aktiválási idő frissítése
      } else {
        setPasswordError(
          (t("auth.incorrectPassword" as any) as string) || "Helytelen jelszó. Kérjük, próbálja újra."
        );
      }
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : (t("auth.passwordVerificationError" as any) as string) || "Hiba a jelszó ellenőrzésekor."
      );
    }
  };

  const handlePasswordCancel = () => {
    // Ha még nincs bejelentkezve, nem zárhatjuk be a dialog-ot
    if (!isAuthenticated) {
      return;
    }
    setShowPasswordDialog(false);
    setPasswordError(null);
  };

  // Ha nincs jelszavas védelem, jelenítsük meg közvetlenül a gyermek komponenseket
  if (!requiresPassword) {
    return <>{children}</>;
  }

  // Ha nincs bejelentkezve, jelszó dialog-ot mutatunk
  if (!isAuthenticated || showPasswordDialog) {
    return (
      <>
        {/* Blur overlay - a háttér elmosása */}
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(5px)",
            zIndex: 9999,
          }}
        />
        <PasswordDialog
          isOpen={showPasswordDialog}
          title={(t("auth.enterPassword" as any) as string) || "Jelszó megadása szükséges"}
          message={
            settings.autoLockMinutes && settings.autoLockMinutes > 0
              ? (t("auth.autoLockMessage" as any, { minutes: settings.autoLockMinutes }) ||
                `Az alkalmazás ${settings.autoLockMinutes} perc inaktivitás után automatikusan zárolva lett.`)
              : ((t("auth.enterPasswordMessage" as any) as string) || "Kérjük, adja meg az alkalmazás jelszavát.")
          }
          onConfirm={handlePasswordSubmit}
          onCancel={isAuthenticated ? handlePasswordCancel : undefined}
          confirmText={(t("auth.unlock" as any) as string) || "Feloldás"}
          cancelText={(t("common.cancel" as any) as string) || "Mégse"}
          showError={!!passwordError}
          errorMessage={passwordError || undefined}
          theme={theme}
          language={settings.language}
        />
        {/* Gyermek komponensek elrejtése (de még rendereljük, hogy ne törjön el) */}
        <div style={{ opacity: 0, pointerEvents: "none", position: "fixed", zIndex: -1 }}>
          {children}
        </div>
      </>
    );
  }

  // Ha be van jelentkezve, jelenítsük meg a gyermek komponenseket
  return <>{children}</>;
};

