// Encryption Password Manager - Jelszó tárolás memóriában (session során)
// A jelszó csak akkor van elérhető, amíg az app fut (bezárásnál elvész)

let encryptionPasswordInMemory: string | null = null;
let appPasswordInMemory: string | null = null;

/**
 * Titkosítási jelszó beállítása memóriában
 */
export function setEncryptionPasswordInMemory(password: string | null): void {
  encryptionPasswordInMemory = password;
}

/**
 * Titkosítási jelszó lekérése memóriából
 */
export function getEncryptionPasswordInMemory(): string | null {
  return encryptionPasswordInMemory;
}

/**
 * App jelszó beállítása memóriában (az AuthGuard-ból vagy SecurityTab-ból)
 */
export function setAppPasswordInMemory(password: string | null): void {
  appPasswordInMemory = password;
}

/**
 * App jelszó lekérése memóriából
 */
export function getAppPasswordInMemory(): string | null {
  return appPasswordInMemory;
}

/**
 * Titkosítási jelszó lekérése (app jelszó használata esetén, ha be van állítva)
 * @param useAppPassword - Ha true és van app jelszó, akkor azt adja vissza
 */
export function getEncryptionPassword(useAppPassword: boolean): string | null {
  if (useAppPassword && appPasswordInMemory) {
    return appPasswordInMemory;
  }
  return encryptionPasswordInMemory;
}

/**
 * Minden jelszó törlése memóriából (bezáráskor)
 */
export function clearAllPasswords(): void {
  encryptionPasswordInMemory = null;
  appPasswordInMemory = null;
}
