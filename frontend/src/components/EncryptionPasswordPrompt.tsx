// EncryptionPasswordPrompt - Jelszó kérés titkosított adatok betöltéséhez
// Akkor jelenik meg, amikor van titkosított adat, de nincs jelszó memóriában

import React, { useState } from "react";
import { PasswordDialog } from "../shared";
import type { Settings } from "../types";
import type { Theme } from "../utils/themes";
import { useTranslation } from "../utils/translations";
import { setEncryptionPasswordInMemory, setAppPasswordInMemory } from "../utils/encryptionPasswordManager";
import { verifyPassword } from "../utils/auth";

interface EncryptionPasswordPromptProps {
  settings: Settings;
  theme: Theme;
  onPasswordEntered: (password: string) => void; // Jelszó már elmentődött memóriába, átadjuk a plain jelszót is
  onCancel?: () => void;
}

export const EncryptionPasswordPrompt: React.FC<EncryptionPasswordPromptProps> = ({
  settings,
  theme,
  onPasswordEntered,
  onCancel,
}) => {
  const t = useTranslation(settings.language);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handlePasswordSubmit = async (password: string) => {
    setPasswordError(null);

    try {
      // Ha az app jelszót használjuk, akkor ellenőrizzük, hogy helyes-e
      if (settings.useAppPasswordForEncryption && settings.appPasswordHash) {
        const isValid = await verifyPassword(password, settings.appPasswordHash);
        if (!isValid) {
          setPasswordError(
            t("auth.incorrectPassword" as any) || "Helytelen jelszó. Kérjük, próbálja újra."
          );
          return;
        }
        // App jelszó elmentése memóriába
        setAppPasswordInMemory(password);
      } else if (settings.encryptionPassword) {
        // Ha külön titkosítási jelszó van, akkor ellenőrizzük
        const isValid = await verifyPassword(password, settings.encryptionPassword);
        if (!isValid) {
          setPasswordError(
            t("auth.incorrectPassword" as any) || "Helytelen jelszó. Kérjük, próbálja újra."
          );
          return;
        }
        // Titkosítási jelszó elmentése memóriába
        setEncryptionPasswordInMemory(password);
      }

      // Jelszó helyes, továbbítjuk (már elmentettük memóriába, de átadjuk a plain jelszót is)
      onPasswordEntered(password);
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : t("encryption.passwordVerificationError" as any) || "Hiba a jelszó ellenőrzésekor";
      setPasswordError(errorMessage);
    }
  };

  const passwordMessage = settings.useAppPasswordForEncryption
    ? (t("encryption.enterAppPassword" as any) || "Kérjük, adja meg az app jelszavas védelem jelszavát az ügyféladatok betöltéséhez.")
    : (t("encryption.enterEncryptionPassword" as any) || "Kérjük, adja meg a titkosítási jelszót az ügyféladatok betöltéséhez.");

  return (
    <PasswordDialog
      isOpen={true}
      title={t("encryption.enterPassword" as any) || "Jelszó megadása szükséges"}
      message={passwordMessage}
      onConfirm={handlePasswordSubmit}
      onCancel={onCancel}
      confirmText={t("auth.unlock" as any) || "Betöltés"}
      cancelText={t("common.cancel" as any) || "Mégse"}
      showError={!!passwordError}
      errorMessage={passwordError || undefined}
      theme={theme}
      language={settings.language}
    />
  );
};
