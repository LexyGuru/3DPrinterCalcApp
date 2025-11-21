# Funkció implementációs terv - Prioritási sorrend

**Dátum:** 2025-11-20  
**Alapverzió:** v0.6.0 (stabil, működő)  
**Cél:** Egyesével implementálni a törölt funkciókat, hogy kiderüljön, mi okozza a problémát

---

## ✅ Előfeltételek

### 1. CSS háttérszín konfliktusok javítása ✅ KÉSZ
- [x] `index.css` - Eltávolítva rögzített fehér háttérszínek `!important`-tal
- [x] `App.css` - Eltávolítva rögzített fehér háttérszín
- [x] Media query - Eltávolítva rögzített fehér háttérszín
- [x] Select és input mezők - Eltávolítva rögzített fehér háttérszínek

**Státusz:** ✅ CSS fájlok javítva - a háttérszínt most a témarendszer kezeli

---

### 2. Frontend és Backend logolási rendszer ✅ KÉSZ
**Prioritás:** 🔴 KRITIKUS (debugoláshoz szükséges)  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Külön log fájlok frontend és backend logokhoz  
**Fájlok:**
- `src-tauri/src/logger.rs` ✅ LÉTREHOZVA - Backend logger
- `frontend/src/utils/fileLogger.ts` ✅ LÉTREHOZVA - Frontend file logger
- `frontend/src/utils/consoleLogger.ts` ✅ MÓDOSÍTVA - Integráció file logger-rel
- `src-tauri/src/commands.rs` ✅ MÓDOSÍTVA - Frontend log commands
- `src-tauri/src/main.rs` ✅ MÓDOSÍTVA - Logger inicializálás

**Funkciók:**
- ✅ Backend log fájl: `backend-YYYY-MM-DD.log`
- ✅ Frontend log fájl: `frontend-YYYY-MM-DD.log`
- ✅ Automatikus logolás minden console.log-ból
- ✅ Hibák külön kezelve (ERROR level)
- ✅ Timestamp minden log bejegyzésnél
- ✅ Log fájlok a `~/Library/Application Support/3DPrinterCalcApp/logs/` mappában (macOS)

**Tesztelés:**
- [ ] Backend log fájl létrejön
- [ ] Frontend log fájl létrejön
- [ ] Console.log automatikusan fájlba íródik
- [ ] Hibák külön logolva
- [ ] Timestamp helyes

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

## 📋 Funkció implementációs lista - Prioritási sorrend

### 🔴 KRITIKUS PRIORITÁS (Alapvető funkciók)

#### 1. Empty State komponens ✅ KÉSZ
**Prioritás:** 🔴 KRITIKUS  
**Komplexitás:** ⭐ Alacsony  
**Függőségek:** Nincs  
**Leírás:** Üres állapot komponens Filaments, Printers, Offers komponensekhez  
**Fájlok:**
- `frontend/src/components/EmptyState.tsx` ✅ LÉTREHOZVA
- `frontend/src/components/Filaments.tsx` ✅ INTEGRÁLVA
- `frontend/src/components/Printers.tsx` ✅ INTEGRÁLVA
- `frontend/src/components/Offers.tsx` ✅ INTEGRÁLVA

**Tesztelés:**
- [x] Filaments komponens - üres lista esetén ✅
- [x] Printers komponens - üres lista esetén ✅
- [x] Offers komponens - üres lista esetén ✅
- [x] Témák - minden téma esetén működik-e ✅ TESZTELVE

**Státusz:** ✅ IMPLEMENTÁLVA ÉS TESZTELVE - Működik!

---

#### 2. Automatikus mentés visszajelzés ✅ KÉSZ
**Prioritás:** 🔴 KRITIKUS  
**Komplexitás:** ⭐ Alacsony  
**Függőségek:** Nincs  
**Leírás:** Last saved timestamp megjelenítése a header-ben  
**Fájlok:**
- `frontend/src/components/Header.tsx` ✅ MÓDOSÍTVA - Last saved timestamp hozzáadva
- `frontend/src/App.tsx` ✅ MÓDOSÍTVA - Last saved state kezelése

**Funkciók:**
- ✅ Last saved timestamp state App.tsx-ben
- ✅ Automatikus frissítés minden mentés után (printers, filaments, settings, offers, customers)
- ✅ Relatív idő formázás (pl. "Most mentve", "5 perce", "2 órája")
- ✅ Abszolút dátum, ha több mint 24 óra telt el
- ✅ Többnyelvű támogatás (hu, de, en)
- ✅ Téma-aware színezés

**Tesztelés:**
- [ ] Mentés után timestamp frissül
- [ ] Timestamp formátuma helyes
- [ ] Minden téma esetén látható
- [ ] Relatív idő frissül másodpercenként

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

### 🟡 MAGAS PRIORITÁS (Hasznos funkciók)

#### 3. Tooltip komponens fejlesztése ✅ KÉSZ
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Tooltip komponens fejlesztése TooltipContext-tel és téma támogatással  
**Fájlok:**
- `frontend/src/contexts/TooltipContext.tsx` ✅ LÉTREHOZVA
- `frontend/src/components/Tooltip.tsx` ✅ MÓDOSÍTVA

**Funkciók:**
- ✅ TooltipContext létrehozva - központi tooltip kezelés
- ✅ Téma támogatás - tooltip színek adaptálnak a témához
- ✅ Gradient háttér támogatás - blur effekt és átlátszó háttér
- ✅ Neon témák támogatása - glow effekt
- ✅ Light/dark témák automatikus detektálása
- ✅ Arrow színek adaptálnak a tooltip háttérszínéhez
- ✅ Backdrop filter blur effekt gradient témáknál

**Tesztelés:**
- [ ] Tooltip megjelenik hover esetén
- [ ] Tooltip pozíciója helyes
- [ ] Minden téma esetén működik
- [ ] Színek helyesek minden témánál

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

#### 4. Kártyák hover effektek ✅ KÉSZ
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐ Alacsony  
**Függőségek:** Nincs  
**Leírás:** Kártya komponens hover animációkkal  
**Fájlok:**
- `frontend/src/components/Card.tsx` ✅ LÉTREHOZVA

**Funkciók:**
- ✅ Hover animáció - translateY(-4px) lift effekt
- ✅ Box shadow animáció - mélyebb árnyék hover esetén
- ✅ Neon témák támogatása - glow effekt hover esetén
- ✅ Glassmorphism támogatás
- ✅ Smooth transitions - cubic-bezier easing
- ✅ Opcionális onClick kezelés
- ✅ Keyboard accessibility (Enter/Space)
- ✅ Téma-aware színezés

**Tesztelés:**
- [ ] Hover animáció működik
- [ ] Minden téma esetén működik
- [ ] Teljesítmény rendben
- [ ] Glow effekt neon témáknál

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

#### 5. Progress Bar komponens
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Progress bar komponens PDF export-hoz és import műveletekhez  
**Fájlok:**
- `frontend/src/components/ProgressBar.tsx`

**Funkciók:**
- ✅ Téma-aware színezés (primary, success, warning, danger variánsok)
- ✅ Animált progress bar shimmer effekttel
- ✅ Különböző méretek (small, medium, large)
- ✅ Opcionális label és százalék megjelenítés
- ✅ Gradient és neon témák támogatása
- ✅ Smooth animációk (cubic-bezier easing)

**Tesztelés:**
- [ ] Progress bar megjelenik
- [ ] Progress érték frissül
- [ ] Minden téma esetén működik
- [ ] Shimmer animáció működik
- [ ] Különböző variánsok és méretek működnek

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre és integrálásra

---

### 🟢 KÖZEPES PRIORITÁS (Kényelmi funkciók)

#### 6. Kedvenc filamentek funkció
**Prioritás:** 🟢 KÖZEPES  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Kedvenc filamentek jelölése és szűrése  
**Módosítások:**
- `frontend/src/components/Filaments.tsx` - Kedvenc funkció hozzáadása
- `frontend/src/types.ts` - favorite mező hozzáadása
- `frontend/src/utils/languages/*.ts` - Fordítások hozzáadása

**Funkciók:**
- ✅ favorite mező hozzáadva a Filament típushoz
- ✅ Csillag ikon a táblázatban kedvenc jelöléshez
- ✅ Kedvenc szűrő gomb a kereső mező mellett
- ✅ Toggle favorite funkció
- ✅ Szűrési logika a kedvencekre
- ✅ Téma-aware UI elemek
- ✅ Fordítások (hu, en, de)
- ✅ Logolás a kedvenc váltásokhoz

**Tesztelés:**
- [x] Kedvenc jelölés működik
- [x] Szűrés működik
- [x] Adatok mentve maradnak

**Státusz:** ✅ IMPLEMENTÁLVA ÉS TESZTELVE - Minden funkció működik tökéletesen

---

#### 7. Breadcrumb navigáció
**Prioritás:** 🟢 KÖZEPES  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Breadcrumb navigáció komponens  
**Fájlok:**
- `frontend/src/components/Breadcrumb.tsx`
- `frontend/src/components/Header.tsx` - Breadcrumb integráció
- `frontend/src/App.tsx` - activePage és themeStyles prop-ok
- `frontend/src/utils/languages/*.ts` - Fordítások

**Funkciók:**
- ✅ Breadcrumb komponens létrehozva
- ✅ Header komponensbe integrálva
- ✅ Téma-aware színezés
- ✅ Kattintható breadcrumb elemek (Home mindig kattintható)
- ✅ Automatikus breadcrumb generálás az oldal alapján
- ✅ Fordítások hozzáadva (hu, en, de)
- ✅ Accessibility támogatás (aria-label, aria-current)

**Tesztelés:**
- [ ] Breadcrumb megjelenik
- [ ] Navigáció működik
- [ ] Minden oldal esetén helyes

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

#### 8. Gyors műveletek gombok a header-ben
**Prioritás:** 🟢 KÖZEPES  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Gyors műveletek gombok a header-ben  
**Módosítások:**
- `frontend/src/components/Header.tsx` - Gyors műveletek gombok
- `frontend/src/App.tsx` - quickActionTrigger state és logika
- `frontend/src/components/Filaments.tsx` - triggerAddForm prop és useEffect
- `frontend/src/components/Printers.tsx` - triggerAddForm prop és useEffect
- `frontend/src/components/Customers.tsx` - triggerAddForm prop és useEffect
- `frontend/src/utils/languages/*.ts` - Fordítások hozzáadva
- `frontend/src/index.css` - CSS linter hiba javítva

**Funkciók:**
- ✅ Dinamikus gombok az aktuális oldal alapján
- ✅ Automatikus form megnyitás (Filaments, Printers, Customers)
- ✅ Navigáció a megfelelő oldalra
- ✅ Téma-aware színezés és tooltip támogatás
- ✅ triggerAddForm prop hozzáadva a komponensekhez
- ✅ Fordítások hozzáadva minden nyelvhez (13 nyelv)

**Tesztelés:**
- [x] Gombok megjelennek
- [x] Műveletek működnek
- [x] Minden téma esetén működik
- [x] Automatikus form megnyitás működik

**Státusz:** ✅ IMPLEMENTÁLVA ÉS TESZTELVE - Minden funkció működik tökéletesen

---

### 🔵 ALACSONY PRIORITÁS (Haladó funkciók)

#### 9. Globális keresés (Command Palette)
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** Nincs  
**Leírás:** Globális keresés Ctrl/Cmd+K billentyűkombinációval  
**Fájlok:**
- `frontend/src/components/GlobalSearch.tsx`
- `frontend/src/App.tsx` - GlobalSearch integráció
- `frontend/src/utils/languages/*.ts` - Fordítások hozzáadva

**Funkciók:**
- ✅ Ctrl/Cmd+K billentyűkombinációval megnyitható
- ✅ Keresés oldalakban és gyors műveletekben
- ✅ Billentyűzet navigáció (↑↓, Enter, Esc)
- ✅ Téma-integráció
- ✅ Fix méretű beviteli mező (nem lóg ki)
- ✅ Fordítások hozzáadva minden nyelvhez (13 nyelv)
- ✅ Integrálva az App.tsx-be

**Tesztelés:**
- [x] Keresés megnyílik Ctrl/Cmd+K-val
- [x] Keresés működik
- [x] Eredmények helyesek
- [x] Navigáció működik
- [x] Beviteli mező fix méretű és nem lóg ki

**Státusz:** ✅ IMPLEMENTÁLVA ÉS TESZTELVE - Minden funkció működik tökéletesen

---

#### 10. Undo/Redo funkció Filaments komponensben
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** undoRedo utility  
**Leírás:** Undo/Redo funkció Filaments komponensben  
**Fájlok:**
- `frontend/src/utils/undoRedo.ts`
- `frontend/src/hooks/useUndoRedo.ts`
- `frontend/src/components/Filaments.tsx` - Undo/Redo integráció

**Tesztelés:**
- [ ] Undo működik (Ctrl/Cmd+Z)
- [ ] Redo működik (Ctrl/Cmd+Shift+Z)
- [ ] Történet helyes
- [ ] Adatok helyesek

---

#### 11. Bulk műveletek filamentekhez
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** Nincs  
**Leírás:** Kijelölés, tömeges törlés filamentekhez  
**Módosítások:**
- `frontend/src/components/Filaments.tsx` - Bulk műveletek

**Tesztelés:**
- [ ] Kijelölés működik
- [ ] Select all működik
- [ ] Tömeges törlés működik
- [ ] Adatok helyesek

---

#### 12. Moduláris betöltési rendszer
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐⭐ Nagyon magas  
**Függőségek:** Nincs  
**Leírás:** Moduláris betöltési rendszer AppLoader-rel  
**Fájlok:**
- `frontend/src/utils/moduleLoader.ts`
- `frontend/src/components/AppLoader.tsx`
- `frontend/src/main.tsx` - AppLoader integráció
- `frontend/src/App.tsx` - Lazy loading

**⚠️ FIGYELEM:** Ez a funkció okozhatta a white screen problémát!

**Tesztelés:**
- [ ] AppLoader megjelenik
- [ ] Modulok betöltődnek
- [ ] App komponens betöltődik
- [ ] Nincs white screen

---

#### 13. Színkontraszt utility WCAG AA/AAA ellenőrzéssel
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** Nincs  
**Leírás:** Színkontraszt ellenőrzés és javítás  
**Fájlok:**
- `frontend/src/utils/colorContrast.ts`
- `frontend/src/utils/themeContrastChecker.ts`
- `frontend/src/utils/themes.ts` - Kontraszt ellenőrzés integráció

**Tesztelés:**
- [ ] Kontraszt ellenőrzés működik
- [ ] Automatikus javítás működik
- [ ] Minden téma esetén működik

---

### 🔐 BIZTONSÁGI PRIORITÁS (v1.1.0 funkciók)

#### 14. Customer data encryption
**Prioritás:** 🔐 BIZTONSÁGI  
**Komplexitás:** ⭐⭐⭐⭐ Nagyon magas  
**Függőségek:** Backend encryption  
**Leírás:** AES-256-GCM titkosítás ügyfelek adatainak  
**Fájlok:**
- `src-tauri/src/encryption.rs`
- `frontend/src/components/PasswordDialog.tsx`
- `src-tauri/src/commands.rs` - Encryption commands
- `frontend/src/components/Settings.tsx` - Encryption beállítások

**Tesztelés:**
- [ ] Titkosítás működik
- [ ] Dekriptálás működik
- [ ] Jelszó kezelés működik
- [ ] Adatok biztonságosak

---

#### 15. Undo/Redo funkcionalitás minden komponensben
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** undoRedo utility  
**Leírás:** Undo/Redo Customers, Offers, Printers komponensekben  
**Módosítások:**
- `frontend/src/components/Customers.tsx`
- `frontend/src/components/Offers.tsx`
- `frontend/src/components/Printers.tsx`

**Tesztelés:**
- [ ] Minden komponensben működik
- [ ] Keyboard shortcuts működnek
- [ ] Adatok helyesek

---

#### 16. Bulk műveletek minden komponensben
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** Nincs  
**Leírás:** Bulk műveletek Customers, Offers, Printers komponensekben  
**Módosítások:**
- `frontend/src/components/Customers.tsx`
- `frontend/src/components/Offers.tsx`
- `frontend/src/components/Printers.tsx`

**Tesztelés:**
- [ ] Minden komponensben működik
- [ ] Kijelölés működik
- [ ] Tömeges törlés működik

---

#### 17. Optimistic UI updates
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐⭐ Magas  
**Függőségek:** Nincs  
**Leírás:** Optimistic UI updates hook  
**Fájlok:**
- `frontend/src/hooks/useOptimisticUpdate.ts`
- `frontend/src/components/Filaments.tsx` - Optimistic UI integráció

**Tesztelés:**
- [ ] UI azonnal frissül
- [ ] Háttérben mentés működik
- [ ] Hiba esetén rollback működik

---

#### 18. Oszlop kezelés Printers komponensben
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Oszlop elrejtés/megjelenítés funkció  
**Módosítások:**
- `frontend/src/components/Printers.tsx`

**Tesztelés:**
- [ ] Oszlop elrejtés működik
- [ ] Oszlop megjelenítés működik
- [ ] Beállítások mentve maradnak

---

#### 19. Táblázat rendezés Printers komponensben
**Prioritás:** 🔵 ALACSONY  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Táblázat rendezés implementálása  
**Módosítások:**
- `frontend/src/components/Printers.tsx`

**Tesztelés:**
- [ ] Rendezés működik
- [ ] Rendezés iránya vált
- [ ] Teljesítmény rendben

---

## 📝 Implementációs folyamat

### Lépések:

1. **CSS javítások** ✅ KÉSZ
   - [x] index.css javítva
   - [x] App.css javítva

2. **Funkció implementálása sorban:**
   - [ ] Funkció kiválasztása a prioritási listából
   - [ ] Fájlok létrehozása/módosítása
   - [ ] Implementáció
   - [ ] Tesztelés
   - [ ] Ha probléma van → dokumentálás és visszaállítás
   - [ ] Ha működik → következő funkció

3. **Minden funkció után:**
   - [ ] Alkalmazás újraindítása
   - [ ] White screen ellenőrzés
   - [ ] Funkció működésének ellenőrzése
   - [ ] Témák ellenőrzése

---

## 🎯 Következő lépés

**1. funkció:** Empty State komponens ✅ KÉSZ

**2. funkció:** Automatikus mentés visszajelzés (🔴 KRITIKUS prioritás)

---

**Készítve:** 2025-11-20  
**Verzió:** v0.6.0 (stabil alap)

