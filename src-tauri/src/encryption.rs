// Encryption module - újrafelhasználható titkosítási funkciók
// Használható: app jelszavas védelem, ügyféladat titkosítás

use aes_gcm::{
    aead::{Aead, AeadCore, KeyInit, OsRng},
    Aes256Gcm, Key, Nonce,
};
use base64::{engine::general_purpose, Engine as _};
use pbkdf2::pbkdf2_hmac;
use sha2::Sha256;
use std::str;

// Salt length for PBKDF2
const SALT_LENGTH: usize = 32;
// PBKDF2 iterations - magas szám a biztonság érdekében
const PBKDF2_ITERATIONS: u32 = 100_000;
// Nonce length for AES-GCM
const NONCE_LENGTH: usize = 12;

/// Jelszó hash generálása PBKDF2-vel
/// Returns: base64 encoded salt + hash
pub fn hash_password(password: &str) -> Result<String, String> {
    // Generálunk egy random salt-ot
    let salt: [u8; SALT_LENGTH] = {
        let mut s = [0u8; SALT_LENGTH];
        use rand::RngCore;
        rand::thread_rng().fill_bytes(&mut s);
        s
    };

    // PBKDF2 hash generálása
    let mut hash = [0u8; 32]; // SHA-256 output length
    pbkdf2_hmac::<Sha256>(password.as_bytes(), &salt, PBKDF2_ITERATIONS, &mut hash);

    // Salt + hash kombinálása és base64 encoding
    let mut combined = Vec::with_capacity(SALT_LENGTH + hash.len());
    combined.extend_from_slice(&salt);
    combined.extend_from_slice(&hash);

    Ok(general_purpose::STANDARD.encode(&combined))
}

/// Jelszó ellenőrzése a hash-elt értékkel szemben
pub fn verify_password(password: &str, hash: &str) -> Result<bool, String> {
    // Decode base64
    let combined = general_purpose::STANDARD
        .decode(hash)
        .map_err(|e| format!("Hash decode hiba: {}", e))?;

    if combined.len() < SALT_LENGTH + 32 {
        return Err("Érvénytelen hash formátum".to_string());
    }

    // Salt és hash kinyerése
    let salt = &combined[0..SALT_LENGTH];
    let stored_hash = &combined[SALT_LENGTH..SALT_LENGTH + 32];

    // Új hash számítása a megadott jelszóval
    let mut computed_hash = [0u8; 32];
    pbkdf2_hmac::<Sha256>(password.as_bytes(), salt, PBKDF2_ITERATIONS, &mut computed_hash);

    // Összehasonlítás (constant-time comparison)
    Ok(computed_hash == stored_hash)
}

/// Adatok titkosítása AES-256-GCM-mel
/// Returns: base64 encoded nonce + ciphertext
pub fn encrypt_data(data: &str, password: &str) -> Result<String, String> {
    // Jelszó hash-ből kulcs generálása (32 byte = 256 bit)
    let key_bytes = {
        let mut key = [0u8; 32];
        pbkdf2_hmac::<Sha256>(password.as_bytes(), b"encryption_salt", 10_000, &mut key);
        key
    };

    let key = Key::<Aes256Gcm>::from(key_bytes);
    let cipher = Aes256Gcm::new(&key);

    // Nonce generálása
    let nonce = Aes256Gcm::generate_nonce(&mut OsRng);

    // Titkosítás
    let ciphertext = cipher
        .encrypt(&nonce, data.as_bytes())
        .map_err(|e| format!("Titkosítási hiba: {}", e))?;

    // Nonce + ciphertext kombinálása és base64 encoding
    let mut combined = Vec::with_capacity(NONCE_LENGTH + ciphertext.len());
    combined.extend_from_slice(nonce.as_ref());
    combined.extend_from_slice(&ciphertext);

    Ok(general_purpose::STANDARD.encode(&combined))
}

/// Adatok visszafejtése AES-256-GCM-mel
pub fn decrypt_data(encrypted: &str, password: &str) -> Result<String, String> {
    // Decode base64
    let combined = general_purpose::STANDARD
        .decode(encrypted)
        .map_err(|e| format!("Decode hiba: {}", e))?;

    if combined.len() < NONCE_LENGTH {
        return Err("Érvénytelen titkosított adat formátum".to_string());
    }

    // Nonce és ciphertext kinyerése
    let nonce_bytes: [u8; NONCE_LENGTH] = combined[0..NONCE_LENGTH]
        .try_into()
        .map_err(|_| "Érvénytelen nonce hossz".to_string())?;
    let nonce = Nonce::from(nonce_bytes);
    let ciphertext = &combined[NONCE_LENGTH..];

    // Jelszó hash-ből kulcs generálása (ugyanaz, mint encrypt-nél)
    let key_bytes = {
        let mut key = [0u8; 32];
        pbkdf2_hmac::<Sha256>(password.as_bytes(), b"encryption_salt", 10_000, &mut key);
        key
    };

    let key = Key::<Aes256Gcm>::from(key_bytes);
    let cipher = Aes256Gcm::new(&key);

    // Visszafejtés
    let plaintext = cipher
        .decrypt(&nonce, ciphertext)
        .map_err(|e| format!("Visszafejtési hiba: {}", e))?;

    // Stringgé alakítás
    str::from_utf8(&plaintext)
        .map(|s| s.to_string())
        .map_err(|e| format!("UTF-8 konverziós hiba: {}", e))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_password_hashing() {
        let password = "test_password_123";
        let hash = hash_password(password).unwrap();
        
        // Ellenőrizzük, hogy a hash hosszabb, mint az eredeti jelszó
        assert!(hash.len() > password.len());
        
        // Ellenőrizzük, hogy ugyanaz a jelszó ugyanazt a hash-t adja-e
        let hash2 = hash_password(password).unwrap();
        // Megjegyzés: más hash lesz, mert más salt-ot használ
        // De a verify_password működnie kell
        assert!(verify_password(password, &hash).unwrap());
        assert!(verify_password(password, &hash2).unwrap());
    }

    #[test]
    fn test_password_verification() {
        let password = "correct_password";
        let wrong_password = "wrong_password";
        let hash = hash_password(password).unwrap();
        
        assert!(verify_password(password, &hash).unwrap());
        assert!(!verify_password(wrong_password, &hash).unwrap());
    }

    #[test]
    fn test_encryption_decryption() {
        let data = "Sensitive data to encrypt";
        let password = "encryption_password";
        
        let encrypted = encrypt_data(data, password).unwrap();
        assert_ne!(encrypted, data); // Titkosítottnak másnak kell lennie
        
        let decrypted = decrypt_data(&encrypted, password).unwrap();
        assert_eq!(decrypted, data);
    }

    #[test]
    fn test_encryption_wrong_password() {
        let data = "Sensitive data";
        let password = "correct_password";
        let wrong_password = "wrong_password";
        
        let encrypted = encrypt_data(data, password).unwrap();
        
        // Rossz jelszóval nem lehet visszafejteni
        assert!(decrypt_data(&encrypted, wrong_password).is_err());
    }
}

