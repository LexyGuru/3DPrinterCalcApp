# Funkció implementációs terv - Prioritási sorrend

**Dátum:** 2025-11-20  
**Alapverzió:** v0.6.0 (stabil, működő)  
**Cél:** Egyesével implementálni a törölt funkciókat, hogy kiderüljön, mi okozza a problémát

---

## ✅ Előfeltételek - CSS javítások

### 1. CSS háttérszín konfliktusok javítása ✅ KÉSZ
- [x] `index.css` - Eltávolítva rögzített fehér háttérszínek `!important`-tal
- [x] `App.css` - Eltávolítva rögzített fehér háttérszín
- [x] Media query - Eltávolítva rögzített fehér háttérszín
- [x] Select és input mezők - Eltávolítva rögzített fehér háttérszínek

**Státusz:** ✅ CSS fájlok javítva - a háttérszínt most a témarendszer kezeli

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
- [ ] Témák - minden téma esetén működik-e (tesztelendő)

**Státusz:** ✅ IMPLEMENTÁLVA - Készen áll a tesztelésre

---

#### 2. Automatikus mentés visszajelzés
**Prioritás:** 🔴 KRITIKUS  
**Komplexitás:** ⭐ Alacsony  
**Függőségek:** Nincs  
**Leírás:** Last saved timestamp megjelenítése a header-ben  
**Módosítások:**
- `frontend/src/components/Header.tsx` - Last saved timestamp hozzáadása
- `frontend/src/App.tsx` - Last saved state kezelése

**Tesztelés:**
- [ ] Mentés után timestamp frissül
- [ ] Timestamp formátuma helyes
- [ ] Minden téma esetén látható

---

### 🟡 MAGAS PRIORITÁS (Hasznos funkciók)

#### 3. Tooltip komponens fejlesztése
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Tooltip komponens fejlesztése TooltipContext-tel  
**Fájlok:**
- `frontend/src/contexts/TooltipContext.tsx`
- `frontend/src/components/Tooltip.tsx` - módosítás

**Tesztelés:**
- [ ] Tooltip megjelenik hover esetén
- [ ] Tooltip pozíciója helyes
- [ ] Minden téma esetén működik

---

#### 4. Kártyák hover effektek
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐ Alacsony  
**Függőségek:** Nincs  
**Leírás:** Kártya komponens hover animációkkal  
**Fájlok:**
- `frontend/src/components/Card.tsx`

**Tesztelés:**
- [ ] Hover animáció működik
- [ ] Minden téma esetén működik
- [ ] Teljesítmény rendben

---

#### 5. Progress Bar komponens
**Prioritás:** 🟡 MAGAS  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Progress bar komponens PDF export-hoz és import műveletekhez  
**Fájlok:**
- `frontend/src/components/ProgressBar.tsx`

**Tesztelés:**
- [ ] Progress bar megjelenik
- [ ] Progress érték frissül
- [ ] Minden téma esetén működik

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

**Tesztelés:**
- [ ] Kedvenc jelölés működik
- [ ] Szűrés működik
- [ ] Adatok mentve maradnak

---

#### 7. Breadcrumb navigáció
**Prioritás:** 🟢 KÖZEPES  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Breadcrumb navigáció komponens  
**Fájlok:**
- `frontend/src/components/Breadcrumb.tsx`
- `frontend/src/components/Header.tsx` - Breadcrumb integráció

**Tesztelés:**
- [ ] Breadcrumb megjelenik
- [ ] Navigáció működik
- [ ] Minden oldal esetén helyes

---

#### 8. Gyors műveletek gombok a header-ben
**Prioritás:** 🟢 KÖZEPES  
**Komplexitás:** ⭐⭐ Közepes  
**Függőségek:** Nincs  
**Leírás:** Gyors műveletek gombok a header-ben  
**Módosítások:**
- `frontend/src/components/Header.tsx` - Gyors műveletek gombok

**Tesztelés:**
- [ ] Gombok megjelennek
- [ ] Műveletek működnek
- [ ] Minden téma esetén működik

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

**Tesztelés:**
- [ ] Keresés megnyílik Ctrl/Cmd+K-val
- [ ] Keresés működik
- [ ] Eredmények helyesek
- [ ] Navigáció működik

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

