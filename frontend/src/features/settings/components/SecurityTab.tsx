import React, { useState, useEffect } from "react";
import type { Settings } from "../../../types";
import type { Theme } from "../../../utils/themes";
import type { getThemeStyles } from "../../../utils/themes";
import { useTranslation } from "../../../utils/translations";
import { Tooltip } from "../../../components/Tooltip";
import { auditSettingsChange } from "../../../utils/auditLog";
import { PasswordDialog, ConfirmDialog } from "../../../shared";
import { setAppPassword, clearAppPassword } from "../../../utils/auth";

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

  // Auto-lock érték szinkronizálása a settings-szel
  useEffect(() => {
    setAutoLockMinutesValue(settings.autoLockMinutes || 0);
  }, [settings.autoLockMinutes]);

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

      {/* Jövőbeli titkosítási beállítások helye */}
      {/* TODO: Ügyféladat titkosítás, export titkosítás, stb. */}

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
    </>
  );
};

