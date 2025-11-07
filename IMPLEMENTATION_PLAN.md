# Implementációs terv - Új funkciók

**Dátum**: 2025. január  
**Verzió**: v0.3.9 után

## 📋 Prioritásos funkciók implementálása

### Fázis 1: Keresés és szűrés fejlesztése ✅ (Kezdés)
**Prioritás**: 🔴 Magas  
**Becsült idő**: 6-8 óra  
**Komplexitás**: Közepes

#### Funkciók:
1. ✅ Speciális szűrők
   - Ár tartomány (min-max)
   - Dátum tartomány (kezdő-vég dátum)
   - Profit tartomány (min-max százalék)
   - Ügyfél név alapján
   - Nyomtató alapján
   
2. ✅ Többszörös kiválasztás
   - Több filament típus egyszerre
   - Több nyomtató egyszerre
   
3. ✅ Mentett szűrők (preset-ek)
   - Szűrő mentése nevesített preset-ként
   - Preset betöltése
   - Preset törlése
   - Alapértelmezett preset-ek (ma, tegnap, ezen a héten, ebben a hónapban)
   
4. ✅ Gyors szűrők gombok
   - Ma
   - Tegnap
   - Ezen a héten
   - Ebben a hónapban
   - Utolsó 7 nap
   - Utolsó 30 nap
   
5. ✅ Export szűrt eredményeket
   - Export csak a szűrt árajánlatokat
   - CSV export szűrt eredményekkel
   - JSON export szűrt eredményekkel

---

### Fázis 2: Filamentek kép feltöltés ✅ (Befejezve)
**Prioritás**: 🔴 Magas  
**Becsült idő**: 6-8 óra  
**Komplexitás**: Közepes

#### Funkciók:
1. ✅ Kép feltöltés filamentekhez
   - Kép kiválasztása fájlrendszerből
   - Kép tárolás lokálisan (base64 vagy fájl path)
   - Kép optimalizálás (átméretezés, kompresszió)
   
2. ✅ Kép megjelenítés
   - Kép megjelenítés listában (thumbnail)
   - Kép megjelenítés részletes nézetben
   - Kép törlése
   
3. ✅ Kép export PDF-ben
   - Kép hozzáadása PDF-hez
   - Kép pozicionálása PDF-ben (alap képtábla integráció v0.3.9)

---

### Fázis 3: PDF export fejlesztése ✅ (Befejezve)
**Prioritás**: 🔴 Magas  
**Becsült idő**: 8-12 óra  
**Komplexitás**: Közepes

#### Funkciók:
1. ✅ Céges információk blokk (cégnév, cím, adószám, bankszámlaszám, elérhetőség)
   - ✅ Logó feltöltés és optimalizálás
   - ✅ Adatok automatikus megjelenítése a PDF fejlécében
   
2. ✅ PDF template-ek
   - ✅ Minimalista template
   - ✅ Professzionális template
   - ✅ Modern/“színes” template
   - ✅ Template választó felület
   
3. ✅ PDF preview
   - ✅ Előnézet mentés/export előtt dedikált gombbal
   - ✅ Módosítás nélküli vizuális ellenőrzés (élő HTML megjelenítés)

---

### Fázis 4: Árajánlat státusz követés
**Prioritás**: 🟡 Közepes  
**Becsült idő**: 8-10 óra  
**Komplexitás**: Közepes

#### Funkciók:
1. Státuszok
   - ✅ Tervezés
   - ✅ Küldve
   - ✅ Elfogadva
   - ✅ Elutasítva
   - ✅ Befejezve
   
2. Státusz kezelés
   - ✅ Státusz változtatás
   - ✅ Státusz változtatás megjegyzéssel (modal) – v0.3.9
   - ✅ Státusz gyorsszűrők és státusz szerinti listázás (Offers oldalon) – v0.3.9
   - ✅ Státusz változás dátum követés egységesen a listanézetben – v0.3.9
   
3. Státusz statisztikák & dashboard
   - ✅ Státusz összefoglaló kártyák (számláló, utolsó frissítés, gyorsszűrők) – v0.3.9
   - ✅ Legutóbbi státuszváltások idővonala – v0.3.9
   - ⬜ Státusz riporter export (CSV/JSON)

---

### Fázis 5: Statisztikák grafikonok bővítése
**Prioritás**: 🔴 Magas  
**Becsült idő**: 10-14 óra  
**Komplexitás**: Magas

#### Funkciók:
1. ✅ Időbeli trend grafikonok – v0.3.9
   - ✅ Bevétel trend – v0.3.9
   - ✅ Költség trend – v0.3.9
   - ✅ Profit trend – v0.3.9
   
2. ✅ Diagramok – v0.3.9
   - ✅ Filament típusok szerinti bontás (torta diagram)
   - ✅ Nyomtató szerinti bontás (oszlop diagram)
   - ✅ Havi/havi összehasonlítás grafikon (heti/havi/éves trend összehasonlítás)
   
3. ✅ Export – v0.3.9
   - ✅ Export grafikonok képként (PNG, SVG)
   - ✅ Export grafikonok PDF-be

---

## 🚀 Implementációs sorrend

1. ✅ **Keresés és szűrés fejlesztése** (Fázis 1)
2. ✅ **Filamentek kép feltöltés** (Fázis 2)
3. ✅ **PDF export fejlesztése** (Fázis 3)
4. **Árajánlat státusz követés** (Fázis 4)
5. ✅ **Statisztikák grafikonok bővítése** (Fázis 5)

---

## 📝 Megjegyzések

- Minden fázis után commit és tesztelés
- Dokumentáció frissítése minden új funkció után
- Verzió növelés a jelentős változások után

---

**Utolsó frissítés**: 2025. január (v0.3.9)

