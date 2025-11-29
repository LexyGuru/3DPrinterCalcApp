# Autosave és Automatikus Backup Szinkronizálás - Összefoglaló

## ✅ Implementálva

### 1. Autosave bekapcsolásakor
- **Azonnal létrehozza az első vészbackup fájlt**
- Frissíti a `settings.lastBackupDate`-et
- Így mindig van egy biztonsági mentés, amikor az autosave be van kapcsolva

### 2. Autosave mentés után
- Az autosave mentések (printers, filaments, offers, customers, settings) után
- **Debounce-olva** (autosave intervallum szerint) automatikusan létrehozza a vészbackup fájlt
- Frissíti a `settings.lastBackupDate`-et
- Törli a régi backupokat, ha túllépi a maximum számot (alapértelmezett: 10)

### 3. Vészbackup fájlok helye
- Könyvtár: `$APPDATA/backups/automatic/`
- Fájlnév: `auto_backup_YYYY-MM-DDTHH-mm-ss-sssZ.json`
- Automatikusan törlődnek a régi backupok (max 10 db)

### 4. Backup emlékeztető
- Ha az autosave be van kapcsolva → **NEM mutatunk backup emlékeztetőt**
- Mert automatikusan történik a vészbackup

## 🔧 Technikai részletek

### Implementáció helye:
- `frontend/src/App.tsx` → `createAutomaticBackupIfEnabled()` és `debouncedAutomaticBackup()`
- `frontend/src/utils/backup.ts` → `createAutomaticBackup()` és `cleanupOldBackups()`

### Fő függvények:

1. **`createAutomaticBackupIfEnabled()`**
   - Ellenőrzi, hogy az autosave be van-e kapcsolva
   - Létrehozza a vészbackup fájlt
   - Frissíti a `settings.lastBackupDate`-et
   - Törli a régi backupokat

2. **`debouncedAutomaticBackup()`**
   - Debounce-olva hívja meg a `createAutomaticBackupIfEnabled()`-et
   - Autosave intervallum szerint működik

3. **Autosave újraindítás**
   - Amikor az autosave `false` → `true` változik
   - Azonnal létrehozza az első vészbackup-ot

## 📝 Eredmény

✅ **Az autosave és az automatikus backup mostantól teljesen szinkronban működik!**

- Az autosave bekapcsol → első vészbackup létrejön
- Az autosave ment → vészbackup létrejön (debounce-olva)
- A `lastBackupDate` mindig frissül
- A régi backupok automatikusan törlődnek
- Nincs backup emlékeztető, ha az autosave be van kapcsolva

