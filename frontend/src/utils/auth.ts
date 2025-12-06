// Authentication utilities - újrafelhasználható auth funkciók
// Használható: app jelszavas védelem, ügyféladat titkosítás

import { invoke } from "@tauri-apps/api/core";
import type { Settings } from "../types";
import { saveSettings } from "./store";

/**
 * Jelszó hash generálása backend-ből
 * @param password - A jelszó, amit hash-elni szeretnénk
 * @returns A hash-elt jelszó (base64 encoded)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    const hash = await invoke<string>("hash_password", { password });
    return hash;
  } catch (error) {
    console.error("❌ Jelszó hash generálási hiba:", error);
    throw new Error(`Jelszó hash generálási hiba: ${error}`);
  }
}

/**
 * Jelszó ellenőrzése hash-szel szemben
 * @param password - A jelszó, amit ellenőrizni szeretnénk
 * @param hash - A hash-elt jelszó
 * @returns true, ha a jelszó helyes, különben false
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const isValid = await invoke<boolean>("verify_password", { password, hash });
    return isValid;
  } catch (error) {
    console.error("❌ Jelszó ellenőrzési hiba:", error);
    return false;
  }
}

/**
 * Adatok titkosítása backend-ből (újrafelhasználható - ügyféladatokhoz)
 * @param data - Az adat, amit titkosítani szeretnénk
 * @param password - A titkosítási jelszó
 * @returns A titkosított adat (base64 encoded)
 */
export async function encryptData(data: string, password: string): Promise<string> {
  try {
    const encrypted = await invoke<string>("encrypt_data", { data, password });
    return encrypted;
  } catch (error) {
    console.error("❌ Adat titkosítási hiba:", error);
    throw new Error(`Adat titkosítási hiba: ${error}`);
  }
}

/**
 * Adatok visszafejtése backend-ből (újrafelhasználható - ügyféladatokhoz)
 * @param encrypted - A titkosított adat (base64 encoded)
 * @param password - A visszafejtési jelszó
 * @returns A visszafejtett adat
 */
export async function decryptData(encrypted: string, password: string): Promise<string> {
  try {
    if (import.meta.env.DEV) {
      console.log("🔓 Adat visszafejtése backend-ből...", { 
        encryptedLength: encrypted.length,
        hasPassword: !!password 
      });
    }
    const decrypted = await invoke<string>("decrypt_data", { encrypted, password });
    if (import.meta.env.DEV) {
      console.log("✅ Visszafejtés sikeres", { decryptedLength: decrypted.length });
    }
    return decrypted;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Adat visszafejtési hiba:", errorMessage);
    
    // Részletes hibaüzenet - ha a backend aead::Error-t dob, azt továbbadjuk
    if (errorMessage.includes("aead::Error") || errorMessage.includes("decryption failed")) {
      throw new Error(`Visszafejtési hiba: aead::Error`);
    }
    
    throw new Error(`Adat visszafejtési hiba: ${errorMessage}`);
  }
}

/**
 * App jelszó beállítása
 * @param password - Az új jelszó
 * @param settings - A jelenlegi settings
 * @returns Az frissített settings
 */
export async function setAppPassword(
  password: string,
  settings: Settings
): Promise<Settings> {
  if (!password || password.length < 4) {
    throw new Error("A jelszónak legalább 4 karakternek kell lennie");
  }

  // Jelszó hash generálása
  const hash = await hashPassword(password);

  // Settings frissítése
  const updatedSettings: Settings = {
    ...settings,
    appPasswordEnabled: true,
    appPasswordHash: hash,
  };

  // Settings mentése
  await saveSettings(updatedSettings);

  return updatedSettings;
}

/**
 * App jelszó törlése
 * @param settings - A jelenlegi settings
 * @returns Az frissített settings
 */
export async function clearAppPassword(settings: Settings): Promise<Settings> {
  const updatedSettings: Settings = {
    ...settings,
    appPasswordEnabled: false,
    appPasswordHash: null,
    autoLockMinutes: 0, // Auto-lock is kikapcsolása
  };

  // Settings mentése
  await saveSettings(updatedSettings);

  return updatedSettings;
}

/**
 * App jelszó ellenőrzése
 * @param password - A jelszó, amit ellenőrizni szeretnénk
 * @param settings - A jelenlegi settings
 * @returns true, ha a jelszó helyes, különben false
 */
export async function verifyAppPassword(
  password: string,
  settings: Settings
): Promise<boolean> {
  if (!settings.appPasswordEnabled || !settings.appPasswordHash) {
    return false;
  }

  return await verifyPassword(password, settings.appPasswordHash);
}

