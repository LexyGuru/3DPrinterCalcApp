# Kizárt fejlesztések - 3DPrinterCalcApp

Ez a dokumentum tartalmazza azokat a fejlesztéseket, amelyeket **NEM** implementálunk a jelenlegi verzióban. Ezeket a funkciókat később vagy soha nem tervezzük hozzáadni.

**Dátum**: 2025. január  
**Verzió**: v0.3.9 után

---

## 🔴 Kizárt fejlesztések

### 1. **Árajánlatok email küldés**
- **Mit**: 
  - Email küldés közvetlenül az alkalmazásból
  - Email template testreszabás
  - Több címzett támogatás (CC, BCC)
  - Email küldés előzmények (mikor küldtük, kinek)
  - Email státusz követés (kiküldve, olvasva)
- **Előny**: Könnyebb kommunikáció ügyfelekkel
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas
- **Kizárás oka**: 
  - Komplex implementáció (SMTP konfiguráció, email szerver)
  - Biztonsági kockázatok (jelszavak tárolása, spam védelem)
  - Alternatíva: PDF export és manuális email küldés
  - Email státusz követés (read receipts) nem megbízható

---

### 2. **Dark mode automatikus váltás**
- **Mit**: 
  - Rendszer alapú dark/light mode váltás
  - Időzített téma váltás (pl. este automatikusan dark mode)
  - Smooth transition animációk téma váltáskor
  - Téma előnézet előtti mentés
- **Előny**: Jobb felhasználói élmény, automatikus adaptáció
- **Becsült idő**: 4-6 óra
- **Komplexitás**: Alacsony
- **Kizárás oka**: 
  - Jelenleg már van manuális téma választás (11 téma)
  - A felhasználók jobban szeretik, ha ők választják ki a témát
  - Rendszer integráció platform specifikus (macOS, Windows, Linux külön implementáció)
  - Időzített váltás nem minden felhasználónak kívánatos

---

### 3. **AI segítség**
- **Mit**: 
  - AI árazás ajánlások (hasonló projektek alapján)
  - AI leírás generálás
  - AI optimalizálás javaslatok
  - AI hiba javítás javaslatok
- **Előny**: Okosabb alkalmazás, automatizálás
- **Becsült idő**: 16-20 óra
- **Komplexitás**: Magas
- **Kizárás oka**: 
  - Nagy komplexitás (AI modell integráció, API költségek)
  - Felhasználói adatok küldése külső szolgáltatásoknak (privacy kérdések)
  - API költségek (OpenAI, Anthropic, stb.)
  - Nem garantált pontosság
  - Alternatíva: Template-ek és előre definiált beállítások

---

### 4. **Analytics (opcionális)**
- **Mit**: 
  - Használati statisztikák (anonym módon)
  - Mit mérj: Mely funkciókat használják a legtöbbet, hol vannak problémák
  - Felhasználói viselkedés követése
  - Error tracking és crash reporting
  - Performance metrikák
- **Előny**: Adat-alapú fejlesztési döntések
- **Becsült idő**: 8-12 óra
- **Komplexitás**: Magas
- **Kizárás oka**: 
  - GDPR szabályozás, privacy policy szükséges
  - Felhasználói adatok gyűjtése (bár anonym, még mindig érzékeny)
  - Külső szolgáltatások függősége (Google Analytics, Mixpanel, stb.)
  - Felhasználói megbízhatóság (sokan nem szeretnek tracked lenni)
  - Alternatíva: Visszajelzések GitHub Issues-on keresztül

---

### 5. **Accessibility (a11y) javítások továbbfejlesztése**
- **Mit**: 
  - ARIA labels hozzáadása minden interaktív elemhez
  - Keyboard navigation javítása (Tab, Enter, Escape, Arrow keys)
  - Screen reader támogatás (NVDA, JAWS, VoiceOver)
  - Színkontraszt javítása (WCAG AA/AAA szabvány)
  - Fokusus indikátorok javítása
  - Skip to content linkek
- **Előny**: Akadálymentes használat, szélesebb felhasználói bázis, jogi megfelelőség
- **Becsült idő**: 6-8 óra
- **Komplexitás**: Közepes
- **WCAG szabvány**: Minimum AA szint (4.5:1 kontraszt arány)
- **Kizárás oka**: 
  - Jelenlegi alkalmazás már alapvetően elérhető (keyboard navigation, kontrasztok)
  - Desktop alkalmazás, nem web app (kevesebb jogi követelmény)
  - Kisebb felhasználói bázis (3D printing közösség)
  - Későbbi verzióban lehet implementálni, ha szükséges
  - **Megjegyzés**: Alapvető accessibility funkciók (keyboard navigation, kontrasztok) továbbra is fontosak és megmaradnak

---

### 6. **Responsive design továbbfejlesztése**
- **Mit**: 
  - Tablet és mobil nézet optimalizálás
  - Touch gesture támogatás (swipe, pinch, zoom)
  - Adaptív layout (kisebb ablakméretekhez)
  - Mobile-first design megközelítés
  - Breakpoint optimalizálás
- **Előny**: Jobb felhasználói élmény különböző eszközökön
- **Becsült idő**: 8-10 óra
- **Komplexitás**: Közepes
- **Kizárás oka**: 
  - **Desktop alkalmazás** (Tauri), nem mobil/web app
  - Minimum ablakméret: 1280x720 (optimalizálva desktop használatra)
  - Touch gesture támogatás nem releváns desktop környezetben
  - Tablet/mobil használat nem tipikus 3D printing számításokhoz
  - Jelenlegi responsive design elegendő ablakméretezéshez (resizable ablakok)
  - **Megjegyzés**: Az alkalmazás továbbra is resizable és adaptív, de mobil/tablet optimalizálás nem szükséges

---

### 7. **Cloud sync (opcionális)**
- **Mit**: 
  - Felhő alapú szinkronizálás (Google Drive, Dropbox, OneDrive)
  - Automatikus backup felhőbe
  - Több eszközön használható, adatok szinkronizálása
  - Offline mód támogatás
  - Konfliktus kezelés
- **Előny**: Több eszközön használható, automatikus backup
- **Becsült idő**: 12-16 óra
- **Komplexitás**: Magas
- **Kizárás oka**: 
  - **Privacy kérdések**: Felhasználói adatok (árajánlatok, ügyfél adatok) külső szolgáltatásoknak
  - **GDPR szabályozás**: Adatok tárolása harmadik fél szolgáltatásában
  - **Biztonsági kockázatok**: OAuth integráció, API kulcsok kezelése
  - **Komplexitás**: Konfliktus kezelés, offline mód, szinkronizálási logika
  - **Alternatíva**: 
    - Manuális backup/restore funkció (már implementálva)
    - Export/Import funkciók (már implementálva)
    - Felhasználó dönthet, hogy hol tárolja az adatokat (lokális vagy cloud)
  - **Megjegyzés**: Ha később szükséges, lehet implementálni, de opcionálisan és teljes felhasználói kontrollal

---

## 📝 Megjegyzések

### Miért zárjuk ki ezeket a funkciókat?

1. **Privacy és biztonság**: Email küldés, Cloud sync, Analytics mind érinti a felhasználói adatok védelmét
2. **Komplexitás vs. érték**: Néhány funkció (AI, Analytics) túl komplex az adott értékhez képest
3. **Desktop alkalmazás**: Responsive design továbbfejlesztése nem releváns desktop app esetén
4. **Alternatív megoldások**: A legtöbb kizárt funkcióhoz van alternatíva (PDF export, manuális backup, stb.)
5. **Felhasználói visszajelzések**: Ha később nagyobb igény van ezekre a funkciókra, lehet újra értékelni

### Későbbi értékelés

Ezeket a funkciókat **később is lehet újra értékelni**, ha:
- Nagy felhasználói igény van rájuk
- Technológiai változások megkönnyítik az implementációt
- Privacy/biztonsági szabályozások változnak
- Alternatív megoldások (pl. lokális AI modell) válik elérhetővé

---

## ✅ Helyettük implementált/megmaradt funkciók

### Email küldés helyett:
- ✅ PDF export funkció (már implementálva)
- ✅ Árajánlat megosztás exportált fájlokkal

### Dark mode automatikus váltás helyett:
- ✅ 11 manuális téma választás (már implementálva)
- ✅ Téma azonnali váltás

### AI segítség helyett:
- ✅ Template funkciók (már implementálva)
- ✅ Előre definiált beállítások
- ✅ Kalkulációs sablonok

### Analytics helyett:
- ✅ Console/Log funkció hibakereséshez (már implementálva)
- ✅ Visszajelzések GitHub Issues-on keresztül

### Accessibility továbbfejlesztés helyett:
- ✅ Alapvető keyboard navigation (már implementálva)
- ✅ Színkontrasztok minden témában (már implementálva)

### Responsive design továbbfejlesztés helyett:
- ✅ Resizable ablakok (már implementálva)
- ✅ Adaptív layout (már implementálva)

### Cloud sync helyett:
- ✅ Manuális backup/restore (már implementálva)
- ✅ Export/Import funkciók (már implementálva)
- ✅ Lokális adattárolás (privacy előny)

---

**Utolsó frissítés**: 2025. január (v0.3.9 után)

