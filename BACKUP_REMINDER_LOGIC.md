# Backup Emlékeztető Rendszer - Teljes Működés

## 🔄 ÚJ: AUTOSAVE ÉS AUTOMATIKUS BACKUP SZINKRONIZÁLÁSA

**FONTOS VÁLTOZÁS:** Az autosave és az automatikus backup mostantól szinkronban működik!

- ✅ **Amikor az autosave bekapcsol:** Azonnal létrehozza az első vészbackup fájlt
- ✅ **Az autosave mentés után:** Automatikusan létrehozza a vészbackup fájlt (debounce-olva, hogy ne legyen túl gyakori)
- ✅ **A vészbackup fájlok:** `$APPDATA/backups/automatic/auto_backup_*.json` könyvtárban tárolódnak
- ✅ **Régi backupok törlése:** Automatikusan törli a régi backupokat, ha túllépi a maximum számot (alapértelmezett: 10)
- ✅ **lastBackupDate frissítése:** Minden vészbackup létrehozása után frissül a `settings.lastBackupDate`

---

## 1. BACKUP LÉTREHOZÁSA

### 1.1 Manuális Backup (`createBackup`)

**Helye:** `frontend/src/utils/backup.ts` → `createBackup()` függvény
**Hívás helye:** `frontend/src/components/Settings.tsx` → Backup gomb onClick esemény

**Működés:**
1. A felhasználó rákattint a "💾 Backup létrehozása" gombra
2. Megnyílik egy fájl mentési dialógus
3. A felhasználó kiválasztja, hova szeretné menteni a backup fájlt
4. A `createBackup()` függvény:
   - Létrehoz egy `BackupData` objektumot a következő adatokkal:
     - `version: "1.0"`
     - `timestamp: new Date().toISOString()` ← **FONTOS: Ez az aktuális időpont**
     - `printers`, `filaments`, `offers`, `settings`
   - Elmenti a JSON fájlt a kiválasztott helyre
   - **VISSZAADJA:** `{ filePath: string, timestamp: string }` objektumot

5. **A Settings komponensben történik:**
   ```typescript
   const result = await createBackup(...);
   if (result) {
     // FRISSÍTI A SETTINGS.LASTBACKUPDATE-ET!
     const updatedSettings = {
       ...settings,
       lastBackupDate: result.timestamp,  // ← Ez az új timestamp
     };
     await saveSettings(updatedSettings);
     onChange(updatedSettings);
   }
   ```

**EREDMÉNY:** A `settings.lastBackupDate` be van állítva az új timestamp-re.

---

### 1.2 Automatikus Vészbackup (`createAutomaticBackup`)

**Helye:** `frontend/src/utils/backup.ts` → `createAutomaticBackup()` függvény
**Hívás helye:** `frontend/src/App.tsx` → `createAutomaticBackupIfEnabled()` függvény

**Működés:**
1. **Az autosave bekapcsolásakor:**
   - Azonnal létrehozza az első vészbackup fájlt
   - Frissíti a `settings.lastBackupDate`-et

2. **Az autosave mentések után:**
   - Debounce-olva (autosave intervallum szerint) automatikusan létrehozza a vészbackup fájlt
   - Frissíti a `settings.lastBackupDate`-et
   - Törli a régi backupokat, ha túllépi a maximum számot

3. **A fájlok helye:**
   - Könyvtár: `$APPDATA/backups/automatic/`
   - Fájlnév: `auto_backup_YYYY-MM-DDTHH-mm-ss-sssZ.json`

4. **VISSZAADJA:** `{ filePath: string, timestamp: string }` objektumot

5. **FRISSÍTI:** A `settings.lastBackupDate`-et minden backup létrehozása után

---

## 2. BACKUP EMLÉKEZTETŐ ELLENŐRZÉSE

### 2.1 Hook: `useBackupReminder`

**Helye:** `frontend/src/utils/backupReminder.ts`

**Ellenőrzési sorrend:**

#### 2.1.1. Első ellenőrzés: Automatikus backup be van kapcsolva?
```typescript
if (settings.automaticBackupEnabled === true) {
  // Ne mutassunk emlékeztetőt, mert automatikusan történik a backup
  return { shouldShow: false, ... };
}
```

#### 2.1.2. Második ellenőrzés: Autosave be van kapcsolva?
```typescript
const autosaveEnabled = settings.autosave !== false;
if (autosaveEnabled) {
  // Ne mutassunk backup emlékeztetőt, mert az autosave automatikus vészbackup-ot is létrehoz
  return { shouldShow: false, ... };
}
```

**FONTOS MEGJEGYZÉS:** Az autosave mostantól automatikus vészbackup-ot is létrehoz!
- **Autosave:** Az adatok automatikus mentése a store-ba (printers, filaments, stb.)
- **Autosave + Vészbackup:** Az autosave mentés után automatikusan létrehozza a vészbackup fájlt is
- **Manuális Backup:** A felhasználó választja ki, hova menti (Settings → Backup gomb)

#### 2.1.3. Harmadik ellenőrzés: Backup emlékeztető be van kapcsolva?
```typescript
if (settings.backupReminderEnabled === false) {
  // A felhasználó kikapcsolta az emlékeztetőt
  return { shouldShow: false, ... };
}
```

#### 2.1.4. Negyedik ellenőrzés: Van utolsó backup dátum?
```typescript
// Először a settings.lastBackupDate-et nézzük
// Ha nincs, akkor a getLastBackupDate() függvényt hívjuk
const lastBackupDate = settings.lastBackupDate || (await getLastBackupDate());

if (!lastBackupDate) {
  // Még soha nem volt backup
  return { 
    shouldShow: true, 
    lastBackupDate: null,
    daysSinceLastBackup: null,
    timeSinceBackup: null 
  };
}
```

#### 2.1.5. Ötödik ellenőrzés: Elérte-e a beállított intervallumot?
```typescript
const reminderIntervalDays = settings.backupReminderIntervalDays || 7; // Alapértelmezett: 7 nap

const daysSinceLastBackup = Math.floor(
  (now.getTime() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
);

const timeSinceBackup = getTimeSinceBackup(lastBackupDate); // Pontosabb számítás

const shouldShow = shouldShowBackupReminder(lastBackupDate, reminderIntervalDays);
// Ez akkor true, ha daysSinceLastBackup >= reminderIntervalDays
```

**EREDMÉNY:** Visszaadja a `BackupReminderState` objektumot:
```typescript
{
  shouldShow: boolean,           // Mutassunk-e emlékeztetőt?
  daysSinceLastBackup: number | null,
  lastBackupDate: string | null,  // ISO timestamp string
  timeSinceBackup: {
    minutes: number,
    hours: number,
    days: number,
    weeks: number,
    months: number,
    years: number,
    totalMinutes: number
  } | null
}
```

---

### 2.2 Komponens: `BackupReminder`

**Helye:** `frontend/src/components/BackupReminder.tsx`
**Használat:** `App.tsx`-ben van renderelve: `<BackupReminder settings={settings} />`

**Működés:**

1. **A `useBackupReminder` hook-ot használja** a logika számára

2. **Ellenőrzi, hogy mutasson-e toast-ot:**
   - Ha `automaticBackupEnabled === true` → Nincs toast
   - Ha `autosave === true` → Nincs toast
   - Ha `reminderState.shouldShow === false` → Nincs toast

3. **Toast üzenet összeállítása:**
   - **Ha nincs `lastBackupDate`:**
     - Üzenet: `"Még nem készítettél backup-ot! Ajánlott rendszeresen menteni az adataidat."`
     - Kulcs: `never-YYYY-MM-DD` (naponta max 1x jelenik meg)

   - **Ha van `lastBackupDate` és van `timeSinceBackup`:**
     - **Évek szerint:** `"{{years}} éve nem készítettél backup-ot!"`
     - **Hónapok szerint:** `"{{months}} hónapja nem készítettél backup-ot!"`
     - **Hétek szerint:** `"{{weeks}} hete nem készítettél backup-ot!"`
     - **Napok szerint:** 
       - 1 nap: `"1 napja nem készítettél backup-ot!"`
       - Több nap: `"{{days}} napja nem készítettél backup-ot!"`
     - **Órák szerint:** `"{{hours}} órája nem készítettél backup-ot!"`
     - **Percek szerint:** `"{{minutes}} perce nem készítettél backup-ot!"`
     - **Ma:** `"Ma még nem készítettél backup-ot!"`

4. **Duplikáció ellenőrzés:**
   - Használ egy `hasShownReminder` ref-et, hogy ne mutassa többször ugyanazt az emlékeztetőt
   - Kulcs: `{lastBackupDate}-{days}` vagy `never-{today}`

---

## 3. UTOLSÓ BACKUP DÁTUM LEKÉRDEZÉSE

### 3.1 `getLastBackupDate()` függvény

**Helye:** `frontend/src/utils/backup.ts`

**Működés:**
1. Ellenőrzi az automatikus backup könyvtárat: `$APPDATA/backups/automatic/`
2. Ha a könyvtár nem létezik → `return null`
3. Kiolvassa a könyvtár tartalmát
4. Szűri az `auto_backup_*.json` fájlokat
5. Rendezi dátum szerint (legújabb először)
6. Kiolvassa a legújabb fájl tartalmát
7. Visszaadja a `BackupData.timestamp` értékét

**PROBLÉMA:** Ez csak az **automatikus** backupokat nézi! A **manuális** backupok nem ebben a könyvtárban vannak (a felhasználó választja ki a helyet).

**MEGOLDÁS:** A manuális backupok esetén a `settings.lastBackupDate`-et kell használni, amit a Settings komponens frissít.

---

## 4. AUTOSAVE ÉS AUTOMATIKUS BACKUP SZINKRONIZÁLÁSA

### 4.1 Implementáció helye
**Helye:** `frontend/src/App.tsx`

### 4.2 Hogyan működik?

#### 4.2.1 Autosave bekapcsolásakor:
```typescript
// Amikor az autosave false → true változik
if (previousAutosaveState === false && autosaveEnabled === true) {
  // 1. Újraindítjuk a lastSaved dátumot
  updateLastSaved();
  
  // 2. Azonnal létrehozzuk az első vészbackup-ot
  createAutomaticBackupIfEnabled();
}
```

#### 4.2.2 Autosave mentés után:
Minden debounced save függvény (printers, filaments, offers, customers, settings) után:
```typescript
savePrinters(printers).then(() => {
  updateLastSaved();
  // Automatikus vészbackup létrehozása (debounce-olva)
  debouncedAutomaticBackup();
});
```

#### 4.2.3 Vészbackup létrehozása:
```typescript
const createAutomaticBackupIfEnabled = async () => {
  // 1. Létrehozza a backup fájlt: $APPDATA/backups/automatic/auto_backup_*.json
  const backupResult = await createAutomaticBackup(printers, filaments, offers, settings);
  
  if (backupResult) {
    // 2. Frissíti a settings.lastBackupDate-et
    const updatedSettings = {
      ...settings,
      lastBackupDate: backupResult.timestamp,
    };
    await saveSettings(updatedSettings);
    setSettings(updatedSettings);
    
    // 3. Törli a régi backupokat (max 10 db)
    await cleanupOldBackups(settings.maxAutomaticBackups || 10);
  }
};
```

### 4.3 Eredmény:
- ✅ Az autosave bekapcsolásakor azonnal létrejön az első vészbackup
- ✅ Az autosave mentések után automatikusan létrejönnek a vészbackup fájlok
- ✅ A `settings.lastBackupDate` mindig frissül
- ✅ A régi backupok automatikusan törlődnek (max 10 db)

---

## 5. JELENLEGI PROBLÉMA ÉS MEGOLDÁS

### Probléma (RÉGI - MOST MÁR MEGOLDVA):
A régi verzióban:
- `lastBackupDate: null` - nincs beállítva a settings-ben
- `Backup könyvtár nem létezik` - nincs automatikus backup fájl
- De a felhasználó azt mondja, hogy volt backup és elmentette

### Megoldás (IMPLEMENTÁLVA):
1. ✅ **MEGOLDVA:** A manuális backup után frissítődik a `settings.lastBackupDate`
2. ✅ **MEGOLDVA:** Az autosave bekapcsolásakor azonnal létrejön az első vészbackup és frissül a `settings.lastBackupDate`
3. ✅ **MEGOLDVA:** Az autosave mentések után automatikusan létrejönnek a vészbackup fájlok és frissül a `settings.lastBackupDate`
4. ✅ **MEGOLDVA:** A `useBackupReminder` hook prioritása:
   - Először: `settings.lastBackupDate` (mindkét esetben működik)
   - Másodszor: `getLastBackupDate()` (csak automatikus backupokhoz)

---

## 5. ÖSSZEFOGLALÁS - MIENNEK HOGYAN KELL MŰKÖDNIE

### Manuális Backup esetén:
1. ✅ Felhasználó rákattint a "Backup létrehozása" gombra
2. ✅ Kiválasztja a mentési helyet
3. ✅ A backup fájl létrejön
4. ✅ **A `settings.lastBackupDate` frissül az új timestamp-re** ← **MOST MÁR ÍGY VAN!**
5. ✅ A következő ellenőrzésnél (1 óra múlva vagy újraindítás után) a `settings.lastBackupDate`-et használja
6. ✅ Ha elérte a beállított intervallumot (pl. 7 nap), megjelenik az emlékeztető

### Automatikus Vészbackup esetén (autosave szinkron - IMPLEMENTÁLVA):
1. ✅ Az autosave bekapcsolásakor azonnal létrejön az első vészbackup
2. ✅ Az autosave mentések után automatikusan létrejönnek a vészbackup fájlok
3. ✅ A `settings.lastBackupDate` mindig frissül
4. ✅ A `getLastBackupDate()` is megtalálja a fájlt
5. ✅ Az emlékeztető nem jelenik meg, mert `autosave === true` (és van vészbackup)

### Autosave esetén:
- ✅ **ÚJ:** Az autosave mostantól automatikus vészbackup-ot is létrehoz!
- ✅ Amikor az autosave bekapcsol, azonnal létrehozza az első vészbackup fájlt
- ✅ Az autosave mentések után automatikusan létrehozza a vészbackup fájlt (debounce-olva)
- ✅ Ha az autosave be van kapcsolva, NEM mutatunk backup emlékeztetőt, mert automatikusan történik a vészbackup

---

## 6. DEBUG LOGOK

A fejlesztői módban (DEV) a következő logok jelennek meg:

### `useBackupReminder` hook:
- `🔍 Backup emlékeztető ellenőrzés:` - Beállítások logolása
- `ℹ️ Automatikus backup be van kapcsolva` - Ha ki van kapcsolva az emlékeztető
- `ℹ️ Autosave be van kapcsolva` - Ha ki van kapcsolva az emlékeztető

### `getLastBackupDate()`:
- `ℹ️ Backup könyvtár nem létezik:` - Ha nincs automatikus backup könyvtár
- `ℹ️ Nincs automatikus backup fájl` - Ha nincs backup fájl
- `✅ Utolsó backup dátum:` - Ha megtalálta a backup dátumot

### `BackupReminder` komponens:
- `🔍 BackupReminder komponens ellenőrzés:` - Komponens állapot logolása
- `💾 Backup emlékeztető megjelenítve` - Amikor megjelent a toast

---

## 7. TESZTELÉSI LÉPÉSEK

1. **Manuális backup létrehozása:**
   - Nyisd meg a Settings oldalt
   - Kattints a "💾 Backup létrehozása" gombra
   - Mentsd el a fájlt
   - Ellenőrizd a console-ban, hogy frissült-e a `lastBackupDate`

2. **Backup emlékeztető tesztelése (nincs backup):**
   - Töröld a `settings.lastBackupDate`-et (vagy használj egy tiszta beállítást)
   - Indítsd újra az alkalmazást
   - Azonnal meg kell jelennie a toast üzenetnek: "Még nem készítettél backup-ot!"

3. **Backup emlékeztető tesztelése (régi backup):**
   - Állítsd be a `settings.lastBackupDate`-et 8 napra ezelőttre
   - Állítsd be a `backupReminderIntervalDays`-t 7-re
   - Azonnal meg kell jelennie a toast üzenetnek: "8 napja nem készítettél backup-ot!"

4. **Autosave tesztelése:**
   - Kapcsold be az autosave-ot
   - Az emlékeztető ne jelenjen meg (még ha nincs is backup dátum)

5. **Automatikus backup tesztelése:**
   - Kapcsold be az `automaticBackupEnabled`-et
   - Az emlékeztető ne jelenjen meg

