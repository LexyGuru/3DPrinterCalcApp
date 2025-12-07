// Customer Encryption utilities - Ügyféladat titkosítás/visszafejtés
// Használja a backend encryption API-kat

import type { Customer } from "../types";
import { encryptData, decryptData, hashPassword } from "./auth";

/**
 * Customer tömb titkosítása (ID-k NÉLKÜL)
 * FONTOS: Az ID-k külön vannak tárolva (nem titkosítva), hogy megjeleníthetők legyenek
 * @param customers - A titkosítandó customer tömb
 * @param password - A titkosítási jelszó
 * @returns Titkosított JSON string (ID-k nélkül)
 */
export async function encryptCustomers(
  customers: Customer[],
  password: string
): Promise<string> {
  try {
    // Kivesszük az ID-kat a customer objektumokból, mert azok külön lesznek tárolva
    const customersWithoutIds = customers.map(({ id, ...rest }) => rest);
    
    // Customer tömb (ID-k nélkül) JSON stringgé alakítása
    const customerJson = JSON.stringify(customersWithoutIds);
    
    // Titkosítás backend-ből
    const encrypted = await encryptData(customerJson, password);
    
    return encrypted;
  } catch (error) {
    console.error("❌ Customer adatok titkosítási hiba:", error);
    throw new Error(`Customer adatok titkosítási hiba: ${error}`);
  }
}

/**
 * Customer tömb visszafejtése
 * FONTOS: Visszafelé kompatibilis - ha a visszafejtett adatokban vannak ID-k (régi formátum), akkor azokat használja
 * Ha nincsenek ID-k (új formátum), akkor Omit<Customer, 'id'>[]-t ad vissza
 * @param encrypted - A titkosított JSON string
 * @param password - A visszafejtési jelszó
 * @returns Visszafejtett Customer tömb (ID-kkal, ha régi formátum) vagy Omit<Customer, 'id'>[] (ha új formátum)
 */
export async function decryptCustomers(
  encrypted: string,
  password: string
): Promise<Customer[] | Omit<Customer, 'id'>[]> {
  try {
    if (import.meta.env.DEV) {
      console.log("🔓 Customer adatok visszafejtése...", { 
        encryptedLength: encrypted.length,
        hasPassword: !!password,
        passwordLength: password ? password.length : 0
      });
    }
    
    // Visszafejtés backend-ből
    const decryptedJson = await decryptData(encrypted, password);
    
    if (import.meta.env.DEV) {
      console.log("✅ Visszafejtés sikeres, JSON parse...", { decryptedLength: decryptedJson.length });
    }
    
    // JSON string Customer tömbgé alakítása
    const customers: Customer[] | Omit<Customer, 'id'>[] = JSON.parse(decryptedJson);
    
    // Ellenőrizzük, hogy vannak-e ID-k (régi formátum) vagy nincsenek (új formátum)
    if (customers.length > 0 && 'id' in customers[0]) {
      // Régi formátum - ID-k benne vannak
      if (import.meta.env.DEV) {
        console.log("✅ Customer tömb parse sikeres (régi formátum - ID-k benne vannak)", { count: customers.length });
      }
      return customers as Customer[];
    } else {
      // Új formátum - ID-k nélkül
      if (import.meta.env.DEV) {
        console.log("✅ Customer tömb parse sikeres (új formátum - ID-k nélkül)", { count: customers.length });
      }
      return customers as Omit<Customer, 'id'>[];
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Customer adatok visszafejtési hiba:", errorMessage);
    
    // Részletes hibaüzenet
    if (errorMessage.includes("aead::Error") || errorMessage.includes("decryption")) {
      throw new Error("Visszafejtési hiba: aead::Error - Lehet, hogy rossz a jelszó, vagy az adatok sérültek");
    }
    
    throw new Error(`Customer adatok visszafejtési hiba: ${errorMessage}`);
  }
}

/**
 * Titkosítási jelszó beállítása
 * @param password - Az új titkosítási jelszó
 * @returns A hash-elt jelszó
 */
export async function setEncryptionPassword(password: string): Promise<string> {
  if (!password || password.length < 4) {
    throw new Error("A titkosítási jelszónak legalább 4 karakternek kell lennie");
  }

  // Jelszó hash generálása
  const hash = await hashPassword(password);
  return hash;
}
