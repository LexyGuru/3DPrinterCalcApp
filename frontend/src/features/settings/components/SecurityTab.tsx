import React, { useState, useEffect } from "react";
import type { Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { auditSettingsChange } from "../../../utils/auditLog";
import { PasswordDialog, ConfirmDialog } from "../../../shared";
import { setAppPassword, clearAppPassword } from "../../../utils/auth";
import { setEncryptionPassword } from "../../../utils/customerEncryption";
import { loadCustomers, saveCustomers, saveSettings } from "../../../utils/store";
import { setEncryptionPasswordInMemory, getEncryptionPassword, getAppPasswordInMemory, setAppPasswordInMemory } from "../../../utils/encryptionPasswordManager";

interface SecurityTabProps {
  settings: Settings;
  onChange: (newSettings: Settings) => void;
  theme: Theme;
  themeStyles: ReturnType<typeof getThemeStyles>;
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  settings,
  onChange,
  theme,
  themeStyles,
  showToast,
}) => {
  const t = useTranslation(settings.language);
  
  // Jelszavas védelem state-ek
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showClearPasswordConfirm, setShowClearPasswordConfirm] = useState(false);
  const [autoLockMinutesValue, setAutoLockMinutesValue] = useState<number>(settings.autoLockMinutes || 0);
  const [isSavingAutoLock, setIsSavingAutoLock] = useState(false);
  
  // Ügyféladat titkosítás state-ek
  const [showEncryptionPasswordDialog, setShowEncryptionPasswordDialog] = useState(false);
  const [showChangeEncryptionPasswordDialog, setShowChangeEncryptionPasswordDialog] = useState(false);
  const [showDisableEncryptionConfirm, setShowDisableEncryptionConfirm] = useState(false);
  const [showDisableEncryptionPasswordDialog, setShowDisableEncryptionPasswordDialog] = useState(false);
  const [showEnableEncryptionModal, setShowEnableEncryptionModal] = useState(false);
  const [tempUseAppPassword, setTempUseAppPassword] = useState(false);
  const [tempEncryptionPassword, setTempEncryptionPassword] = useState("");
  const [useAppPasswordForEncryption, setUseAppPasswordForEncryption] = useState<boolean>(
    settings.useAppPasswordForEncryption ?? false
  );

  // Auto-lock érték szinkronizálása a settings-szel
  useEffect(() => {
    setAutoLockMinutesValue(settings.autoLockMinutes || 0);
  }, [settings.autoLockMinutes]);

  // useAppPasswordForEncryption szinkronizálása
  useEffect(() => {
    setUseAppPasswordForEncryption(settings.useAppPasswordForEncryption ?? false);
  }, [settings.useAppPasswordForEncryption]);

  // Jelszavas védelem handler függvények
  const handleSetPassword = async (password: string) => {
    try {
      setPasswordError(null);
      const passwordSetLogMessage = t("auth.passwordSettingStart" as any) || "🔒 Jelszó beállítása...";
      console.log(passwordSetLogMessage);
      
      const updatedSettings = await setAppPassword(password, settings);
      onChange(updatedSettings);
      setShowPasswordDialog(false);
      
      const passwordSetSuccessMessage = t("auth.passwordSetSuccess" as any) || "✅ Jelszó sikeresen beállítva";
      console.log(passwordSetSuccessMessage);
      
      showToast(
        t("auth.passwordSetSuccess" as any) || "Jelszó sikeresen beállítva",
        "success"
      );
      try {
        await auditSettingsChange("appPassword", undefined, true, {
          enabled: true,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("auth.passwordSetError" as any) || "Hiba a jelszó beállításakor";
      
      const passwordSetErrorMessage = t("auth.passwordSetError" as any) || "❌ Hiba a jelszó beállításakor:";
      console.error(passwordSetErrorMessage, errorMessage);
      
      setPasswordError(errorMessage);
      throw error;
    }
  };

  const handleChangePassword = async (newPassword: string) => {
    try {
      setPasswordError(null);
      const passwordChangeLogMessage = t("auth.passwordChangingStart" as any) || "🔒 Jelszó módosítása...";
      console.log(passwordChangeLogMessage);
      
      // Ha van titkosítás és az app jelszót használjuk, akkor újratitkosítjuk az adatokat
      if (settings.encryptionEnabled && settings.useAppPasswordForEncryption && settings.encryptedCustomerData) {
        const oldPassword = getAppPasswordInMemory();
        if (oldPassword) {
          try {
            // Visszafejtés régi jelszóval
            const decryptedCustomers = await loadCustomers(oldPassword);
            // Újratitkosítás új jelszóval
            await saveCustomers(decryptedCustomers, newPassword);
            // Frissítjük a memóriában tárolt app jelszót
            setAppPasswordInMemory(newPassword);
          } catch (error) {
            console.error("❌ Hiba az adatok újratitkosításakor:", error);
            // Folytatjuk a jelszó változtatást, de figyelmeztetünk
            showToast(
              t("encryption.reEncryptWarning" as any) || "⚠️ Figyelem: Az adatok újratitkosítása nem sikerült. Kérjük, ellenőrizze a jelszót.",
              "error"
            );
          }
        }
      }
      
      const updatedSettings = await setAppPassword(newPassword, settings);
      onChange(updatedSettings);
      setShowChangePasswordDialog(false);
      
      const passwordChangedMessage = t("auth.passwordChangedSuccess" as any) || "✅ Jelszó sikeresen módosítva";
      console.log(passwordChangedMessage);
      
      showToast(
        t("auth.passwordChangedSuccess" as any) || "Jelszó sikeresen módosítva",
        "success"
      );
      try {
        await auditSettingsChange("appPassword", true, true, {
          changed: true,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("auth.passwordChangeError" as any) || "Hiba a jelszó módosításakor";
      
      const passwordChangeErrorMessage = t("auth.passwordChangeError" as any) || "❌ Hiba a jelszó módosításakor:";
      console.error(passwordChangeErrorMessage, errorMessage);
      
      setPasswordError(errorMessage);
      throw error;
    }
  };

  const handleClearPassword = async () => {
    try {
      const passwordClearLogMessage = t("auth.passwordClearingStart" as any) || "🔒 Jelszavas védelem eltávolítása...";
      console.log(passwordClearLogMessage);
      
      const updatedSettings = await clearAppPassword(settings);
      onChange(updatedSettings);
      
      const passwordClearedMessage = t("auth.passwordClearedSuccess" as any) || "✅ Jelszavas védelem sikeresen eltávolítva";
      console.log(passwordClearedMessage);
      
      showToast(
        t("auth.passwordClearedSuccess" as any) || "Jelszavas védelem sikeresen kikapcsolva",
        "success"
      );
      try {
        await auditSettingsChange("appPassword", true, false, {
          enabled: false,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("auth.passwordClearError" as any) || "Hiba a jelszó törlésekor";
      
      const passwordClearErrorMessage = t("auth.passwordClearError" as any) || "❌ Hiba a jelszó törlésekor:";
      console.error(passwordClearErrorMessage, errorMessage);
      
      showToast(errorMessage, "error");
    }
  };

  const handleSaveAutoLock = async () => {
    if (autoLockMinutesValue === (settings.autoLockMinutes || 0)) {
      return;
    }

    setIsSavingAutoLock(true);
    try {
      const autoLockLogMessage = t("auth.autoLockSettingStart" as any, { minutes: autoLockMinutesValue }) || `🔒 Auto-lock beállítása: ${autoLockMinutesValue} perc`;
      console.log(autoLockLogMessage);
      
      const updatedSettings = {
        ...settings,
        autoLockMinutes: autoLockMinutesValue,
      };
      onChange(updatedSettings);
      await auditSettingsChange("autoLockMinutes", settings.autoLockMinutes || 0, autoLockMinutesValue, {
        autoLockMinutes: autoLockMinutesValue,
      });
      
      const autoLockSavedMessage = t("auth.autoLockSaved" as any) || `✅ Auto-lock beállítás mentve: ${autoLockMinutesValue} perc`;
      console.log(autoLockSavedMessage);
      
      showToast(
        t("auth.autoLockSaved" as any) || "Auto-lock beállítás mentve",
        "success"
      );
    } catch (error) {
      const errorMessage = t("auth.autoLockSaveError" as any) || "Hiba az auto-lock mentésekor";
      
      const autoLockErrorMsg = t("auth.autoLockSaveError" as any) || "❌ Hiba az auto-lock mentésekor:";
      console.error(autoLockErrorMsg, error);
      
      showToast(errorMessage, "error");
    } finally {
      setIsSavingAutoLock(false);
    }
  };

  // Ügyféladat titkosítás handler függvények
  const handleEnableEncryption = async (password?: string, useAppPassword: boolean = false) => {
    try {
      setPasswordError(null);
      const encryptionEnableLogMessage = t("encryption.enableStart" as any) || "🔒 Ügyféladat titkosítás bekapcsolása...";
      console.log(encryptionEnableLogMessage);
      
      // Jelszó hash generálása (csak akkor, ha nem használjuk az app jelszót)
      let hash: string | null = null;
      const shouldUseAppPassword = useAppPassword || (useAppPasswordForEncryption && settings.appPasswordEnabled && settings.appPasswordHash);
      if (!shouldUseAppPassword) {
        if (!password) {
          throw new Error("Külön titkosítási jelszó szükséges.");
        }
        hash = await setEncryptionPassword(password);
        // Memóriában elmentjük a plain jelszót
        setEncryptionPasswordInMemory(password);
      } else {
        // Ha az app jelszót használjuk, akkor nincs külön encryption password hash
        // De elmentjük a memóriába az app jelszót (ha nincs még benne)
        const appPassword = getAppPasswordInMemory();
        if (!appPassword) {
          throw new Error("App jelszó nincs megadva. Kérjük, először állítsa be az app jelszavas védelmet és jelentkezzen be.");
        }
      }
      
      // Meglévő customer adatok betöltése és titkosított mentése
      const passwordToUse = shouldUseAppPassword
        ? getAppPasswordInMemory()
        : (password || null);

      if (!passwordToUse) {
        throw new Error("Nincs elérhető jelszó a titkosításhoz.");
      }

      // Betöltjük a meglévő customer adatokat (nincs jelszó, mert még nincs titkosítás)
      const existingCustomers = await loadCustomers(null);
      
      if (import.meta.env.DEV) {
        console.log("📥 Meglévő ügyfelek betöltve titkosításhoz:", { count: existingCustomers.length });
      }
      
      // Titkosított mentés
      await saveCustomers(existingCustomers, passwordToUse);
      
      // Settings frissítése
      const updatedSettings: Settings = {
        ...settings,
        encryptionEnabled: true,
        encryptionPassword: hash, // null, ha shouldUseAppPassword = true
        encryptedCustomerData: true,
        useAppPasswordForEncryption: shouldUseAppPassword ? true : false,
      };
      onChange(updatedSettings);
      // Azonnal mentjük a settings-et
      try {
        await saveSettings(updatedSettings);
        if (import.meta.env.DEV) {
          console.log("✅ Settings mentve (titkosítás bekapcsolva)");
        }
      } catch (error) {
        console.error("❌ Hiba a settings mentésekor (titkosítás bekapcsolva):", error);
      }
      // Modal bezárása (ha van nyitva)
      setShowEncryptionPasswordDialog(false);
      setShowEnableEncryptionModal(false);
      
      const encryptionEnabledMessage = t("encryption.enabledSuccess" as any) || "✅ Ügyféladat titkosítás sikeresen bekapcsolva";
      console.log(encryptionEnabledMessage);
      
      showToast(
        t("encryption.enabledSuccess" as any) || "Ügyféladat titkosítás sikeresen bekapcsolva",
        "success"
      );
      
      try {
        await auditSettingsChange("encryptionEnabled", false, true, {
          enabled: true,
          useAppPassword: useAppPasswordForEncryption,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("encryption.enableError" as any) || "Hiba a titkosítás bekapcsolásakor";
      
      const encryptionErrorMsg = t("encryption.enableError" as any) || "❌ Hiba a titkosítás bekapcsolásakor:";
      console.error(encryptionErrorMsg, errorMessage);
      
      setPasswordError(errorMessage);
      throw error;
    }
  };

  const handleDisableEncryption = async (password?: string | null) => {
    try {
      const encryptionDisableLogMessage = t("encryption.disableStart" as any) || "🔓 Ügyféladat titkosítás kikapcsolása...";
      console.log(encryptionDisableLogMessage);
      
      // Ha van titkosított adat, visszafejtjük és plain textként mentjük
      if (settings.encryptedCustomerData) {
        // Jelszó meghatározása:
        // 1. Ha van password paraméter (felhasználó dialógusban adta meg), azt használjuk
        // 2. Ha nincs password paraméter, akkor memóriából próbáljuk betölteni
        let passwordToUse: string | null | undefined = undefined;
        
        if (password) {
          // A felhasználó megadta a jelszót a dialógusban - ezt használjuk
          passwordToUse = password;
          if (import.meta.env.DEV) {
            console.log("🔑 Jelszó használata a dialógusból a visszafejtéshez");
          }
        } else {
          // Nincs password paraméter, próbáljuk memóriából betölteni
          passwordToUse = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
          if (import.meta.env.DEV) {
            console.log("🔑 Jelszó betöltése memóriából:", { 
              useAppPassword: settings.useAppPasswordForEncryption ?? false,
              hasPassword: !!passwordToUse 
            });
          }
        }
        
        if (!passwordToUse) {
          // Nincs jelszó memóriában, kérjük a jelszót
          setShowDisableEncryptionConfirm(false);
          setShowDisableEncryptionPasswordDialog(true);
          return;
        }
        
        try {
          if (import.meta.env.DEV) {
            console.log("🔓 Ügyfelek visszafejtése a titkosítás kikapcsolásához...");
          }
          const decryptedCustomers = await loadCustomers(passwordToUse);
          if (import.meta.env.DEV) {
            console.log("✅ Ügyfelek visszafejtve:", { count: decryptedCustomers.length });
          }
          await saveCustomers(decryptedCustomers, null); // Plain text mentés
          if (import.meta.env.DEV) {
            console.log("✅ Ügyfelek visszafejtve és plain textként mentve");
          }
        } catch (error) {
          console.error("❌ Hiba az adatok visszafejtésekor:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          
          // Részletes hibaüzenet
          let userErrorMessage = t("encryption.decryptError" as any) || "Hiba az adatok visszafejtésekor. Az adatok titkosítva maradnak.";
          if (errorMessage.includes("Helytelen") || errorMessage.includes("titkosítási jelszó")) {
            userErrorMessage = t("encryption.wrongPassword" as any) || "Helytelen jelszó. Kérjük, próbálja újra.";
          } else if (errorMessage.includes("aead::Error") || errorMessage.includes("Visszafejtési hiba")) {
            userErrorMessage = t("encryption.decryptFailed" as any) || "Nem sikerült visszafejteni az adatokat. Lehet, hogy rossz a jelszó, vagy az adatok sérültek.";
          }
          
          showToast(userErrorMessage, "error");
          setShowDisableEncryptionPasswordDialog(true); // Maradjon nyitva, hogy újra megpróbálhassa
          return;
        }
      }
      
      // Memória törlése
      setEncryptionPasswordInMemory(null);
      setShowDisableEncryptionPasswordDialog(false);
      
      // Settings frissítése
      const updatedSettings = {
        ...settings,
        encryptionEnabled: false,
        encryptionPassword: null,
        encryptedCustomerData: false,
        useAppPasswordForEncryption: false,
      };
      onChange(updatedSettings);
      // Azonnal mentjük a settings-et
      try {
        await saveSettings(updatedSettings);
        if (import.meta.env.DEV) {
          console.log("✅ Settings mentve (titkosítás kikapcsolva)");
        }
      } catch (error) {
        console.error("❌ Hiba a settings mentésekor (titkosítás kikapcsolva):", error);
      }
      setShowDisableEncryptionConfirm(false);
      
      const encryptionDisabledMessage = t("encryption.disabledSuccess" as any) || "✅ Ügyféladat titkosítás sikeresen kikapcsolva";
      console.log(encryptionDisabledMessage);
      
      showToast(
        t("encryption.disabledSuccess" as any) || "Ügyféladat titkosítás sikeresen kikapcsolva",
        "success"
      );
      
      try {
        await auditSettingsChange("encryptionEnabled", true, false, {
          enabled: false,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("encryption.disableError" as any) || "Hiba a titkosítás kikapcsolásakor";
      
      const encryptionDisableErrorMessage = t("encryption.disableError" as any) || "❌ Hiba a titkosítás kikapcsolásakor:";
      console.error(encryptionDisableErrorMessage, errorMessage);
      
      showToast(errorMessage, "error");
      setShowDisableEncryptionPasswordDialog(false);
    }
  };

  const handleChangeEncryptionPassword = async (newPassword: string) => {
    try {
      setPasswordError(null);
      const encryptionChangeLogMessage = t("encryption.changePasswordStart" as any) || "🔒 Titkosítási jelszó módosítása...";
      console.log(encryptionChangeLogMessage);
      
      // Új jelszó hash generálása (csak akkor, ha nem használjuk az app jelszót)
      let newHash: string | null = null;
      if (!useAppPasswordForEncryption) {
        newHash = await setEncryptionPassword(newPassword);
        // Memória frissítése
        setEncryptionPasswordInMemory(newPassword);
      }
      
      // Ha van titkosított adat, újratitkosítjuk az adatokat
      if (settings.encryptedCustomerData) {
        const oldPassword = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
        if (oldPassword) {
          try {
            // Visszafejtés régi jelszóval
            const decryptedCustomers = await loadCustomers(oldPassword);
            // Újratitkosítás új jelszóval
            const newPasswordToUse = useAppPasswordForEncryption 
              ? getAppPasswordInMemory() 
              : newPassword;
            if (!newPasswordToUse) {
              throw new Error("Nincs elérhető új jelszó.");
            }
            await saveCustomers(decryptedCustomers, newPasswordToUse);
          } catch (error) {
            console.error("❌ Hiba az adatok újratitkosításakor:", error);
            throw new Error("Hiba az adatok újratitkosításakor. A jelszó nem módosult.");
          }
        }
      }
      
      // Settings frissítése
      const updatedSettings = {
        ...settings,
        encryptionPassword: newHash, // null, ha useAppPasswordForEncryption = true
        useAppPasswordForEncryption,
      };
      onChange(updatedSettings);
      // Azonnal mentjük a settings-et
      try {
        await saveSettings(updatedSettings);
        if (import.meta.env.DEV) {
          console.log("✅ Settings mentve (titkosítási jelszó módosítva)");
        }
      } catch (error) {
        console.error("❌ Hiba a settings mentésekor (titkosítási jelszó módosítva):", error);
      }
      setShowChangeEncryptionPasswordDialog(false);
      
      const encryptionPasswordChangedMessage = t("encryption.passwordChangedSuccess" as any) || "✅ Titkosítási jelszó sikeresen módosítva";
      console.log(encryptionPasswordChangedMessage);
      
      showToast(
        t("encryption.passwordChangedSuccess" as any) || "Titkosítási jelszó sikeresen módosítva",
        "success"
      );
      
      try {
        await auditSettingsChange("encryptionPassword", true, true, {
          changed: true,
        });
      } catch (error) {
        const auditErrorMsg = t("console.auditLogError" as any) || "Audit log hiba:";
        console.error(auditErrorMsg, error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("encryption.changePasswordError" as any) || "Hiba a titkosítási jelszó módosításakor";
      
      const encryptionChangePasswordErrorMessage = t("encryption.changePasswordError" as any) || "❌ Hiba a titkosítási jelszó módosításakor:";
      console.error(encryptionChangePasswordErrorMessage, errorMessage);
      
      setPasswordError(errorMessage);
      throw error;
    }
  };

  return (
    <>
      {/* Jelszavas védelem */}
      <div style={{ marginBottom: "24px" }}>
        <Tooltip content={
          settings.language === "hu"
            ? "Az alkalmazás jelszavas védelme. Az alkalmazás indításakor és inaktivitás után jelszó kérés."
            : settings.language === "de"
            ? "Passwortschutz für die Anwendung. Passwortanfrage beim Starten und nach Inaktivität."
            : "Application password protection. Password required on startup and after inactivity."
        }>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.appPasswordEnabled === true}
              onChange={async (e) => {
                const checked = e.target.checked;
                if (checked && !settings.appPasswordHash) {
                  // Ha bekapcsoljuk, de nincs jelszó, akkor megnyitjuk a jelszó dialog-ot
                  setShowPasswordDialog(true);
                } else if (!checked) {
                  // Ha kikapcsoljuk, akkor töröljük a jelszót is
                  await handleClearPassword();
                }
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔒 {t("auth.passwordProtection" as any) || "Jelszavas védelem"}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("auth.passwordProtectionDescription" as any) || "Az alkalmazás indításakor és inaktivitás után jelszó kérése."}
        </p>
        
        {settings.appPasswordEnabled && (
          <div style={{ marginTop: "16px", marginLeft: "32px" }}>
            {/* Auto-lock beállítások */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "600", color: theme.colors.text }}>
                {t("auth.autoLockMinutes" as any) || "Auto-lock időtartama (perc):"}
              </label>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <input
                  type="number"
                  min="0"
                  max="60"
                  step="5"
                  value={autoLockMinutesValue}
                  onChange={(e) => {
                    const minutes = Math.max(0, Math.min(60, Number(e.target.value) || 0));
                    setAutoLockMinutesValue(minutes);
                  }}
                  style={{
                    width: "120px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.text,
                    fontSize: "14px",
                  }}
                />
                <button
                  onClick={handleSaveAutoLock}
                  disabled={isSavingAutoLock || autoLockMinutesValue === (settings.autoLockMinutes || 0)}
                  style={{
                    ...themeStyles.button,
                    padding: "8px 16px",
                    fontSize: "14px",
                    opacity: (isSavingAutoLock || autoLockMinutesValue === (settings.autoLockMinutes || 0)) ? 0.6 : 1,
                    cursor: (isSavingAutoLock || autoLockMinutesValue === (settings.autoLockMinutes || 0)) ? "not-allowed" : "pointer",
                  }}
                >
                  {isSavingAutoLock 
                    ? (t("common.processing" as any) || "Feldolgozás...")
                    : (t("common.save" as any) || "💾 Mentés")}
                </button>
              </div>
              <p style={{ marginTop: "4px", fontSize: "12px", color: theme.colors.textMuted }}>
                {autoLockMinutesValue === 0
                  ? (t("auth.autoLockDisabled" as any) || "Auto-lock kikapcsolva (csak indításkor kér jelszót)")
                  : (t("auth.autoLockEnabled" as any, { minutes: autoLockMinutesValue }) || `Az alkalmazás ${autoLockMinutesValue} perc inaktivitás után automatikusan zárolva lesz.`)}
              </p>
            </div>

            {/* Jelszó kezelő gombok */}
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              {settings.appPasswordHash ? (
                <>
                  <button
                    onClick={() => setShowChangePasswordDialog(true)}
                    style={{
                      ...themeStyles.button,
                      flex: 1,
                      minWidth: "180px",
                    }}
                  >
                    🔑 {t("auth.changePassword" as any) || "Jelszó módosítása"}
                  </button>
                  <button
                    onClick={() => setShowClearPasswordConfirm(true)}
                    style={{
                      ...themeStyles.button,
                      ...themeStyles.buttonDanger,
                      flex: 1,
                      minWidth: "180px",
                    }}
                  >
                    🗑️ {t("auth.removePassword" as any) || "Jelszó eltávolítása"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowPasswordDialog(true)}
                  style={{
                    ...themeStyles.button,
                    flex: 1,
                    minWidth: "180px",
                  }}
                >
                  🔑 {t("auth.setPassword" as any) || "Jelszó beállítása"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ügyféladat titkosítás */}
      <div style={{ marginTop: "32px", marginBottom: "24px", paddingTop: "24px", borderTop: `1px solid ${theme.colors.border}` }}>
        <Tooltip content={
          settings.language === "hu"
            ? "Az ügyféladatok (név, kapcsolattartási információk, megjegyzések) titkosítása az adatbázisban. Titkosított adatok esetén jelszó szükséges a betöltéshez és mentéshez."
            : settings.language === "de"
            ? "Verschlüsselung der Kundendaten (Name, Kontaktinformationen, Notizen) in der Datenbank. Bei verschlüsselten Daten ist ein Passwort zum Laden und Speichern erforderlich."
            : "Encryption of customer data (name, contact information, notes) in the database. Encrypted data requires a password for loading and saving."
        }>
          <label style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            fontWeight: "600", 
            fontSize: "16px", 
            color: theme.colors.background?.includes('gradient') ? "#1a202c" : theme.colors.text, 
            cursor: "pointer" 
          }}>
            <input
              type="checkbox"
              checked={settings.encryptionEnabled === true}
              onChange={async (e) => {
                const checked = e.target.checked;
                if (checked) {
                  // Ha bekapcsoljuk, akkor megnyitjuk a modal ablakot
                  setTempUseAppPassword(false);
                  setTempEncryptionPassword("");
                  setShowEnableEncryptionModal(true);
                } else {
                  // Ha kikapcsoljuk, akkor megerősítést kérünk
                  setShowDisableEncryptionConfirm(true);
                }
              }}
              style={{ width: "20px", height: "20px", cursor: "pointer" }}
            />
            <span>🔐 {t("encryption.customerDataEncryption" as any) || "Ügyféladat titkosítás"}</span>
          </label>
        </Tooltip>
        <p style={{ marginTop: "8px", marginLeft: "32px", fontSize: "12px", color: theme.colors.textMuted }}>
          {t("encryption.customerDataEncryptionDescription" as any) || "Az ügyféladatok titkosított tárolása. Titkosított adatok esetén jelszó szükséges."}
        </p>
        
        {settings.encryptionEnabled && (
          <div style={{ marginTop: "16px", marginLeft: "32px" }}>
            {/* App jelszó használata opció */}
            {settings.appPasswordEnabled && settings.appPasswordHash && (
              <div style={{ marginBottom: "16px", padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  fontWeight: "500", 
                  fontSize: "14px", 
                  color: theme.colors.text, 
                  cursor: "pointer" 
                }}>
                  <input
                    type="checkbox"
                    checked={useAppPasswordForEncryption}
                    onChange={async (e) => {
                      const checked = e.target.checked;
                      if (checked) {
                        // Ha bekapcsoljuk, akkor az app jelszót használjuk
                        // Nincs szükség külön jelszó megadására
                        setUseAppPasswordForEncryption(true);
                        const updatedSettings = {
                          ...settings,
                          useAppPasswordForEncryption: true,
                          encryptionPassword: null, // Nincs külön jelszó hash
                        };
                        onChange(updatedSettings);
                      } else {
                        // Ha kikapcsoljuk, akkor külön jelszót kell megadni
                        setUseAppPasswordForEncryption(false);
                        // Ha már van titkosított adat, akkor újra kell titkosítani külön jelszóval
                        if (settings.encryptedCustomerData) {
                          setShowChangeEncryptionPasswordDialog(true);
                        } else {
                          const updatedSettings = {
                            ...settings,
                            useAppPasswordForEncryption: false,
                          };
                          onChange(updatedSettings);
                        }
                      }
                    }}
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span>
                    {t("encryption.useAppPassword" as any) || "🔑 Ugyanazt a jelszót használd, mint az app jelszavas védelemhez"}
                  </span>
                </label>
                <p style={{ marginTop: "4px", marginLeft: "30px", fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("encryption.useAppPasswordDescription" as any) || "Ha be van pipálva, akkor az app jelszavas védelem jelszavát használja a titkosításhoz is. Nincs szükség külön jelszóra."}
                </p>
              </div>
            )}

            <div style={{ marginBottom: "12px", padding: "12px", backgroundColor: theme.colors.surface, borderRadius: "8px", border: `1px solid ${theme.colors.border}` }}>
              <p style={{ margin: 0, fontSize: "13px", color: theme.colors.text, fontWeight: "500" }}>
                {settings.encryptedCustomerData
                  ? (t("encryption.dataEncrypted" as any) || "✅ Ügyféladatok titkosítva vannak")
                  : (t("encryption.dataNotEncrypted" as any) || "⚠️ Ügyféladatok még nincsenek titkosítva")}
              </p>
              {useAppPasswordForEncryption && (
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: theme.colors.textMuted }}>
                  {t("encryption.usingAppPassword" as any) || "ℹ️ Az app jelszavas védelem jelszava használatos"}
                </p>
              )}
            </div>

            {/* Titkosítási jelszó kezelő gombok */}
            {!useAppPasswordForEncryption && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {settings.encryptionPassword ? (
                  <>
                    <button
                      onClick={() => setShowChangeEncryptionPasswordDialog(true)}
                      style={{
                        ...themeStyles.button,
                        flex: 1,
                        minWidth: "180px",
                      }}
                    >
                      🔑 {t("encryption.changePassword" as any) || "Titkosítási jelszó módosítása"}
                    </button>
                    <button
                      onClick={() => setShowDisableEncryptionConfirm(true)}
                      style={{
                        ...themeStyles.button,
                        ...themeStyles.buttonDanger,
                        flex: 1,
                        minWidth: "180px",
                      }}
                    >
                      🔓 {t("encryption.disableEncryption" as any) || "Titkosítás kikapcsolása"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowEncryptionPasswordDialog(true)}
                    style={{
                      ...themeStyles.button,
                      flex: 1,
                      minWidth: "180px",
                    }}
                  >
                    🔑 {t("encryption.setPassword" as any) || "Titkosítási jelszó beállítása"}
                  </button>
                )}
              </div>
            )}
            
            {useAppPasswordForEncryption && (
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  onClick={() => setShowDisableEncryptionConfirm(true)}
                  style={{
                    ...themeStyles.button,
                    ...themeStyles.buttonDanger,
                    flex: 1,
                    minWidth: "180px",
                  }}
                >
                  🔓 {t("encryption.disableEncryption" as any) || "Titkosítás kikapcsolása"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enable Encryption Modal */}
      <ConfirmDialog
        isOpen={showEnableEncryptionModal}
        title={t("encryption.enableEncryption" as any) || "🔐 Ügyféladat titkosítás bekapcsolása"}
        message=""
        onConfirm={async () => {
          try {
            // Validáció
            if (!tempUseAppPassword && !tempEncryptionPassword) {
              showToast(
                t("encryption.passwordRequired" as any) || "Jelszó szükséges a titkosításhoz.",
                "error"
              );
              return;
            }
            if (!tempUseAppPassword && tempEncryptionPassword.length < 4) {
              showToast(
                t("encryption.passwordTooShort" as any) || "A jelszónak legalább 4 karakternek kell lennie.",
                "error"
              );
              return;
            }
            
            // Ha app jelszót használunk, ellenőrizzük hogy van-e memóriában
            if (tempUseAppPassword) {
              const appPassword = getAppPasswordInMemory();
              if (!appPassword) {
                showToast(
                  t("encryption.appPasswordRequired" as any) || "App jelszó nincs memóriában. Kérjük, jelentkezzen be először.",
                  "error"
                );
                return;
              }
            }
            
            // Titkosítás bekapcsolása
            await handleEnableEncryption(tempUseAppPassword ? "" : tempEncryptionPassword, tempUseAppPassword);
            
            // Modal bezárása csak sikeres esetben
            setShowEnableEncryptionModal(false);
            setTempUseAppPassword(false);
            setTempEncryptionPassword("");
          } catch (error) {
            // Hiba esetén a modal nyitva marad, hogy a felhasználó újra próbálhasson
            // A hiba üzenet már megjelenik a toast-ban és a handleEnableEncryption-ban
            console.error("Hiba a titkosítás bekapcsolásakor:", error);
          }
        }}
        onCancel={() => {
          setShowEnableEncryptionModal(false);
          setTempUseAppPassword(false);
          setTempEncryptionPassword("");
          // Visszaállítjuk a checkbox-ot
          onChange({ ...settings, encryptionEnabled: false });
        }}
        confirmText={t("common.confirm" as any) || "Megerősítés"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        type="info"
        theme={theme}
        customContent={
          <div style={{ padding: "20px 0" }}>
            {/* App jelszó használata checkbox */}
            {settings.appPasswordEnabled && settings.appPasswordHash ? (
              <div style={{ 
                marginBottom: "20px",
                padding: "14px",
                backgroundColor: theme.colors.surface,
                borderRadius: "10px",
                border: `1px solid ${theme.colors.border}`
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px", 
                  cursor: "pointer",
                  userSelect: "none"
                }}>
                  <input
                    type="checkbox"
                    checked={tempUseAppPassword}
                    onChange={(e) => {
                      setTempUseAppPassword(e.target.checked);
                      if (e.target.checked) {
                        setTempEncryptionPassword(""); // Töröljük a jelszót, ha app jelszót választunk
                      }
                    }}
                    style={{ 
                      width: "20px", 
                      height: "20px", 
                      cursor: "pointer",
                      accentColor: theme.colors.primary || "#007bff"
                    }}
                  />
                  <span style={{ 
                    color: theme.colors.text, 
                    fontSize: "14px",
                    fontWeight: "500",
                    lineHeight: "1.5"
                  }}>
                    {t("encryption.useSamePasswordAsApp" as any) || "Ugyanazt a jelszót használd, mint az app jelszavas védelemhez"}
                  </span>
                </label>
              </div>
            ) : (
              <div style={{ 
                marginBottom: "20px",
                padding: "14px",
                backgroundColor: theme.colors.surface,
                borderRadius: "10px",
                border: `1px solid ${theme.colors.border}`,
                opacity: 0.6
              }}>
                <label style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "12px",
                  cursor: "not-allowed",
                  userSelect: "none"
                }}>
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    style={{ 
                      width: "20px", 
                      height: "20px", 
                      cursor: "not-allowed",
                      opacity: 0.5
                    }}
                  />
                  <span style={{ 
                    color: theme.colors.textMuted, 
                    fontSize: "14px",
                    fontStyle: "italic"
                  }}>
                    {t("encryption.useSamePasswordAsApp" as any) || "Ugyanazt a jelszót használd, mint az app jelszavas védelemhez"}
                    <span style={{ 
                      fontSize: "12px", 
                      marginLeft: "8px",
                      display: "block",
                      marginTop: "4px",
                      fontWeight: "normal"
                    }}>
                      ({t("encryption.noAppPassword" as any) || "Nincs app jelszó beállítva"})
                    </span>
                  </span>
                </label>
              </div>
            )}
            
            {/* Jelszó mező - csak akkor aktív, ha nincs app jelszó bepipálva */}
            {!tempUseAppPassword && (
              <div style={{ marginTop: "8px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "10px",
                  color: theme.colors.text,
                  fontWeight: "600",
                  fontSize: "14px"
                }}>
                  {t("encryption.encryptionPassword" as any) || "Titkosítási jelszó"}:
                </label>
                <input
                  type="password"
                  value={tempEncryptionPassword}
                  onChange={(e) => setTempEncryptionPassword(e.target.value)}
                  placeholder={t("encryption.enterEncryptionPassword" as any) || "Adja meg a titkosítási jelszót (min. 4 karakter)"}
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.background,
                    color: theme.colors.text,
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.primary || "#007bff";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.colors.border || "#ccc";
                  }}
                  minLength={4}
                  autoComplete="new-password"
                />
                <p style={{ 
                  marginTop: "6px", 
                  fontSize: "12px", 
                  color: theme.colors.textMuted,
                  marginBottom: 0
                }}>
                  {t("encryption.passwordMinLength" as any) || "Minimum 4 karakter"}
                </p>
              </div>
            )}
            
            {tempUseAppPassword && (
              <div style={{ 
                marginTop: "8px",
                padding: "14px",
                backgroundColor: theme.colors.surface,
                borderRadius: "10px",
                border: `2px solid ${theme.colors.border}`,
                opacity: 0.7
              }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "10px",
                  color: theme.colors.textMuted,
                  fontWeight: "600",
                  fontSize: "14px"
                }}>
                  {t("encryption.encryptionPassword" as any) || "Titkosítási jelszó"}:
                </label>
                <input
                  type="password"
                  value="••••••••"
                  disabled
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: "10px",
                    border: `2px solid ${theme.colors.border}`,
                    backgroundColor: theme.colors.surface,
                    color: theme.colors.textMuted,
                    fontSize: "14px",
                    opacity: 0.6,
                    cursor: "not-allowed",
                    boxSizing: "border-box"
                  }}
                />
                <p style={{ 
                  marginTop: "6px", 
                  fontSize: "12px", 
                  color: theme.colors.textMuted,
                  marginBottom: 0,
                  fontStyle: "italic"
                }}>
                  {t("encryption.usingAppPassword" as any) || "Az app jelszavas védelem jelszava használatos"}
                </p>
              </div>
            )}
          </div>
        }
      />

      {/* Password Dialogs */}
      <PasswordDialog
        isOpen={showPasswordDialog}
        title={t("auth.setPassword" as any) || "Jelszó beállítása"}
        message={t("auth.setPasswordMessage" as any) || "Adja meg az új jelszót az alkalmazás védelméhez. Minimum 4 karakter."}
        onConfirm={handleSetPassword}
        onCancel={() => {
          setShowPasswordDialog(false);
          setPasswordError(null);
          // Ha nincs jelszó, akkor kikapcsoljuk a jelszavas védelmet
          if (!settings.appPasswordHash) {
            onChange({ ...settings, appPasswordEnabled: false });
          }
        }}
        confirmText={t("auth.setPassword" as any) || "Beállítás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        showError={!!passwordError}
        errorMessage={passwordError || undefined}
        theme={theme}
        isNewPassword={true}
        minLength={4}
        language={settings.language}
      />

      <PasswordDialog
        isOpen={showChangePasswordDialog}
        title={t("auth.changePassword" as any) || "Jelszó módosítása"}
        message={t("auth.changePasswordMessage" as any) || "Adja meg az új jelszót. Minimum 4 karakter."}
        onConfirm={handleChangePassword}
        onCancel={() => {
          setShowChangePasswordDialog(false);
          setPasswordError(null);
        }}
        confirmText={t("auth.changePassword" as any) || "Módosítás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        showError={!!passwordError}
        errorMessage={passwordError || undefined}
        theme={theme}
        isNewPassword={true}
        minLength={4}
        language={settings.language}
      />

      <ConfirmDialog
        isOpen={showClearPasswordConfirm}
        title={t("auth.removePassword" as any) || "Jelszó eltávolítása"}
        message={t("auth.removePasswordMessage" as any) || "Biztosan el szeretné távolítani a jelszavas védelmet? Az alkalmazás indításkor és inaktivitás után többé nem fog jelszót kérni."}
        onConfirm={async () => {
          await handleClearPassword();
          setShowClearPasswordConfirm(false);
        }}
        onCancel={() => setShowClearPasswordConfirm(false)}
        confirmText={t("auth.removePassword" as any) || "Eltávolítás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        type="warning"
        theme={theme}
      />

      {/* Ügyféladat titkosítás Password Dialogs */}
      <PasswordDialog
        isOpen={showEncryptionPasswordDialog}
        title={t("encryption.setPassword" as any) || "Titkosítási jelszó beállítása"}
        message={t("encryption.setPasswordMessage" as any) || "Adja meg a titkosítási jelszót az ügyféladatok védelméhez. Minimum 4 karakter. A jelszó szükséges lesz az adatok betöltéséhez és mentéséhez."}
        onConfirm={handleEnableEncryption}
        onCancel={() => {
          setShowEncryptionPasswordDialog(false);
          setPasswordError(null);
          // Ha nincs titkosítási jelszó, akkor kikapcsoljuk a titkosítást
          if (!settings.encryptionPassword) {
            onChange({ ...settings, encryptionEnabled: false });
          }
        }}
        confirmText={t("encryption.setPassword" as any) || "Beállítás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        showError={!!passwordError}
        errorMessage={passwordError || undefined}
        theme={theme}
        isNewPassword={true}
        minLength={4}
        language={settings.language}
      />

      <PasswordDialog
        isOpen={showChangeEncryptionPasswordDialog}
        title={t("encryption.changePassword" as any) || "Titkosítási jelszó módosítása"}
        message={t("encryption.changePasswordMessage" as any) || "Adja meg az új titkosítási jelszót. Minimum 4 karakter. Az összes titkosított adat újratitkosításra kerül az új jelszóval."}
        onConfirm={handleChangeEncryptionPassword}
        onCancel={() => {
          setShowChangeEncryptionPasswordDialog(false);
          setPasswordError(null);
        }}
        confirmText={t("encryption.changePassword" as any) || "Módosítás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        showError={!!passwordError}
        errorMessage={passwordError || undefined}
        theme={theme}
        isNewPassword={true}
        minLength={4}
        language={settings.language}
      />

      <ConfirmDialog
        isOpen={showDisableEncryptionConfirm}
        title={t("encryption.disableEncryption" as any) || "Titkosítás kikapcsolása"}
        message={t("encryption.disableEncryptionMessage" as any) || "Biztosan ki szeretné kapcsolni az ügyféladat titkosítást? Az összes titkosított adat visszafejtésre kerül és plain textként kerül tárolásra. Ez biztonsági kockázatot jelenthet!"}
        onConfirm={async () => {
          // Ha van titkosított adat és nincs jelszó memóriában, akkor jelszó kérése
          if (settings.encryptedCustomerData) {
            const passwordToUse = getEncryptionPassword(settings.useAppPasswordForEncryption ?? false);
            if (!passwordToUse) {
              // Nincs jelszó, jelszó kérése
              setShowDisableEncryptionPasswordDialog(true);
              return;
            }
          }
          await handleDisableEncryption();
        }}
        onCancel={() => {
          setShowDisableEncryptionConfirm(false);
          // Visszaállítjuk a checkbox-ot
          if (!settings.encryptionEnabled) {
            onChange({ ...settings, encryptionEnabled: true });
          }
        }}
        confirmText={t("encryption.disableEncryption" as any) || "Kikapcsolás"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        type="warning"
        theme={theme}
      />

      {/* Jelszó kérés a titkosítás kikapcsolásakor (visszafejtéshez) */}
      <PasswordDialog
        isOpen={showDisableEncryptionPasswordDialog}
        title={t("encryption.decryptRequired" as any) || "Jelszó szükséges"}
        message={
          settings.useAppPasswordForEncryption
            ? (t("encryption.enterAppPasswordToDecrypt" as any) || "Kérjük, adja meg az app jelszavas védelem jelszavát az adatok visszafejtéséhez.")
            : (t("encryption.enterEncryptionPasswordToDecrypt" as any) || "Kérjük, adja meg a titkosítási jelszót az adatok visszafejtéséhez.")
        }
        onConfirm={async (password: string) => {
          await handleDisableEncryption(password);
        }}
        onCancel={() => {
          setShowDisableEncryptionPasswordDialog(false);
          setShowDisableEncryptionConfirm(true); // Vissza a confirm dialog-ra
        }}
        confirmText={t("common.confirm" as any) || "Rendben"}
        cancelText={t("common.cancel" as any) || "Mégse"}
        showError={false}
        theme={theme}
        isNewPassword={false}
        language={settings.language}
      />
    </>
  );
};

