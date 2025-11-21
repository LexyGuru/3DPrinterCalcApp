# Changelog: v0.6.0 → v1.1.0

**Dátum:** 2025-11-20  
**Visszaállított verzió:** v0.6.0 (de9a5cf)  
**Utolsó verzió:** v1.1.0 (cbeaf6e)

---

## 📋 Összefoglalás

Ez a dokumentum tartalmazza az összes változtatást, kiegészítést és fejlesztést, ami a **v0.6.0** és **v1.1.0** verziók között történt.

**Fontos:** A v0.6.0 verzió teljesen működött, ezért erre állítottuk vissza az alkalmazást.

---

## 🗑️ Törölt fájlok (v0.6.0 után hozzáadva)

### Frontend komponensek
- `frontend/src/components/AppLoader.tsx` ✅ TÖRÖLVE
- `frontend/src/components/Breadcrumb.tsx` ✅ TÖRÖLVE
- `frontend/src/components/Card.tsx` ✅ TÖRÖLVE
- `frontend/src/components/EmptyState.tsx` ✅ TÖRÖLVE
- `frontend/src/components/GlobalSearch.tsx` ✅ TÖRÖLVE
- `frontend/src/components/ProgressBar.tsx` ✅ TÖRÖLVE
- `frontend/src/components/PasswordDialog.tsx` ✅ TÖRÖLVE

### Frontend hooks
- `frontend/src/hooks/useUndoRedo.ts` ✅ TÖRÖLVE
- `frontend/src/hooks/useOptimisticUpdate.ts` ✅ TÖRÖLVE

### Frontend contexts
- `frontend/src/contexts/TooltipContext.tsx` ✅ TÖRÖLVE

### Frontend utils
- `frontend/src/utils/colorContrast.ts` ✅ TÖRÖLVE
- `frontend/src/utils/moduleLoader.ts` ✅ TÖRÖLVE
- `frontend/src/utils/themeContrastChecker.ts` ✅ TÖRÖLVE
- `frontend/src/utils/undoRedo.ts` ✅ TÖRÖLVE

### Backend (Rust)
- `src-tauri/src/encryption.rs` ✅ TÖRÖLVE
- `src-tauri/src/logger.rs` ✅ TÖRÖLVE

### Dokumentáció
- `MODULE_SYSTEM.md` ✅ TÖRÖLVE
- `UX_IMPLEMENTATION_STATUS.md` ✅ TÖRÖLVE
- `UX_IMPROVEMENTS.md` ✅ TÖRÖLVE

---

## 🚀 v0.6.0 → v1.0.0 változtatások

### Főbb funkciók

1. **Moduláris betöltési rendszer** ❌ TÖRÖLVE
2. **Gyors műveletek gombok a header-ben** ❌ TÖRÖLVE
3. **Breadcrumb navigáció** ❌ TÖRÖLVE
4. **Globális keresés (Command Palette)** ❌ TÖRÖLVE
5. **Undo/Redo funkció Filaments komponensben** ❌ TÖRÖLVE
6. **Bulk műveletek filamentekhez** ❌ TÖRÖLVE
7. **Kedvenc filamentek funkció** ❌ TÖRÖLVE
8. **Progress Bar komponens PDF export-hoz** ❌ TÖRÖLVE
9. **Empty states javítása** ❌ TÖRÖLVE
10. **Automatikus mentés visszajelzés** ❌ TÖRÖLVE
11. **Tooltip komponens fejlesztése** ❌ TÖRÖLVE
12. **Kártyák hover effektek** ❌ TÖRÖLVE
13. **Színkontraszt utility WCAG AA/AAA ellenőrzéssel** ❌ TÖRÖLVE
14. **Teljes i18n támogatás** ❌ TÖRÖLVE
15. **Verzió frissítve v1.0.0-ra** ❌ TÖRÖLVE

---

## 🚀 v1.0.0 → v1.1.0 változtatások

### Főbb funkciók

1. **Customer data encryption** 🔐 ❌ TÖRÖLVE
2. **Undo/Redo funkcionalitás minden komponensben** ❌ TÖRÖLVE
3. **Bulk műveletek minden komponensben** ❌ TÖRÖLVE
4. **Optimistic UI updates** ❌ TÖRÖLVE
5. **ProgressBar integrálása import műveletekhez** ❌ TÖRÖLVE
6. **Színkontraszt ellenőrzés WCAG AA szabvány szerint** ❌ TÖRÖLVE
7. **Oszlop kezelés Printers komponensben** ❌ TÖRÖLVE
8. **Táblázat rendezés Printers komponensben** ❌ TÖRÖLVE
9. **Input mezők méreteinek javítása** ❌ TÖRÖLVE
10. **macOS értesítési figyelmeztetés** ❌ TÖRÖLVE
11. **Header és nyelvválasztás layout javítása** ❌ TÖRÖLVE
12. **Tutorial overlay pointer events** ❌ TÖRÖLVE
13. **Verziószámozási stratégia dokumentálása** ❌ TÖRÖLVE

---

## 🐛 Ismert problémák

### White Screen probléma ⚠️ KRITIKUS

**Jelenség:** Az alkalmazás nem tölt be, fehér képernyő jelenik meg

**Okok:**
- CSS háttérszín konfliktusok - Rögzített fehér háttérszínek `!important`-tal
- Modul betöltési probléma - AppLoader nem hívja meg az onLoadComplete callback-et
- Tauri konfiguráció változtatások - distDir vs frontendDist
- CSP konfiguráció - Content Security Policy túl szigorú lehet

**Megjegyzés:** A probléma már a v1.0.0-ban is jelen volt!

---

## 🔄 Visszaállítás

**Visszaállított verzió:** v0.6.0 (de9a5cf)  
**Dátum:** 2025-11-20  
**Ok:** White screen probléma és egyéb kompatibilitási problémák

A v0.6.0 verzió teljesen működött, ezért erre állítottuk vissza az alkalmazást.

**Minden v0.6.0 után hozzáadott fájl törölve!** ✅

---

## 📝 Megjegyzések

- A v1.0.0 és v1.1.0 verziók sok hasznos funkciót tartalmaztak, de a white screen probléma miatt nem használhatók
- A jövőbeli fejlesztéseknél figyelni kell a CSS konfliktusokra és a modul betöltési problémákra
- A v0.6.0 verzió stabil alapot biztosít a további fejlesztésekhez

---

**Készítve:** 2025-11-20  
**Verzió:** v0.6.0 (visszaállítva)  
**Státusz:** ✅ Minden v0.6.0 után hozzáadott fájl törölve
