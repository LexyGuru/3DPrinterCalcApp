// Customer Encryption utilities - Ügyféladat titkosítás/visszafejtés
// Használja a backend encryption API-kat

import type { Customer } from "../types";
import { encryptData, decryptData, hashPassword } from "./auth";

/**
 * Customer tömb titkosítása
 * @param customers - A titkosítandó customer tömb
 * @param password - A titkosítási jelszó
 * @returns Titkosított JSON string
 */
export async function encryptCustomers(
  customers: Customer[],
  password: string
): Promise<string> {
  try {
    // Customer tömb JSON stringgé alakítása
    const customerJson = JSON.stringify(customers);
    
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
 * @param encrypted - A titkosított JSON string
 * @param password - A visszafejtési jelszó
 * @returns Visszafejtett Customer tömb
 */
export async function decryptCustomers(
  encrypted: string,
  password: string
): Promise<Customer[]> {
  try {
    // Visszafejtés backend-ből
    const decryptedJson = await decryptData(encrypted, password);
    
    // JSON string Customer tömbgé alakítása
    const customers: Customer[] = JSON.parse(decryptedJson);
    
    return customers;
  } catch (error) {
    console.error("❌ Customer adatok visszafejtési hiba:", error);
    throw new Error(`Customer adatok visszafejtési hiba: ${error}`);
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
