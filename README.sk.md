# 🖨️ 3D Printer Calculator App

> **🌍 Výber jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Moderná desktopová aplikácia na výpočet nákladov na 3D tlač. Vytvorená pomocou Tauri v2, React frontendu a Rust backendu.

## ✨ Funkcie

- 📊 **Výpočet nákladov** - Automatický výpočet nákladov na filament, elektrinu, sušenie a opotrebenie
- 🧵 **Správa filamentov** - Pridávanie, úprava, mazanie filamentov (značka, typ, farba, cena)
- 🖨️ **Správa tlačiarní** - Správa tlačiarní a systémov AMS
- 💰 **Výpočet zisku** - Voliteľné percentuálne zisky (10%, 20%, 30%, 40%, 50%)
- 📄 **Ponuky** - Ukladanie, správa a export PDF ponúk (meno zákazníka, kontakt, popis)
- 🧠 **Predvolby filtrov** - Ukladanie filtrov ponúk, aplikácia rýchlych predvolieb, automatické filtre založené na dátum/čas
- 🗂️ **Dashboard stavu** - Karty stavu, rýchle filtre a časová osa nedávnych zmien stavu
- 📝 **Poznámky k stavu** - Každá zmena stavu s voliteľnými poznámkami a protokolovaním histórie
- 👁️ **Náhľad PDF a šablóny** - Vstavaný náhľad PDF, voliteľné šablóny a bloky firemného brandingu
- 🎨 **Knižnica farieb filamentu** - Viac ako 12,000 továrenských farieb s voliteľnými panelmi založenými na značke a type
- 💾 **Editor knižnice filamentov** - Pridávanie/úprava založená na modale, varovania pred duplikátmi a trvalé ukladanie do `filamentLibrary.json`
- 🖼️ **Obrázky filamentov v PDF** - Zobrazenie log filamentov a vzoriek farieb v generovaných PDF
- 🧾 **Import G-code a vytváranie konceptu** - Načítanie exportov G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačke, s podrobným zhrnutím a automatickým generovaním konceptu ponuky
- 📈 **Štatistiky** - Prehľadný dashboard pre spotrebu filamentu, príjmy, zisk
- 🌍 **Viacjazyčnosť** - Úplný preklad do maďarčiny, angličtiny, nemčiny, francúzštiny, zjednodušenej čínštiny, češtiny, španielčiny, taliančiny, poľštiny, portugalčiny, slovenčiny, ukrajinčiny a ruštiny (14 jazykov, 813 prekladových kľúčov na jazyk)
- 💱 **Viaceré meny** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 mien)
- 🔄 **Automatické aktualizácie** - Kontroluje GitHub Releases pre nové verzie
- 🧪 **Beta verzie** - Podpora beta vetvy a beta buildu
- ⚙️ **Kontrola beta** - Konfigurovateľná kontrola beta verzií
- 🎨 **Responzívne rozloženie** - Všetky prvky aplikácie sa dynamicky prispôsobujú veľkosti okna
- ✅ **Potvrdzovacie dialógy** - Žiadosť o potvrdenie pred vymazaním
- 🔔 **Toast notifikácie** - Notifikácie po úspešných operáciách
- 🔍 **Vyhľadávanie a filtrovanie** - Vyhľadávanie filamentov, tlačiarní a ponúk
- 🔎 **Online porovnanie cien** - Jedným kliknutím otvorí výsledky vyhľadávania Google/Bing pre vybraný filament, cena okamžite aktualizovateľná
- 📋 **Duplikácia** - Ľahká duplikácia ponúk
- 🖱️ **Drag & Drop** - Preskupovanie ponúk, filamentov a tlačiarní pretiahnutím
- 📱 **Kontextové menu** - Menu pravého tlačidla pre rýchle akcie (upraviť, vymazať, duplikovať, exportovať)

## 📸 Screenshoty

## 📋 Zoznam zmien (Changelog)

### v1.3.12 (2025) - 🎨 Vylepšenia systému widgetov a mien

- 📊 **Vylepšenia systému widgetov** - Vylepšená funkčnosť widgetov a lokalizácia:
  - Pridané nové widgety: Graf času tlače, Graf štatistík zákazníkov, Graf stavu ponúk
  - Opravená funkčnosť exportu widgetov - všetky grafické widgety teraz exportovateľné ako SVG
  - Dynamický preklad názvov widgetov na základe vybraného jazyka
  - Lokalizované názvy súborov exportu s kompatibilným pomenovaním OS (podčiarkovníky, žiadne špeciálne znaky)
  - Jazyky widgetov sa aktualizujú okamžite po zmene jazyka
  - Toast notifikácie pre úspešné exporty grafov
  - Všetky prvky widgetov a stavy načítania plne preložené vo všetkých 14 jazykoch
- 💱 **Rozšírenie podpory mien** - Rozšírená podpora mien:
  - Pridané meny: GBP (Britská libra), PLN (Poľský zlotý), CZK (Česká koruna), CNY (Čínsky jüan), UAH (Ukrajinská hrivna), RUB (Ruský rubeľ)
  - Symboly a štítky mien pre všetky nové meny
  - Správna konverzia a zobrazenie mien vo všetkých komponentoch
  - Rozbaľovacie menu výberu meny aktualizované všetkými podporovanými menami
- 💰 **Oprava presnosti výpočtu nákladov** - Opravené problémy s presnosťou plávajúcej desatinnej čiarky:
  - Všetky výpočty nákladov (filament, elektrina, sušenie, použitie, celkom) teraz zaokrúhlené na 2 desatinné miesta
  - Eliminované dlhé desatinné zobrazenie (napr. `0.17500000000000002` → `0.18`)
  - Konzistentné formátovanie čísel v celej aplikácii
- 🏢 **Dialóg informácií o spoločnosti** - Vylepšená správa informácií o spoločnosti:
  - Formulár informácií o spoločnosti presunutý do modálneho dialógu (podobne ako Tovar/Filamenty)
  - Tlačidlo "Detaily spoločnosti" pre otvorenie/úpravu informácií o spoločnosti
  - Dialóg možno zavrieť pomocou tlačidla X, kliknutia na pozadie alebo klávesu Escape
  - Lepšie UX s animovanými modálnymi prechodmi
  - Všetky polia informácií o spoločnosti prístupné v organizovanom rozhraní dialógu

### v1.3.11 (2025) - 🎨 Vylepšenia widget dashboardu

- 📊 **Vylepšenia widget dashboardu** - Vylepšená funkčnosť widget dashboardu:
  - Opravené odsadenie a okraje kontajnera widgetov pre lepšie rozloženie od okraja k okraju
  - Vylepšené správanie posúvania - widgety sa teraz správne posúvajú, keď obsah presiahne zobrazenie
  - Opravený problém so zmenšovaním widgetov pri zmene veľkosti okna - widgety si zachovávajú veľkosť vo všetkých bodoch prerušenia
  - Konzistentné rozloženie 12 stĺpcov na všetkých veľkostiach obrazovky
  - Lepšie umiestnenie a rozostupy widgetov
- 🔧 **Opravy rozloženia**:
  - Odstránené pevné odsadenie kontajnera, ktoré bránilo widgetom dosiahnuť okraje aplikácie
  - Opravený výpočet výšky ResponsiveGridLayout pre správne posúvanie
  - Vylepšená správa pretečenia kontajnera
  - Lepšia konzistencia rozloženia skupiny widgetov

### v1.2.1 (2025) - 🎨 Konzistencia UI a správa stĺpcov

- 📊 **Správa stĺpcov filamentov** - Pridaná viditeľnosť a triedenie stĺpcov do komponentu Filamenty:
  - Menu prepínania viditeľnosti stĺpcov (rovnaké ako komponenta Tlačiarne)
  - Triediteľné stĺpce: Značka, Typ, Hmotnosť, Cena/kg
  - Preference viditeľnosti stĺpcov uložené v nastaveniach
  - Konzistentné UI s komponentou Tlačiarne (tlačidlo správy, rozbaľovacie menu, indikátory triedenia)
- 🎨 **Konzistencia farieb motívu** - Vylepšené použitie farieb motívu vo všetkých komponentoch:
  - Všetky tlačidlá a rozbaľovacie menu teraz konzistentne používajú farby motívu (Filamenty, Tlačiarne, Kalkulačka, Cenové trendy)
  - Odstránené hardcodované farby (sivé tlačidlá nahradené primárnou farbou motívu)
  - Komponenta Header sa plne prispôsobuje všetkým motívom a farbám
  - Karta informácií o stave používa farby motívu namiesto hardcodovaných rgba hodnôt
  - Konzistentné efekty hover pomocou themeStyles.buttonHover
- 🔧 **Vylepšenia UI**:
  - Tlačidlo "Spravovať stĺpce" teraz používa primárnu farbu motívu namiesto sekundárnej
  - Rozbaľovacie select menu Cenových trendov používa vhodné štýly fokusu
  - Všetky rozbaľovacie menu stylizované konzistentne s farbami motívu
  - Lepšia vizuálna konzistencia na všetkých stránkach

### v1.1.6 (2025) - 🌍 Úplné pokrytie prekladov

- 🌍 **Preklady tutoriálu** - Pridané chýbajúce prekladové kľúče tutoriálu do všetkých jazykových súborov:
  - 8 nových krokov tutoriálu plne preložených (Panel stavov, Náhľad PDF, Presúvanie, Kontextové menu, História cien, Online porovnanie cien, Export/Import, Zálohovanie/Obnovenie)
  - Celý obsah tutoriálu je teraz dostupný vo všetkých 14 podporovaných jazykoch
  - Kompletný zážitok z tutoriálu v slovenčine, španielčine, francúzštine, taliančine, polštine, portugalčine, ruštine, slovenčine, ukrajinčine a čínštine
- 🎨 **Preklad názvov tém** - Názvy tém sú teraz plne preložené vo všetkých jazykoch:
  - 15 názvov tém pridaných do všetkých jazykových súborov (Svetlý, Tmavý, Modrý, Zelený, Les, Fialový, Oranžový, Pastelový, Antracit, Polnoc, Prelínanie, Neón, Cyberpunk, Západ slnka, Oceán)
  - Názvy tém sa dynamicky načítavajú z prekladového systému namiesto pevne zakódovaných hodnôt
  - Fallback mechanizmus: prekladový kľúč → displayName → názov témy
  - Všetky témy sa teraz zobrazujú v jazyku vybranom používateľom v Nastaveniach

### v1.1.5 (2025) - 🎨 Vylepšenia UI a správa logov

- 🎨 **Prepracovanie dialógu na pridanie filamentu** - Vylepšené dvojstĺpcové rozloženie pre lepšiu organizáciu:
  - Ľavý stĺpec: Základné údaje (Značka, Typ, Hmotnosť, Cena, Nahratie obrázka)
  - Pravý stĺpec: Výber farby so všetkými možnosťami farieb
  - Všetky vstupné polia majú konzistentnú šírku
  - Lepšia vizuálna hierarchia a rozostupy
  - Nahratie obrázka presunuté do ľavého stĺpca pod pole Cena
- 📋 **Správa súborov logov** - Nová sekcia správy logov v nastavení Správy dát:
  - Konfigurovateľné automatické mazanie starých súborov logov (5, 10, 15, 30, 60, 90 dní alebo nikdy)
  - Tlačidlo na otvorenie priečinka logov v správcovi súborov
  - Automatické čistenie pri zmene nastavenia
  - Otváranie priečinkov špecifické pre platformu (macOS, Windows, Linux)
- 📦 **Rozloženie Export/Import** - Sekcie Export a Import sú teraz vedľa seba:
  - Responzívne dvojstĺpcové rozloženie
  - Lepšie využitie priestoru
  - Vylepšená vizuálna rovnováha
- 🍎 **Varovanie o oznámeniach macOS** - Zatvárateľné dialógové okno varovania:
  - Zobrazuje sa len na platforme macOS
  - Dve možnosti zatvorenia: dočasné (tlačidlo X) alebo trvalé (tlačidlo Zatvoriť)
  - Dočasné zatvorenie: skryté len pre aktuálnu reláciu, znovu sa objaví po reštarte
  - Trvalé zatvorenie: uložené v nastavení, nikdy sa znovu neobjaví
  - Jasné vizuálne rozlíšenie medzi typmi zatvorenia

### v1.1.4 (2025) - 🐛 Automatické vytvorenie súboru aktualizácie knižnice filamentov

- 🐛 **Automatické vytvorenie súboru aktualizácie** - Opravený problém, kde `update_filamentLibrary.json` nebol automaticky vytvorený:
  - Súbor je teraz automaticky vytvorený z `filamentLibrarySample.json` pri prvom spustení
  - Zabezpečuje, že súbor aktualizácie je vždy k dispozícii pre zlúčenie
  - Vytvára len, ak súbor neexistuje (neprepisuje existujúci)
  - Vylepšené spracovanie chýb a protokolovanie pre operácie so súborom aktualizácie

### v1.1.3 (2025) - 🪟 Opravy kompatibility s Windows

- 🪟 **Oprava kompatibility s Windows** - Vylepšenia načítania knižnice filamentov:
  - Dynamický import pre veľké JSON súbory (namiesto statického importu)
  - Mechanizmus cache na zabránenie viacnásobného načítania
  - Vylepšené spracovanie chýb pre prípady nenájdeného súboru vo Windows
  - Multiplatformná kompatibilita (Windows, macOS, Linux)
- 🔧 **Vylepšenia spracovania chýb** - Vylepšené chybové správy:
  - Správne spracovanie chybových správ špecifických pre Windows
  - Tiché spracovanie prípadov nenájdeného súboru (nie ako varovania)

### v1.1.2 (2025) - 🌍 Výber jazyka a vylepšenia

- 🌍 **Výber jazyka pri prvom spustení** - Moderné, animované dialógové okno pre výber jazyka pri prvom spustení:
  - Podpora 13 jazykov s ikonami vlajok
  - Dizajn respektujúci motív
  - Plynulé animácie
  - Tutoriál beží vo vybranom jazyku
- 🔄 **Obnovenie továrenského nastavenia** - Funkcia pre úplné vymazanie dát:
  - Vymaže všetky uložené dáta (tlačiarne, filamenty, ponuky, zákazníci, nastavenia)
  - Potvrdzovací dialóg pre nebezpečné operácie
  - Aplikácia sa reštartuje ako pri prvom spustení
- 🎨 **Vylepšenia UI**:
  - Oprava kontrastu textu v pätičke (dynamický výber farby)
  - Okamžité uloženie pri zmene jazyka
  - Vylepšené umiestnenie tooltipov
- 📚 **Preklady tutoriálu** - Úplný preklad tutoriálu vo všetkých podporovaných jazykoch (pridaná ruština, ukrajinčina, čínština)

### v1.1.1 (2025) - 🎨 Vylepšenia rozvrhnutia hlavičky

- 📐 **Reorganizácia hlavičky** - Štruktúra hlavičky s tromi časťami:
  - Vľavo: Menu + Logo + Nadpis
  - Uprostred: Breadcrumb (dynamicky sa zmenšuje)
  - Vpravo: Rýchle akcie + Karta informácií o stave
- 📊 **Karta informácií o stave** - Kompaktný, moderný štýl:
  - "Ďalšie uloženie" (štítok a hodnota)
  - Dátum a čas (naskladané)
  - Vždy umiestnené vpravo
- 📱 **Responzívny dizajn** - Vylepšené body prerušenia:
  - Skryť breadcrumb <1000px
  - Skryť dátum <900px
  - Skryť "Ďalšie uloženie" <800px
  - Kompaktné rýchle akcie <700px
- 🔢 **Oprava formátovania čísel** - Zaokrúhľovanie percent pokroku načítania

### v1.1.0 (2025) - 🚀 Aktualizácia funkcií

- 🔍 **Rozšírené globálne vyhľadávanie** - Vylepšená funkcia vyhľadávania:
  - Vyhľadávanie ponúk podľa mena zákazníka, ID, stavu a dátumu
  - Vyhľadávanie filamentov z databázy (filamentLibrary) podľa značky, typu a farby
  - Pridanie filamentov do uloženého zoznamu jedným kliknutím z výsledkov vyhľadávania
  - Vylepšené výsledky vyhľadávania s indikátormi typu
- 💀 **Systém načítania Skeleton** - Spektakulárny zážitok z načítania:
  - Animované skeleton komponenty s efektmi shimmer
  - Sledovanie priebehu s vizuálnymi indikátormi
  - Kroky načítania so začiarknutím pre dokončené kroky
  - Plynulé prechody fade-in
  - Farby skeleton prispôsobené motívu
  - Načítanie skeleton špecifické pre stránku
- 🎨 **Vylepšenia UI/UX**:
  - Lepšie stavy načítania
  - Vylepšená spätná väzba používateľa počas načítania dát
  - Vylepšený vizuálny zážitok

### v1.0.0 (2025) - 🎉 Prvá stabilná verzia

- 🎨 **Moderné UI komponenty** - Kompletné prepracovanie UI s modernými komponentmi:
  - Komponenta Empty State pre lepší používateľský zážitok
  - Komponenta Card s hover efektmi
  - Komponenta Progress Bar pre operácie exportu/importu PDF
  - Komponenta Tooltip s integráciou témy
  - Navigácia Breadcrumb pre jasnú hierarchiu stránok
- ⚡ **Rýchle akcie** - Tlačidlá rýchlych akcií v hlavičke pre rýchlejší pracovný tok:
  - Tlačidlá rýchleho pridania pre Filamenty, Tlačiarne a Zákazníkov
  - Dynamické tlačidlá na základe aktívnej stránky
  - Integrácia klávesových skratiek
- 🔍 **Globálne vyhľadávanie (Command Palette)** - Výkonná funkcia vyhľadávania:
  - `Ctrl/Cmd+K` pre otvorenie globálneho vyhľadávania
  - Vyhľadávanie stránok a rýchlych akcií
  - Navigácia klávesnicou (↑↓, Enter, Esc)
  - Štýl prispôsobený téme
- ⏪ **Funkcia Späť/Znovu** - Správa histórie pre Filamenty:
  - `Ctrl/Cmd+Z` pre späť
  - `Ctrl/Cmd+Shift+Z` pre znovu
  - Vizuálne tlačidlá späť/znovu v UI
  - Podpora histórie 50 krokov
- ⭐ **Obľúbené Filamenty** - Označujte a filtrujte obľúbené filamenty:
  - Ikona hviezdy pre prepnutie stavu obľúbeného
  - Filter pre zobrazenie len obľúbených
  - Trvalý stav obľúbeného
- 📦 **Hromadné operácie** - Efektívna hromadná správa:
  - Výber checkbox pre viac filamentov
  - Funkcia Vybrať všetko / Zrušiť výber
  - Hromadné mazanie s potvrdzovacím dialógom
  - Vizuálne indikátory výberu
- 🎨 **Modálne dialógy** - Moderný modálny zážitok:
  - Modaly s rozmazaným pozadím pre formuláre pridania/úpravy
  - Vstupné polia pevnej veľkosti
  - Kláves Escape pre zatvorenie
  - Plynulé animácie s framer-motion
- ⌨️ **Klávesové skratky** - Vylepšený systém skratiek:
  - Prispôsobiteľné klávesové skratky
  - Dialóg nápovedy skratiek (`Ctrl/Cmd+?`)
  - Úprava skratiek so zachytením klávesov
  - Trvalé uloženie skratiek
- 📝 **Systém protokolovania** - Komplexné protokolovanie:
  - Oddelené súbory protokolov pre frontend a backend
  - Rozlíšenie adresára protokolov nezávislé od platformy
  - Automatická rotácia protokolov
  - Integrácia konzoly
- 🔔 **Vylepšenia oznámení** - Lepší systém oznámení:
  - Meno zákazníka v oznámeniach o zmazaní ponuky
  - Podpora oznámení naprieč platformami
  - Vylepšená správa chýb
- 🎯 **Vylepšenia UI/UX**:
  - Pevné veľkosti vstupných polí
  - Lepšie rozloženie formulárov
  - Vylepšená integrácia témy
  - Zvýšená dostupnosť

### v0.6.0 (2025)

#### 🐛 Opravy chýb
- **Optimalizácia protokolovania**: Zníženie nadmerného a duplicitného protokolovania
  - Informačné protokoly sa zobrazujú len v režime vývoja (DEV)
  - Chyby sa stále protokolujú aj vo výrobných zostavách
  - Inicializácia FilamentLibrary prebieha ticho
- **Oprava falošných varovaní**: Rozlíšenie farby filamentu varuje len vtedy, keď je knižnica už načítaná a farba stále nebola nájdená
  - Zabráni falošným varovaniam počas asynchrónneho načítania knižnice
  - Varovania sa zobrazujú len pri skutočných problémoch
- **Oprava duplikácie kontroly aktualizácií**: Odstránenie duplicitných volaní kontroly aktualizácií
- **Oprava protokolovania klávesových skratiek**: Protokoluje len vtedy, keď existuje skratka, preskočí neplatné kombinácie

#### ⚡ Vylepšenia výkonu
- Optimalizácia protokolovania operácií úložiska (len režim DEV)
- Menej operácií konzoly vo výrobných zostavách
- Čistejší výstup konzoly počas vývoja

## 📸 Screenshoty

Aplikácia obsahuje:
- Domovský dashboard so štatistikami
- Správu filamentov
- Správu tlačiarní
- Kalkulačku výpočtu nákladov
- Zoznam ponúk a detailné zobrazenie
- Dashboard stavu a časovú osu
- Export PDF a vstavaný náhľad

## 🚀 Inštalácia

### Predpoklady

- **Rust**: [Inštalácia Rustu](https://rustup.rs/)
- **Node.js**: [Inštalácia Node.js](https://nodejs.org/) (verzia 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Špecifické pre macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Špecifické pre Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev
```

### Špecifické pre Windows

- Visual Studio Build Tools (nástroje na zostavenie C++)
- Windows SDK

## 📦 Zostavenie

### Spustenie v režime vývoja

```bash
cd src-tauri
cargo tauri dev
```

### Produkčné zostavenie (Vytvorenie samostatnej aplikácie)

```bash
cd src-tauri
cargo tauri build
```

Samostatná aplikácia bude umiestnená v:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` alebo `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Beta zostavenie

Projekt obsahuje vetvu `beta` nakonfigurovanú pre samostatné zostavenia:

```bash
# Prepnutie na beta vetvu
git checkout beta

# Miestne beta zostavenie
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Beta zostavenie automaticky nastaví premennú `VITE_IS_BETA=true`, takže sa v menu zobrazí "BETA".

**GitHub Actions**: Pri pushovaní do vetvy `beta` sa automaticky spustí workflow `.github/workflows/build-beta.yml`, ktorý zostaví beta verziu pre všetky tri platformy.

Podrobný sprievodca: [BUILD.md](BUILD.md) a [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Vývoj

### Štruktúra projektu

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React komponenty
│   │   ├── utils/        # Pomocné funkcie
│   │   └── types.ts      # TypeScript typy
│   └── package.json
├── src-tauri/         # Rust backend
│   ├── src/           # Rust zdrojový kód
│   ├── Cargo.toml     # Rust závislosti
│   └── tauri.conf.json # Tauri konfigurácia
└── README.md
```

### Vývoj frontendu

```bash
cd frontend
pnpm install
pnpm dev
```

### Závislosti

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (ukladanie dát)
- tauri-plugin-log (protokolovanie)

## 📖 Použitie

1. **Pridať tlačiareň**: Menu Tlačiarne → Pridať novú tlačiareň
2. **Pridať filament**: Menu Filamenty → Pridať nový filament
3. **Vypočítať náklady**: Menu Kalkulačka → Vybrať tlačiareň a filamenty
4. **Uložiť ponuku**: Kliknúť na tlačidlo "Uložiť ako ponuku" v kalkulačke
5. **Export PDF**: Menu Ponuky → Vybrať ponuku → Export PDF
6. **Kontrola beta verzií**: Menu Nastavenia → Povoliť možnosť "Kontrolovať beta aktualizácie"

## 🔄 Správa verzií a aktualizácie

Aplikácia automaticky kontroluje GitHub Releases pre nové verzie:

- **Pri spustení**: Automaticky kontroluje aktualizácie
- **Každých 5 minút**: Automaticky znovu kontroluje
- **Notifikácia**: Ak je k dispozícii nová verzia, zobrazí sa notifikácia v pravom hornom rohu

### Kontrola beta verzií

Pre kontrolu beta verzií:

1. Prejdite do menu **Nastavenia**
2. Povolte možnosť **"Kontrolovať beta aktualizácie"**
3. Aplikácia okamžite kontroluje beta verzie
4. Ak je k dispozícii novšia beta verzia, zobrazí sa notifikácia
5. Kliknite na tlačidlo "Stiahnuť", aby ste prešli na stránku GitHub Release

**Príklad**: Ak používate verziu RELEASE (napr. 0.1.0) a povolíte kontrolu beta, aplikácia nájde najnovšiu beta verziu (napr. 0.2.0-beta) a upozorní vás, ak je novšia.

Podrobný sprievodca: [VERSIONING.md](VERSIONING.md)

## 🛠️ Technologický stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Ukladanie dát**: Tauri Store Plugin (JSON súbory)
- **Stylovanie**: Inline štýly (commonStyles)
- **i18n**: Vlastný systém prekladov
- **CI/CD**: GitHub Actions (automatické zostavenie pre macOS, Linux, Windows)
- **Správa verzií**: Integrácia s GitHub Releases API

## 📝 Licencia

Tento projekt je licencovaný pod **licenciou MIT**, avšak **komerčné použitie vyžaduje povolenie**.

Úplné autorské právo aplikácie: **Lekszikov Miklós (LexyGuru)**

- ✅ **Osobné a vzdelávacie použitie**: Povolené
- ❌ **Komerčné použitie**: Iba s výslovným písomným povolením

Podrobnosti: súbor [LICENSE](LICENSE)

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Poďakovanie

- [Tauri](https://tauri.app/) - Framework pre desktopové aplikácie naprieč platformami
- [React](https://react.dev/) - Frontendový framework
- [Vite](https://vitejs.dev/) - Nástroj na zostavenie

## 📚 Ďalšia dokumentácia

- [BUILD.md](BUILD.md) - Podrobný sprievodca zostavením pre všetky platformy
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Vytvorenie samostatnej aplikácie
- [VERSIONING.md](VERSIONING.md) - Správa verzií a aktualizácie
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Vytvorenie prvého GitHub Release

## 🌿 Štruktúra vetiev

- **`main`**: Stabilné verzie vydania (RELEASE build)
- **`beta`**: Beta verzie a vývoj (BETA build)

Pri pushovaní do vetvy `beta` sa automaticky spustí workflow GitHub Actions, ktorý zostaví beta verziu.

## 📋 História verzií

### v1.1.1 (2025) - 🎨 Vylepšenia rozloženia hlavičky

- 🎨 **Prepracovanie hlavičky** - Kompletná revízia rozloženia hlavičky:
  - Štruktúra troch sekcií (vľavo: logo/menu, stred: breadcrumb, vpravo: akcie/status)
  - Karta informácií o stave vždy umiestnená úplne vpravo
  - Moderný dizajn typu karty pre informácie o stave
  - Lepšie medzery a zarovnanie v celej hlavičke
- 📱 **Responzívny dizajn** - Lepší zážitok na mobilných zariadeniach a malých obrazovkách:
  - Dynamické body prerušenia pre viditeľnosť prvkov
  - Opravy skrátenia breadcrumb
  - Rýchle akcie sa prispôsobujú veľkosti obrazovky
  - Responzívna veľkosť karty informácií o stave
- 🔧 **Opravy rozloženia**:
  - Opravené problémy s pretečením a skrátením breadcrumb
  - Vylepšenia umiestnenia karty informácií o stave
  - Lepšia správa flexbox rozloženia
  - Vylepšené medzery a medzery medzi prvkami

### v1.1.0 (2025) - 🚀 Aktualizácia funkcií

- 🔍 **Rozšírené globálne vyhľadávanie** - Vylepšená funkcia vyhľadávania
- 💀 **Systém načítania Skeleton** - Spektakulárny zážitok z načítania
- 🎨 **Vylepšenia UI/UX** - Lepšie stavy načítania a vizuálny zážitok

### v1.0.0 (2025) - 🎉 Prvá stabilná verzia

- 🎨 **Moderné UI komponenty** - Kompletné prepracovanie UI s modernými komponentami
- ⚡ **Rýchle akcie** - Tlačidlá rýchlych akcií v záhlaví
- 🔍 **Globálne vyhľadávanie** - Výkonná funkcia vyhľadávania
- ⏪ **Funkcia Späť/Znovu** - Správa histórie
- ⭐ **Obľúbené filamenty** - Označenie a filtrovanie obľúbených filamentov
- 📦 **Hromadné operácie** - Efektívna hromadná správa
- 🎨 **Modálne dialógy** - Moderný modálny zážitok
- ⌨️ **Klávesové skratky** - Vylepšený systém skratiek
- 📝 **Systém protokolovania** - Komplexné protokolovanie
- 🔔 **Vylepšenia oznámení** - Lepší systém oznámení

### v0.6.0 (2025)

- 👥 **Databáza zákazníkov** - Kompletný systém správy zákazníkov s:
  - Pridávanie, úprava, mazanie zákazníkov
  - Kontaktné informácie (e-mail, telefón)
  - Firemné údaje (voliteľné)
  - Adresa a poznámky
  - Štatistiky zákazníkov (celkový počet ponúk, dátum poslednej ponuky)
  - Funkcia vyhľadávania
  - Integrácia s Kalkulačkou pre rýchly výber zákazníka
- 📊 **História a trendy cien** - Sledovanie zmien cien filamentu:
  - Automatické sledovanie histórie cien pri aktualizácii cien filamentu
  - Vizualizácia cenových trendov s grafmi SVG
  - Cenové štatistiky (aktuálna, priemerná, min, max cena)
  - Analýza trendov (rastúci, klesajúci, stabilný)
  - Tabuľka histórie cien s podrobnými informáciami o zmenách
  - Varovania pri významných zmenách cien (zmeny 10%+)
  - Zobrazenie histórie cien v komponente Filamenty počas úpravy
- 🔧 **Vylepšenia**:
  - Vylepšená Kalkulačka s rozbalovacím menu výberu zákazníka
  - Integrácia histórie cien do formulára úpravy filamentu
  - Vylepšená trvalosť dát pre zákazníkov a históriu cien

### v0.5.58 (2025)
- 🌍 **Podpora ukrajinčiny a ruštiny** – Pridaná plná podpora prekladov pre ukrajinčinu (uk) a ruštinu (ru):
  - Kompletné prekladové súbory so všetkými 813 prekladovými kľúčmi pre oba jazyky
  - Podpora ukrajinského locale (uk-UA) pre formátovanie dátumu/času
  - Podpora ruského locale (ru-RU) pre formátovanie dátumu/času
  - Všetky súbory README aktualizované s novými jazykmi v jazykovom menu
  - Počet jazykov aktualizovaný z 12 na 14 jazykov
  - Vytvorené dokumentačné súbory README.uk.md a README.ru.md

### v0.5.57 (2025)
- 🍎 **Platform-Specific Features** – Native platform integration for macOS, Windows, and Linux:
  - **macOS**: Dock badge support (numeric/textual badge on app icon), native Notification Center integration with permission management
  - **Windows**: Native Windows notifications
  - **Linux**: System tray integration, desktop notifications support
  - **All Platforms**: Native notification API integration with permission request system, platform detection and automatic feature enabling
- 🔔 **Notification System** – Native notification support with permission management:
  - Permission request system for macOS notifications
  - Notification test buttons in Settings
  - Automatic permission checking and status display
  - Platform-specific notification handling (macOS Notification Center, Windows Action Center, Linux desktop notifications)

### v0.5.56 (2025)
- 🌍 **Úplné jazykové preklady** – Dokončené úplné preklady pre 6 zostávajúcich jazykových súborov: čeština (cs), španielčina (es), taliančina (it), poľština (pl), portugalčina (pt) a slovenčina (sk). Každý súbor obsahuje všetkých 813 prekladových kľúčov, takže aplikácia je teraz plne podporovaná v týchto jazykoch.
- 🔒 **Oprava oprávnení Tauri** – Súbor `update_filamentLibrary.json` je teraz explicitne povolený pre operácie čítania, zápisu a vytvárania v súbore možností Tauri, čo zabezpečuje spoľahlivé fungovanie aktualizácií knižnice filamentov.

### v0.5.55 (2025)
- 🧵 **Vylepšenie úpravy ponúk** – Uložené ponuky teraz umožňujú priamy výber alebo úpravu tlačiarne, pričom náklady sa automaticky prepočítavajú spolu so zmenami filamentu.
- 🧮 **Presnosť a protokolovanie** – Podrobné protokolovanie pomáha sledovať kroky výpočtu nákladov (filament, elektrina, sušenie, použitie), čo uľahčuje hľadanie chýb v importovaných súboroch G-code.
- 🌍 **Doplnky prekladov** – Pridané nové kľúče a popisky i18n pre selektor tlačiarne, čo zabezpečuje konzistentné UI editora vo všetkých podporovaných jazykoch.
- 📄 **Aktualizácia dokumentácie** – README rozšírené o popis nových funkcií, vydanie v0.5.55 pridané do histórie verzií.

### v0.5.11 (2025)
- 🗂️ **Jazyková modularizácia** – Rozšírenie aplikácie o prekladové súbory organizované do nového adresára `languages/`, čo uľahčuje pridávanie nových jazykov a správu existujúcich textov.
- 🌍 **Zjednotené preklady UI** – Rozhranie pre import sliceru teraz funguje z centrálneho prekladového systému, všetky tlačidlá, chybové správy a súhrny sú lokalizované.
- 🔁 **Aktualizácia výberu jazyka** – V Nastaveniach sa výber jazyka načítava na základe objavených jazykových súborov, takže v budúcnosti stačí pridať nový jazykový súbor.
- 🌐 **Nové jazykové základy** – Prekladové súbory pripravené pre francúzštinu, taliančinu, španielčinu, poľštinu, češtinu, slovenčinu, brazílsku portugalčinu a zjednodušenú čínštinu (s anglickým fallbackom), skutočné preklady možno ľahko doplniť.

### v0.5.0 (2025)
- 🔎 **Tlačidlo porovnania cien filamentu** – Každý vlastný filament má teraz ikonu lupu, ktorá otvára vyhľadávanie Google/Bing na základe značky/typu/farby, poskytuje rýchle odkazy na aktuálne ceny.
- 💶 **Podpora desatinnej ceny** – Polia ceny filamentu teraz prijímajú desatinné čísla (14.11 € atď.), vstup je automaticky validovaný a formátovaný pri uložení.
- 🌐 **Reverzné vyhľadávanie fallback** – Ak shell Tauri nemôže otvoriť prehliadač, aplikácia automaticky otvorí novú kartu, takže vyhľadávanie funguje na všetkých platformách.

### v0.4.99 (2025)
- 🧾 **Integrovaný import G-code v kalkulátore** – Nový modálny `SlicerImportModal` v hornej časti kalkulátora, ktorý načítava exporty G-code/JSON jedným kliknutím, prenáša čas tlače, množstvo filamentu a vytvára návrh ponuky.
- 📊 **Dáta sliceru z hlavičky** – Hodnoty hlavičky G-code `total filament weight/length/volume` automaticky preberajú súhrny, presne spracovávajú straty pri zmene farby.

### v0.4.98 (2025)
- 🧵 **Podpora viacfarebného filamentu** – Knižnica filamentov a UI pre správu teraz samostatne označujú viacfarebné (dúhové/duálne/trojfarebné) filamenty s poznámkami a náhľadom dúhy.
- 🌐 **Automatický preklad pri importe CSV** – Názvy farieb importované z externej databázy dostávajú maďarské a nemecké štítky, čím zostáva výber farieb viacjazyčný bez ručnej úpravy.
- 🔄 **Zlúčenie knižnice aktualizácií** – Obsah súboru `update_filamentLibrary.json` je automaticky deduplikovaný a zlúčený s existujúcou knižnicou pri spustení, bez prepísania používateľských úprav.
- 📁 **Aktualizácia prevodníka CSV** – Skript `convert-filament-csv.mjs` už neprepisuje trvalý `filamentLibrary.json`, namiesto toho vytvára aktualizačný súbor a generuje viacjazyčné štítky.
- ✨ **Ladenie animačného zážitku** – Nové možnosti prechodu stránok (flip, parallax), výber štýlu mikrointerakcie, pulzujúca spätná väzba, kostrový zoznam knižnice filamentov a jemne vyladené efekty hover kariet.
- 🎨 **Rozšírenia dielne motívov** – Štyri nové vstavané motívy (Forest, Pastel, Charcoal, Midnight), okamžité duplikovanie aktívneho motívu pre vlastnú úpravu, vylepšené spracovanie gradientu/kontrastu a zjednodušený proces zdieľania.

### v0.4.0 (2025)
- 🧵 **Integrácia databázy filamentov** – Viac ako 12 000 továrenských farieb z vstavanej JSON knižnice (snímok filamentcolors.xyz), usporiadaných podľa značky a materiálu
- 🪟 **Panely výberu pevnej veľkosti** – Zoznamy značiek a typov otvárané tlačidlom, prehľadateľné, posúvateľné, ktoré sa navzájom vylučujú, čím je formulár transparentnejší
- 🎯 **Vylepšenia výberu farieb** – Keď sú rozpoznané prvky knižnice, povrchová úprava a hex kód sú automaticky nastavené, samostatné polia dostupné pri prepnutí na vlastný režim
- 💾 **Editor knižnice filamentov** – Nová záložka nastavení s popup formulárom, spracovanie duplikátov a trvalé ukladanie `filamentLibrary.json` založené na Tauri FS
- 📄 **Aktualizácia dokumentácie** – Nová odrážka v hlavnom zozname funkcií pre knižnicu farieb filamentov, čistenie README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Predvolby filtrov ponúk** – Ukladateľné, pomenovateľné nastavenie filtrov, predvolené rýchle predvolby (Dnes, Včera, Týždenný, Mesačný atď.) a aplikácia/odstránenie jedným kliknutím
- 📝 **Poznámky k zmene stavu** – Nový modálny pre úpravu stavu ponuky s voliteľnou poznámkou uloženou v histórii stavu
- 🖼️ **Rozšírenie exportu PDF** – Obrázky uložené s filamentmi sa zobrazujú v tabuľke PDF so štýlom optimalizovaným pre tlač
- 🧾 **Dátový list firemnej značky** – Názov spoločnosti, adresa, daňové ID, bankový účet, kontakt a nahratie loga; automaticky zahrnuté do hlavičky PDF
- 🎨 **Výber šablóny PDF** – Tri štýly (Moderný, Minimalistický, Profesionálny) na výber vzhľadu ponuky
- 👁️ **Integrovaný náhľad PDF** – Samostatné tlačidlo pri detailoch ponuky pre okamžitú vizuálnu kontrolu pred exportom
- 📊 **Dashboard stavu** – Karty stavu so súhrnom, rýchle filtre stavu a časová osa nedávnych zmien stavu v ponukách
- 📈 **Štatistické grafy** – Graf trendu príjmov/nákladov/zisku, koláčový graf distribúcie filamentov, stĺpcový graf príjmov na tlačiareň, všetko exportovateľné vo formáte SVG/PNG a možno tiež uložiť ako PDF

### v0.3.8 (2025)
- 🐛 **Oprava formátovania čísel správy** - Formátovanie na 2 desatinné miesta v správach:
  - Hlavné štatistické karty (Príjmy, Výdavky, Zisk, Ponuky): `formatNumber(formatCurrency(...), 2)`
  - Hodnoty nad grafmi: `formatNumber(formatCurrency(...), 2)`
  - Podrobné štatistiky (Priemerný zisk/ponuka): `formatNumber(formatCurrency(...), 2)`
  - Teraz konzistentné s domovskou stránkou (napr. `6.45` namiesto `6.45037688333333`)
- 🎨 **Oprava navigácie záložiek nastavení** - Vylepšenia farby pozadia a textu:
  - Pozadie sekcie navigácie záložiek: `rgba(255, 255, 255, 0.85)` pre gradientné motívy + `blur(10px)`
  - Pozadia tlačidiel záložiek: Aktívne `rgba(255, 255, 255, 0.9)`, neaktívne `rgba(255, 255, 255, 0.7)` pre gradientné motívy
  - Farba textu tlačidiel záložiek: `#1a202c` (tmavá) pre gradientné motívy pre čitateľnosť
  - Efekty hover: `rgba(255, 255, 255, 0.85)` pre gradientné motívy
  - Filter pozadia: `blur(8px)` pre tlačidlá záložiek, `blur(10px)` pre sekciu navigácie

### v0.3.7 (2025)
- 🎨 **Modernizácia dizajnu** - Kompletná vizuálna transformácia s animáciami a novými motívmi:
  - Nové motívy: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nových moderných motívov)
  - Animácie Framer Motion integrované (fadeIn, slideIn, stagger, efekty hover)
  - Efekt glassmorphism pre gradientné motívy (rozostrenie + priehľadné pozadie)
  - Efekt neonového žiarenia pre neon/cyberpunk motívy
  - Modernizované karty a povrchy (väčší padding, zaoblené rohy, lepšie tiene)
- 🎨 **Vylepšenia farieb** - Lepší kontrast a čitateľnosť pre všetky motívy:
  - Tmavý text (#1a202c) na bielom/svetlom pozadí pre gradientné motívy
  - Vstupné polia, štítky, farebné označenie h3 vylepšené vo všetkých komponentoch
  - Konzistentné spracovanie farieb na všetkých stránkach (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Tieň textu pridaný pre gradientné motívy pre lepšiu čitateľnosť
- 📊 **Vylepšenia štýlu tabuľky** - Rozmazané pozadie a lepší kontrast textu:
  - Farba pozadia: rgba(255, 255, 255, 0.85) pre gradientné motívy (predtým 0.95)
  - Filter pozadia: blur(8px) pre rozmazaný efekt
  - Farba textu: #333 (tmavosivá) pre gradientné motívy pre lepšiu čitateľnosť
  - Pozadia buniek: rgba(255, 255, 255, 0.7) pre rozmazaný efekt
- 🎨 **Vylepšenia farby pozadia kariet** - Rozmazané pozadie, lepšia čitateľnosť:
  - Farba pozadia: rgba(255, 255, 255, 0.75) pre gradientné motívy (predtým 0.95)
  - Filter pozadia: blur(12px) pre silnejšie rozostrenie
  - Nepriehľadnosť: 0.85 pre matný efekt
  - Farba textu: #1a202c (tmavá) pre gradientné motívy
- 📈 **Modernizácia domovskej stránky** - Týždenné/mesačné/ročné štatistiky a porovnanie období:
  - Karty porovnania období (Týždenný, Mesačný, Ročný) s farebnými akcentnými pruhmi
  - Komponenty StatCard modernizované (ikony s farebnými pozadiami, akcentné pruhy)
  - Sekcia súhrnu usporiadaná v kartách s ikonami
  - Sekcia porovnania období pridaná
- 🐛 **Oprava filtra dátumu** - Presnejšie filtrovanie období:
  - Reset času (00:00:00) pre presné porovnanie
  - Horný limit nastavený (dnes je zahrnuté)
  - Týždenný: posledných 7 dní (dnes zahrnuté)
  - Mesačný: posledných 30 dní (dnes zahrnuté)
  - Ročný: posledných 365 dní (dnes zahrnuté)
- 🎨 **Modernizácia bočného panelu** - Ikony, glassmorphism, efekty neonového žiarenia
- 🎨 **Modernizácia ConfirmDialog** - Vlastnosť motívu pridaná, harmonizované farebné označenie

### v0.3.6 (2025)
- 🎨 **Reorganizácia UI nastavení** - Systém záložiek (Všeobecné, Vzhľad, Pokročilé, Správa dát) pre lepšiu UX a čistejšiu navigáciu
- 🌐 **Vylepšenia prekladov** - Celý hardcodovaný maďarský text preložený vo všetkých komponentoch (HU/EN/DE):
  - Calculator: "výpočet nákladov 3D tlače"
  - Filaments: "Spravovať a upravovať filamenty"
  - Printers: "Spravovať tlačiarne a systémy AMS"
  - Offers: "Spravovať a exportovať uložené ponuky"
  - Home: Názvy štatistík, súhrn, štítky exportu CSV (hod/Std/hrs, ks/Stk/pcs)
  - VersionHistory: "História verzií nie je k dispozícii"
- 💾 **Systém cache histórie verzií** - Fyzické uloženie do localStorage, kontrola GitHub každú 1 hodinu:
  - Detekcia zmien založená na kontrolnom súčte (sťahuje iba pri nových vydaniach)
  - Samostatná cache pre každý jazyk (Maďarčina/Angličtina/Nemčina)
  - Rýchle prepínanie jazyka z cache (žiadne nové preklady)
  - Automatická invalidácia cache pri novom vydaní
- 🌐 **Inteligentný preklad** - Prekladá iba nové vydania, používa staré preklady z cache:
  - Validácia cache (neukladať do cache, ak rovnaký text)
  - API MyMemory fallback, ak preklad zlyhá
  - Auto-reset počítadla chýb (resetuje sa po 5 minútach)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate odstránený** - Iba použitie API MyMemory (chyby 400 eliminované, požiadavka GET, žiadny CORS)
- 🔄 **Refaktoring tlačidla opakovať** - Jednoduchší mechanizmus spúšťania s useEffect
- 🐛 **Opravy chýb zostavenia** - Problémy s odsadením JSX opravené (sekcia Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integrácia API MyMemory** - Bezplatné prekladové API namiesto LibreTranslate
- ✅ **Otvorenie stránky vydaní GitHub** - Tlačidlo na otvorenie stránky vydaní GitHub pri limite rýchlosti
- ✅ **Vylepšenie spracovania chýb limitu rýchlosti** - Jasné chybové správy a tlačidlo opakovať
- 🐛 **Opravy chýb zostavenia** - Nepoužívané importy odstránené (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Vylepšenie validácie vstupu** - Centrálny nástroj validácie vytvorený a integrovaný do komponentov Calculator, Filaments, Printers
- ✅ **Chybové správy validácie** - Viacjazyčné (HU/EN/DE) chybové správy s toast notifikáciami
- ✅ **Optimalizácia výkonu** - Komponenty lazy loading (rozdelenie kódu), optimalizácia useMemo a useCallback
- ✅ **Inicializácia špecifická pre platformu** - Základy inicializácie špecifickej pre platformu macOS, Windows, Linux
- 🐛 **Oprava chyby zostavenia** - Funkcie kontextového menu Printers.tsx pridané

### v0.3.3 (2025)
- 🖱️ **Funkcie pretiahnutia a pustenia** - Zmena poradia ponúk, filamentov a tlačiarní pretiahnutím
- 📱 **Kontextové menu** - Menu pravého tlačidla myši pre rýchle akcie (upraviť, zmazať, duplikovať, exportovať PDF)
- 🎨 **Vizuálna spätná väzba** - Zmena nepriehľadnosti a kurzora počas pretiahnutia a pustenia
- 🔔 **Toast notifikácie** - Notifikácie po zmene poradia
- 🐛 **Oprava chyby zostavenia** - Oprava Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Funkcie šablón** - Ukladanie a načítanie výpočtov ako šablón v komponente Calculator
- 📜 **História/Verzovanie pre ponuky** - Verzovanie ponúk, zobrazenie histórie, sledovanie zmien
- 🧹 **Oprava duplikácie** - Duplikované funkcie exportu/importu CSV/JSON odstránené z komponentov Filaments a Printers (zostali v Settings)

### v0.3.1 (2025)
- ✅ **Vylepšenie validácie vstupu** - Záporné čísla zakázané, maximálne hodnoty nastavené (hmotnosť filamentu, čas tlače, výkon atď.)
- 📊 **Export/Import CSV/JSON** - Hromadný export/import filamentov a tlačiarní vo formáte CSV a JSON
- 📥 **Tlačidlá Importovať/Exportovať** - Ľahký prístup k funkciám exportu/importu na stránkach Filaments a Printers
- 🎨 **Vylepšenie prázdnych stavov** - Informatívne prázdne stavy zobrazené, keď nie sú žiadne dáta

### v0.3.0 (2025)
- ✏️ **Úprava ponúk** - Upraviť uložené ponuky (názov zákazníka, kontakt, popis, percento zisku, filamenty)
- ✏️ **Upraviť filamenty v ponuke** - Upraviť, pridať, zmazať filamenty v rámci ponuky
- ✏️ **Tlačidlo úpravy** - Nové tlačidlo úpravy vedľa tlačidla zmazať v zozname ponúk
- 📊 **Funkcia exportu štatistík** - Exportovať štatistiky vo formáte JSON alebo CSV z domovskej stránky
- 📈 **Generovanie správ** - Generovať týždenné/mesačné/ročné/všetky správy vo formáte JSON s filtrovaním období
- 📋 **Zobrazenie histórie verzií** - Zobraziť históriu verzií v nastaveniach, integrácia API GitHub Releases
- 🌐 **Preklad vydaní GitHub** - Automatický preklad Maďarčina -> Angličtina/Nemčina (API MyMemory)
- 💾 **Cache prekladov** - Cache localStorage pre preložené poznámky k vydaniu
- 🔄 **Dynamická história verzií** - Verzie beta a release zobrazené samostatne
- 🐛 **Opravy chýb** - Nepoužívané premenné odstránené, čistenie kódu, chyby linteru opravené

### v0.2.55 (2025)
- 🖥️ **Funkcia Console/Log** - Nová položka menu Console na ladenie a zobrazenie logov
- 🖥️ **Nastavenie Console** - Možno povoliť zobrazenie položky menu Console v nastaveniach
- 📊 **Zhromažďovanie logov** - Automatické zaznamenávanie všetkých správ console.log, console.error, console.warn
- 📊 **Zaznamenávanie globálnych chýb** - Automatické zaznamenávanie udalostí chýb okna a nespracovaných odmietnutí promise
- 🔍 **Filtrovanie logov** - Filtrovať podľa úrovne (all, error, warn, info, log, debug)
- 🔍 **Export logov** - Exportovať logy vo formáte JSON
- 🧹 **Mazanie logov** - Mazanie logov jedným tlačidlom
- 📜 **Auto-posun** - Automatické posúvanie k novým logom
- 💾 **Úplné protokolovanie** - Všetky kritické operácie protokolované (uložiť, exportovať, importovať, zmazať, exportovať PDF, stiahnuť aktualizáciu)
- 🔄 **Oprava tlačidla aktualizácie** - Tlačidlo sťahovania teraz používa plugin shell Tauri, funguje spoľahlivo
- 🔄 **Protokolovanie aktualizácie** - Úplné protokolovanie kontroly a sťahovania aktualizácie
- ⌨️ **Klávesové skratky** - `Ctrl/Cmd+N` (nový), `Ctrl/Cmd+S` (uložiť), `Escape` (zrušiť), `Ctrl/Cmd+?` (nápoveda)
- ⌨️ **Oprava klávesových skratiek macOS** - Spracovanie Cmd vs Ctrl, spracovanie udalostí fázy zachytenia
- ⏳ **Stavy načítania** - Komponenta LoadingSpinner pre stavy načítania
- 💾 **Zálohovanie a obnovenie** - Úplné zálohovanie a obnovenie dát s dialógom Tauri a pluginmi fs
- 🛡️ **Hranice chýb** - React ErrorBoundary na spracovanie chýb na úrovni aplikácie
- 💾 **Automatické ukladanie** - Automatické ukladanie s obmedzením času s konfigurovateľným intervalom (predvolené 30 sekúnd)
- 🔔 **Nastavenia notifikácií** - Toast notifikácie zapnuté/vypnuté a nastavenie trvania
- ⌨️ **Menu nápovedy skratiek** - Zoznam klávesových skratiek v modálnom okne (`Ctrl/Cmd+?`)
- 🎬 **Animácie a prechody** - Plynulé prechody a animácie kľúčových snímok (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Kontextová nápoveda pre všetky dôležité prvky pri najazdení myšou
- 🐛 **Oprava chyby renderovania React** - Asynchrónna operácia loggeru konzoly, aby neblokovala renderovanie
- 🔧 **Aktualizácia num-bigint-dig** - Aktualizované na v0.9.1 (oprava varovania o zastaranosti)

### v0.2.0 (2025)
- 🎨 **Systém motívov** - 6 moderných motívov (Svetlý, Tmavý, Modrý, Zelený, Fialový, Oranžový)
- 🎨 **Výber motívu** - Motív vybrateľný v nastaveniach, okamžite sa prejaví
- 🎨 **Úplná integrácia motívov** - Všetky komponenty (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) používajú motívy
- 🎨 **Dynamické farby** - Všetky hardcodované farby nahradené farbami motívu
- 🎨 **Responzívny motív** - Ponuky a päta Sidebar tiež používajú motívy
- 💱 **Dynamická konverzia meny** - Ponuky sú teraz zobrazené v mene aktuálnych nastavení (automatická konverzia)
- 💱 **Zmena meny** - Mena zmenená v nastaveniach okamžite ovplyvňuje zobrazenie ponúk
- 💱 **Konverzia meny PDF** - Export PDF je tiež vytvorený v mene aktuálnych nastavení
- 💱 **Konverzia ceny filamentu** - Ceny filamentov sú tiež automaticky prevedené

### v0.1.85 (2025)
- 🎨 **Vylepšenia UI/UX**:
  - ✏️ Duplikované ikony odstránené (Tlačidlá Upraviť, Uložiť, Zrušiť)
  - 📐 Sekcie Export/Import v rozložení 2 stĺpcov (vedľa seba)
  - 💾 Natívny dialóg ukladania použitý na ukladanie PDF (dialóg Tauri)
  - 📊 Toast notifikácie na ukladanie PDF (úspech/chyba)
  - 🖼️ Veľkosť okna aplikácie: 1280x720 (predtým 1000x700)
- 🐛 **Opravy chýb**:
  - Chýbajúce informácie pridané v generovaní PDF (customerContact, zisk v samostatnom riadku, príjmy)
  - Prekladové kľúče pridané (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Vylepšenia exportu PDF**:
  - Kontakt zákazníka (e-mail/telefón) zobrazený v PDF
  - Výpočet zisku v samostatnom riadku s percentom zisku
  - Príjmy (Celková cena) v samostatnom riadku, zvýraznené
  - Úplný rozpis nákladov v PDF

### v0.1.56 (2025)
- ✨ **Vylepšenia rozloženia kalkulátora**: Pretečenie kariet filamentov opravené, responzívne flexbox rozloženie
- ✨ **Responzívny rozpis nákladov**: Teraz dynamicky reaguje na zmeny veľkosti okna
- 🐛 **Oprava chyby**: Obsah nepreteká z okna pri pridávaní filamentu
- 🐛 **Oprava chyby**: Všetky prvky Calculator správne reagujú na zmeny veľkosti okna

### v0.1.55 (2025)
- ✨ **Dialógy potvrdenia**: Potvrdenie požadované pred zmazaním (Filamenty, Tlačiarne, Ponuky)
- ✨ **Toast notifikácie**: Notifikácie po úspešných operáciách (pridať, aktualizovať, zmazať)
- ✨ **Validácia vstupu**: Záporné čísla zakázané, maximálne hodnoty nastavené
- ✨ **Stavy načítania**: Spinner načítania pri spustení aplikácie
- ✨ **Hranica chýb**: Spracovanie chýb na úrovni aplikácie
- ✨ **Vyhľadávanie a filtrovanie**: Vyhľadávať filamenty, tlačiarne a ponuky
- ✨ **Duplikácia**: Ľahká duplikácia ponúk
- ✨ **Zbaliteľné formuláre**: Formuláre na pridanie filamentu a tlačiarne sú zbaliteľné
- ✨ **Rozšírenia ponuky**: Polia názvu zákazníka, kontaktu a popisu pridané
- 🐛 **Čistenie Console.log**: Žiadne console.logs v produkčnom zostavení
- 🐛 **Oprava poľa popisu**: Dlhé texty sa správne zalamujú.

---

**Verzia**: 1.3.12

Ak máte nejaké otázky alebo nájdete chybu, prosím otvorte issue v repozitári GitHub!

