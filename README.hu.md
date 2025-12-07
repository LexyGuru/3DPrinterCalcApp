# 🖨️ 3D Printer Calculator App

> **🌍 Nyelv választás**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Egy modern, desktop alkalmazás 3D nyomtatási költségszámításra. Tauri v2-vel készült, React frontend-del és Rust backend-del.

## ✨ Funkciók

- 📊 **Költségszámítás** - Automatikus számítás filament, áram, szárítás és kopás költségekből
- 🧵 **Filament kezelés** - Hozzáadás, szerkesztés, törlés filamentekhez (márka, típus, szín, ár)
- 🖨️ **Nyomtató kezelés** - Nyomtatók és AMS rendszerek kezelése
- 💰 **Profit számítás** - Választható profit százalék (10%, 20%, 30%, 40%, 50%)
- 📄 **Árajánlatok** - Mentés, kezelés és PDF export árajánlatokhoz (ügyfél név, elérhetőség, leírás)
- 📅 **Naptár integráció** - Nyomtatás esedékességi dátumok beállítása árajánlatokhoz, naptár nézet az elfogadott/kész/elutasított árajánlatokkal, státusz jelzések (elfogadva ✅, elutasítva ❌, befejezve ✔️), esedékes nyomtatások listája (ma és holnap), lejárt nyomtatások jelzése
- 🧠 **Szűrő presetek** - Árajánlat szűrők mentése, gyors presetek alkalmazása, dátum/idő alapú automatikus filterek
- 🗂️ **Státusz dashboard** - Státusz kártyák, gyors szűrők és idővonal a legutóbbi státuszváltozásokról
- 📝 **Státusz megjegyzések** - Minden státuszváltás opcionális jegyzettel és előzmény naplózással
- 👁️ **PDF előnézet és sablonok** - Beépített PDF előnézet, választható sablonok és céges branding blokkok
- 🎨 **Filament színkönyvtár** - Több mint 12,000 gyári szín, márka és típus szerinti rögzíthető választópanellel
- 💾 **Filament könyvtár szerkesztő** - Modal alapú hozzáadás/szerkesztés, duplikátum-figyelmeztetés és tartós mentés `filamentLibrary.json` fájlba
- 🖼️ **Filament képek PDF-ben** - Filament logók és színminták megjelenítése a generált PDF-ben
- 🧾 **G-code import és piszkozat készítés** - A kalkulátorban modális ablakból tölthető be G-code/JSON export (Prusa, Cura, Orca, Qidi), részletes összefoglalóval és automatikus árajánlat piszkozat generálással
- 📈 **Statisztikák** - Összefoglaló dashboard filament fogyasztásról, bevételről, profitról
- 👥 **Ügyfél adatbázis** - Ügyfelek kezelése kapcsolattartási adatokkal, cégadatokkal és árajánlat statisztikákkal
- 🔒 **Ügyféladat titkosítás** - AES-256-GCM titkosítás ügyféladatokhoz, GDPR/EU-szabályoknak megfelelő adatvédelem, opcionális jelszavas védelem
- 📊 **Ár előzmények és trendek** - Filament ár változások követése grafikonokkal és statisztikákkal
- 🌍 **Többnyelvű** - Teljes fordítás magyar, angol, német, francia, egyszerűsített kínai, cseh, spanyol, olasz, lengyel, portugál, szlovák, ukrán és orosz nyelveken (13 nyelv, összesen 850+ fordítási kulcs minden nyelven)
- 💱 **Több pénznem** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 pénznem)
- 🔄 **Automatikus frissítések** - Ellenőrzi a GitHub Releases-t új verziókért
- 🧪 **Beta verziók** - Beta branch és beta buildelés támogatás
- ⚙️ **Beta ellenőrzés** - Beállítható, hogy ellenőrizze-e a beta verziókat
- 🎨 **Responsive layout** - Az alkalmazás minden eleme dinamikusan alkalmazkodik az ablakmérethez
- ✅ **Megerősítő dialógusok** - Törlés előtt megerősítés kérése
- 🔔 **Toast értesítések** - Sikeres műveletek után értesítések
- 🔍 **Keresés és szűrés** - Filamentek, nyomtatók és árajánlatok keresése
- 🔎 **Online ár-összehasonlítás** - Egy kattintással Google/Bing találatokat nyitsz a kiválasztott filamenthez, az ár azonnal frissíthető
- 📋 **Duplikálás** - Árajánlatok könnyű duplikálása
- 🖱️ **Drag & Drop** - Árajánlatok, filamentek és nyomtatók átrendezése húzással
- 📱 **Kontextus menük** - Jobb klikk menük gyors műveletekhez (szerkesztés, törlés, duplikálás, export)
- 🍎 **Platform-specifikus funkciók** - macOS Dock badge, natív értesítések, system tray integráció

## 🌿 Branch struktúra

- **`main`**: Stabil release verziók (RELEASE build)
- **`beta`**: Beta verziók és fejlesztések (BETA build)

A `beta` branch pusholásakor automatikusan lefut a GitHub Actions workflow, ami buildeli a beta verziót.

## 📋 Verziótörténet

A részletes verziótörténetet a [RELEASE.hu.md](RELEASE.hu.md) fájlban találod meg, amely tartalmazza az összes változást v0.1.55-től a legújabb verzióig.

---

**Verzió**: 3.0.2

Ha bármilyen kérdésed van vagy hibát találsz, nyiss egy issue-t a GitHub repository-ban!

