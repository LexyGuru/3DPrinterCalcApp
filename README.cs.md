# 🖨️ 3D Printer Calculator App

> **🌍 Výběr jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Moderní desktopová aplikace pro výpočet nákladů na 3D tisk. Vytvořeno pomocí Tauri v2, React frontendu a Rust backendu.

## ✨ Funkce

- 📊 **Výpočet nákladů** - Automatický výpočet nákladů na filament, elektřinu, sušení a opotřebení
- 🧵 **Správa filamentů** - Přidávání, úprava, mazání filamentů (značka, typ, barva, cena)
- 🖨️ **Správa tiskáren** - Správa tiskáren a systémů AMS
- 💰 **Výpočet zisku** - Volitelný procentuální zisk (10%, 20%, 30%, 40%, 50%)
- 📄 **Nabídky** - Ukládání, správa a export PDF nabídek (jméno zákazníka, kontakt, popis)
- 🧠 **Předvolby filtrů** - Ukládání filtrů nabídek, aplikace rychlých předvoleb, automatické filtry založené na datum/čas
- 🗂️ **Dashboard stavu** - Karty stavu, rychlé filtry a časová osa nedávných změn stavu
- 📝 **Poznámky ke stavu** - Každá změna stavu s volitelnými poznámkami a protokolováním historie
- 👁️ **Náhled PDF a šablony** - Vestavěný náhled PDF, volitelné šablony a bloky firemního brandingu
- 🎨 **Knihovna barev filamentu** - Více než 12,000 továrních barev s volitelnými panely založenými na značce a typu
- 💾 **Editor knihovny filamentů** - Přidávání/úprava založená na modalu, varování před duplikáty a trvalé ukládání do `filamentLibrary.json`
- 🖼️ **Obrázky filamentů v PDF** - Zobrazení log filamentů a vzorků barev v generovaných PDF
- 🧾 **Import G-code a vytváření konceptu** - Načítání exportů G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačce, s podrobným shrnutím a automatickým generováním konceptu nabídky
- 📈 **Statistiky** - Přehledný dashboard pro spotřebu filamentu, příjmy, zisk
- 🌍 **Vícejazyčnost** - Úplný překlad do maďarštiny, angličtiny, němčiny, francouzštiny, zjednodušené čínštiny, češtiny, španělštiny, italštiny, polštiny, portugalštiny, slovenštiny, ukrajinštiny a ruštiny (14 jazyků, 813 překladových klíčů na jazyk)
- 💱 **Více měn** - EUR, HUF, USD
- 🔄 **Automatické aktualizace** - Kontroluje GitHub Releases pro nové verze
- 🧪 **Beta verze** - Podpora beta větve a beta buildu
- ⚙️ **Kontrola beta** - Konfigurovatelná kontrola beta verzí
- 🎨 **Responzivní rozvržení** - Všechny prvky aplikace se dynamicky přizpůsobují velikosti okna
- ✅ **Potvrzovací dialogy** - Žádost o potvrzení před smazáním
- 🔔 **Toast notifikace** - Notifikace po úspěšných operacích
- 🔍 **Vyhledávání a filtrování** - Vyhledávání filamentů, tiskáren a nabídek
- 🔎 **Online porovnání cen** - Jedním kliknutím otevře výsledky vyhledávání Google/Bing pro vybraný filament, cena okamžitě aktualizovatelná
- 📋 **Duplikace** - Snadná duplikace nabídek
- 🖱️ **Drag & Drop** - Přeskupování nabídek, filamentů a tiskáren tažením
- 📱 **Kontextová menu** - Menu pravého tlačítka pro rychlé akce (upravit, smazat, duplikovat, exportovat)

## 📋 Seznam změn (Changelog)

### v1.1.6 (2025) - 🌍 Úplné pokrytí překladů

- 🌍 **Překlady tutoriálu** - Přidány chybějící překladové klíče tutoriálu do všech jazykových souborů:
  - 8 nových kroků tutoriálu plně přeloženo (Stavový dashboard, PDF náhled, Přetahování, Kontextové menu, Historie cen, Online porovnání cen, Export/Import, Zálohování/Obnovení)
  - Veškerý obsah tutoriálu je nyní dostupný ve všech 14 podporovaných jazycích
  - Kompletní zážitek z tutoriálu v češtině, španělštině, francouzštině, italštině, polštině, portugalštině, ruštině, slovenštině, ukrajinštině a čínštině
- 🎨 **Překlad názvů témat** - Názvy témat jsou nyní plně přeloženy ve všech jazycích:
  - 15 názvů témat přidáno do všech jazykových souborů (Světlý, Tmavý, Modrý, Zelený, Les, Fialový, Oranžový, Pastelový, Antracit, Půlnoc, Přechod, Neon, Cyberpunk, Západ slunce, Oceán)
  - Názvy témat se dynamicky načítají z překladového systému místo pevně zakódovaných hodnot
  - Fallback mechanismus: překladový klíč → displayName → název tématu
  - Všechna témata se nyní zobrazují v jazyce vybraném uživatelem v Nastavení

### v1.1.5 (2025) - 🎨 Vylepšení UI a správa logů

- 🎨 **Přepracování dialogu pro přidání filamentu** - Vylepšené dvousloupcové rozvržení pro lepší organizaci:
  - Levý sloupec: Základní údaje (Značka, Typ, Hmotnost, Cena, Nahrání obrázku)
  - Pravý sloupec: Výběr barvy se všemi možnostmi barev
  - Všechna vstupní pole mají konzistentní šířku
  - Lepší vizuální hierarchie a rozestupy
  - Nahrání obrázku přesunuto do levého sloupce pod pole Cena
- 📋 **Správa souborů logů** - Nová sekce správy logů v nastavení Správy dat:
  - Konfigurovatelné automatické mazání starých souborů logů (5, 10, 15, 30, 60, 90 dní nebo nikdy)
  - Tlačítko pro otevření složky logů ve správci souborů
  - Automatické čištění při změně nastavení
  - Otevírání složek specifické pro platformu (macOS, Windows, Linux)
- 📦 **Rozvržení Export/Import** - Sekce Export a Import jsou nyní vedle sebe:
  - Responzivní dvousloupcové rozvržení
  - Lepší využití prostoru
  - Vylepšená vizuální rovnováha
- 🍎 **Varování o oznámeních macOS** - Zavíratelné dialogové okno varování:
  - Zobrazuje se pouze na platformě macOS
  - Dvě možnosti zavření: dočasné (tlačítko X) nebo trvalé (tlačítko Zavřít)
  - Dočasné zavření: skryto pouze pro aktuální relaci, znovu se objeví po restartu
  - Trvalé zavření: uloženo v nastavení, nikdy se znovu neobjeví
  - Jasné vizuální rozlišení mezi typy zavření

### v1.1.4 (2025) - 🐛 Automatické vytvoření souboru aktualizace knihovny filamentů

- 🐛 **Automatické vytvoření souboru aktualizace** - Opraven problém, kde `update_filamentLibrary.json` nebyl automaticky vytvořen:
  - Soubor je nyní automaticky vytvořen z `filamentLibrarySample.json` při prvním spuštění
  - Zajišťuje, že soubor aktualizace je vždy k dispozici pro sloučení
  - Vytváří pouze, pokud soubor neexistuje (nepřepisuje existující)
  - Vylepšené zpracování chyb a protokolování pro operace se souborem aktualizace

### v1.1.3 (2025) - 🪟 Opravy kompatibility s Windows

- 🪟 **Oprava kompatibility s Windows** - Vylepšení načítání knihovny filamentů:
  - Dynamický import pro velké JSON soubory (místo statického importu)
  - Mechanismus cache pro zabránění vícečetného načítání
  - Vylepšené zpracování chyb pro případy nenalezeného souboru ve Windows
  - Meziplatformní kompatibilita (Windows, macOS, Linux)
- 🔧 **Vylepšení zpracování chyb** - Vylepšené chybové zprávy:
  - Správné zpracování chybových zpráv specifických pro Windows
  - Tiché zpracování případů nenalezeného souboru (ne jako varování)

### v1.1.2 (2025) - 🌍 Výběr jazyka a vylepšení

- 🌍 **Výběr jazyka při prvním spuštění** - Moderní, animované dialogové okno pro výběr jazyka při prvním spuštění:
  - Podpora 13 jazyků s ikonami vlajek
  - Design respektující motiv
  - Plynulé animace
  - Tutoriál běží ve vybraném jazyce
- 🔄 **Obnovení továrního nastavení** - Funkce pro úplné smazání dat:
  - Smaže všechna uložená data (tiskárny, filamenty, nabídky, zákazníci, nastavení)
  - Potvrzovací dialog pro nebezpečné operace
  - Aplikace se restartuje jako při prvním spuštění
- 🎨 **Vylepšení UI**:
  - Oprava kontrastu textu v patičce (dynamický výběr barvy)
  - Okamžité uložení při změně jazyka
  - Vylepšené umístění tooltipů
- 📚 **Překlady tutoriálu** - Úplný překlad tutoriálu ve všech podporovaných jazycích (přidána ruština, ukrajinština, čínština)

### v1.1.1 (2025) - 🎨 Vylepšení rozvržení hlavičky

- 📐 **Reorganizace hlavičky** - Struktura hlavičky se třemi částmi:
  - Vlevo: Menu + Logo + Nadpis
  - Uprostřed: Breadcrumb (dynamicky se zmenšuje)
  - Vpravo: Rychlé akce + Karta informací o stavu
- 📊 **Karta informací o stavu** - Kompaktní, moderní styl:
  - "Další uložení" (štítek a hodnota)
  - Datum a čas (naskládané)
  - Vždy umístěno vpravo
- 📱 **Responzivní design** - Vylepšené body přerušení:
  - Skrýt breadcrumb <1000px
  - Skrýt datum <900px
  - Skrýt "Další uložení" <800px
  - Kompaktní rychlé akce <700px
- 🔢 **Oprava formátování čísel** - Zaokrouhlování procent pokroku načítání

### v1.1.0 (2025) - 🚀 Aktualizace funkcí

- 🔍 **Rozšířené globální vyhledávání** - Vylepšená funkce vyhledávání:
  - Vyhledávání nabídek podle jména zákazníka, ID, stavu a data
  - Vyhledávání filamentů z databáze (filamentLibrary) podle značky, typu a barvy
  - Přidání filamentů do uloženého seznamu jedním kliknutím z výsledků vyhledávání
  - Vylepšené výsledky vyhledávání s indikátory typu
- 💀 **Systém načítání Skeleton** - Spektakulární zážitek z načítání:
  - Animované skeleton komponenty s efekty shimmer
  - Sledování průběhu s vizuálními indikátory
  - Kroky načítání se zaškrtnutím pro dokončené kroky
  - Plynulé přechody fade-in
  - Barvy skeleton přizpůsobené motivu
  - Načítání skeleton specifické pro stránku
- 🎨 **Vylepšení UI/UX**:
  - Lepší stavy načítání
  - Vylepšená zpětná vazba uživatele během načítání dat
  - Vylepšený vizuální zážitek

### v1.0.0 (2025) - 🎉 První stabilní verze

- 🎨 **Moderní UI komponenty** - Kompletní přepracování UI s moderními komponentami:
  - Komponenta Empty State pro lepší uživatelský zážitek
  - Komponenta Card s hover efekty
  - Komponenta Progress Bar pro operace exportu/importu PDF
  - Komponenta Tooltip s integrací tématu
  - Navigace Breadcrumb pro jasnou hierarchii stránek
- ⚡ **Rychlé akce** - Tlačítka rychlých akcí v hlavičce pro rychlejší pracovní tok:
  - Tlačítka rychlého přidání pro Filamenty, Tiskárny a Zákazníky
  - Dynamická tlačítka na základě aktivní stránky
  - Integrace klávesových zkratek
- 🔍 **Globální vyhledávání (Command Palette)** - Výkonná funkce vyhledávání:
  - `Ctrl/Cmd+K` pro otevření globálního vyhledávání
  - Vyhledávání stránek a rychlých akcí
  - Navigace klávesnicí (↑↓, Enter, Esc)
  - Styl přizpůsobený tématu
- ⏪ **Funkce Zpět/Znovu** - Správa historie pro Filamenty:
  - `Ctrl/Cmd+Z` pro zpět
  - `Ctrl/Cmd+Shift+Z` pro znovu
  - Vizuální tlačítka zpět/znovu v UI
  - Podpora historie 50 kroků
- ⭐ **Oblíbené Filamenty** - Označujte a filtrujte oblíbené filamenty:
  - Ikona hvězdy pro přepnutí stavu oblíbeného
  - Filtr pro zobrazení pouze oblíbených
  - Trvalý stav oblíbeného
- 📦 **Hromadné operace** - Efektivní hromadná správa:
  - Výběr checkbox pro více filamentů
  - Funkce Vybrat vše / Zrušit výběr
  - Hromadné mazání s potvrzovacím dialogem
  - Vizuální indikátory výběru
- 🎨 **Modální dialogy** - Moderní modální zážitek:
  - Modaly s rozmazaným pozadím pro formuláře přidání/úpravy
  - Vstupní pole pevné velikosti
  - Klávesa Escape pro zavření
  - Plynulé animace s framer-motion
- ⌨️ **Klávesové zkratky** - Vylepšený systém zkratek:
  - Přizpůsobitelné klávesové zkratky
  - Dialog nápovědy zkratek (`Ctrl/Cmd+?`)
  - Úprava zkratek s zachycením kláves
  - Trvalé uložení zkratek
- 📝 **Systém protokolování** - Komplexní protokolování:
  - Oddělené soubory protokolů pro frontend a backend
  - Rozlišení adresáře protokolů nezávislé na platformě
  - Automatická rotace protokolů
  - Integrace konzole
- 🔔 **Vylepšení oznámení** - Lepší systém oznámení:
  - Jméno zákazníka v oznámeních o smazání nabídky
  - Podpora oznámení napříč platformami
  - Vylepšená správa chyb
- 🎯 **Vylepšení UI/UX**:
  - Pevné velikosti vstupních polí
  - Lepší rozvržení formulářů
  - Vylepšená integrace tématu
  - Zvýšená dostupnost

### v0.6.0 (2025)

#### 🐛 Opravy chyb
- **Optimalizace protokolování**: Snížení nadměrného a duplicitního protokolování
  - Informační protokoly se zobrazují pouze v režimu vývoje (DEV)
  - Chyby se stále protokolují i v produkčních sestaveních
  - Inicializace FilamentLibrary probíhá tiše
- **Oprava falešných varování**: Rozlišení barvy filamentu varuje pouze tehdy, když je knihovna již načtena a barva stále nebyla nalezena
  - Zabraňuje falešným varováním během asynchronního načítání knihovny
  - Varování se zobrazují pouze u skutečných problémů
- **Oprava duplikace kontroly aktualizací**: Odstranění duplicitních volání kontroly aktualizací
- **Oprava protokolování klávesových zkratek**: Protokoluje pouze tehdy, když existuje zkratka, přeskočí neplatné kombinace

#### ⚡ Vylepšení výkonu
- Optimalizace protokolování operací úložiště (pouze režim DEV)
- Méně operací konzole v produkčních sestaveních
- Čistší výstup konzole během vývoje

## 📸 Screenshoty

Aplikace obsahuje:
- Domovský dashboard se statistikami
- Správu filamentů
- Správu tiskáren
- Kalkulačku výpočtu nákladů
- Seznam nabídek a detailní zobrazení
- Dashboard stavu a časovou osu
- Export PDF a vestavěný náhled

## 🚀 Instalace

### Předpoklady

- **Rust**: [Instalace Rustu](https://rustup.rs/)
- **Node.js**: [Instalace Node.js](https://nodejs.org/) (verze 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Specifické pro macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Specifické pro Linux (Ubuntu/Debian)

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

### Specifické pro Windows

- Visual Studio Build Tools (nástroje pro sestavení C++)
- Windows SDK

## 📦 Sestavení

### Spuštění v režimu vývoje

```bash
cd src-tauri
cargo tauri dev
```

### Produkční sestavení (Vytvoření samostatné aplikace)

```bash
cd src-tauri
cargo tauri build
```

Samostatná aplikace bude umístěna v:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` nebo `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Beta sestavení

Projekt obsahuje větev `beta` nakonfigurovanou pro samostatná sestavení:

```bash
# Přepnutí na beta větev
git checkout beta

# Místní beta sestavení
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Beta sestavení automaticky nastaví proměnnou `VITE_IS_BETA=true`, takže se v menu zobrazí "BETA".

**GitHub Actions**: Při pushování do větve `beta` se automaticky spustí workflow `.github/workflows/build-beta.yml`, který sestaví beta verzi pro všechny tři platformy.

Podrobný průvodce: [BUILD.md](BUILD.md) a [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Vývoj

### Struktura projektu

```
3DPrinterCalcApp/
├── frontend/          # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React komponenty
│   │   ├── utils/        # Pomocné funkce
│   │   └── types.ts      # TypeScript typy
│   └── package.json
├── src-tauri/         # Rust backend
│   ├── src/           # Rust zdrojový kód
│   ├── Cargo.toml     # Rust závislosti
│   └── tauri.conf.json # Tauri konfigurace
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
- tauri-plugin-store (ukládání dat)
- tauri-plugin-log (protokolování)

## 📖 Použití

1. **Přidat tiskárnu**: Menu Tiskárny → Přidat novou tiskárnu
2. **Přidat filament**: Menu Filamenty → Přidat nový filament
3. **Vypočítat náklady**: Menu Kalkulačka → Vybrat tiskárnu a filamenty
4. **Uložit nabídku**: Kliknout na tlačítko "Uložit jako nabídku" v kalkulačce
5. **Export PDF**: Menu Nabídky → Vybrat nabídku → Export PDF
6. **Kontrola beta verzí**: Menu Nastavení → Povolit možnost "Kontrolovat beta aktualizace"

## 🔄 Správa verzí a aktualizace

Aplikace automaticky kontroluje GitHub Releases pro nové verze:

- **Při spuštění**: Automaticky kontroluje aktualizace
- **Každých 5 minut**: Automaticky znovu kontroluje
- **Notifikace**: Pokud je k dispozici nová verze, zobrazí se notifikace v pravém horním rohu

### Kontrola beta verzí

Pro kontrolu beta verzí:

1. Přejděte do menu **Nastavení**
2. Povolte možnost **"Kontrolovat beta aktualizace"**
3. Aplikace okamžitě kontroluje beta verze
4. Pokud je k dispozici novější beta verze, zobrazí se notifikace
5. Klikněte na tlačítko "Stáhnout", abyste přešli na stránku GitHub Release

**Příklad**: Pokud používáte verzi RELEASE (např. 0.1.0) a povolíte kontrolu beta, aplikace najde nejnovější beta verzi (např. 0.2.0-beta) a upozorní vás, pokud je novější.

Podrobný průvodce: [VERSIONING.md](VERSIONING.md)

## 🛠️ Technologický stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Ukládání dat**: Tauri Store Plugin (JSON soubory)
- **Stylování**: Inline styly (commonStyles)
- **i18n**: Vlastní systém překladů
- **CI/CD**: GitHub Actions (automatické sestavení pro macOS, Linux, Windows)
- **Správa verzí**: Integrace s GitHub Releases API

## 📝 Licence

Tento projekt je licencován pod **licencí MIT**, avšak **komerční použití vyžaduje povolení**.

Úplné autorské právo aplikace: **Lekszikov Miklós (LexyGuru)**

- ✅ **Osobní a vzdělávací použití**: Povoleno
- ❌ **Komerční použití**: Pouze s výslovným písemným povolením

Podrobnosti: soubor [LICENSE](LICENSE)

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Poděkování

- [Tauri](https://tauri.app/) - Rámec pro desktopové aplikace napříč platformami
- [React](https://react.dev/) - Frontendový rámec
- [Vite](https://vitejs.dev/) - Nástroj pro sestavení

## 📚 Další dokumentace

- [BUILD.md](BUILD.md) - Podrobný průvodce sestavením pro všechny platformy
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Vytvoření samostatné aplikace
- [VERSIONING.md](VERSIONING.md) - Správa verzí a aktualizace
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Vytvoření prvního GitHub Release

## 🌿 Struktura větví

- **`main`**: Stabilní verze vydání (RELEASE build)
- **`beta`**: Beta verze a vývoj (BETA build)

Při pushování do větve `beta` se automaticky spustí workflow GitHub Actions, který sestaví beta verzi.

## 📋 Historie verzí

### v1.1.1 (2025) - 🎨 Vylepšení rozvržení hlavičky

- 🎨 **Přepracování hlavičky** - Kompletní revize rozvržení hlavičky:
  - Struktura tří sekcí (vlevo: logo/menu, střed: breadcrumb, vpravo: akce/status)
  - Karta informací o stavu vždy umístěna úplně vpravo
  - Moderní design typu karty pro informace o stavu
  - Lepší mezery a zarovnání v celé hlavičce
- 📱 **Responzivní design** - Lepší zážitek na mobilních zařízeních a malých obrazovkách:
  - Dynamické body přerušení pro viditelnost prvků
  - Opravy zkrácení breadcrumb
  - Rychlé akce se přizpůsobují velikosti obrazovky
  - Responzivní velikost karty informací o stavu
- 🔧 **Opravy rozvržení**:
  - Opraveny problémy s přetečením a zkrácením breadcrumb
  - Vylepšení umístění karty informací o stavu
  - Lepší správa flexbox rozvržení
  - Vylepšené mezery a mezery mezi prvky

### v1.1.0 (2025) - 🚀 Aktualizace funkcí

- 🔍 **Rozšířené globální vyhledávání** - Vylepšená funkce vyhledávání
- 💀 **Systém načítání Skeleton** - Spektakulární zážitek z načítání
- 🎨 **Vylepšení UI/UX** - Lepší stavy načítání a vizuální zážitek

### v1.0.0 (2025) - 🎉 První stabilní verze

- 🎨 **Moderní UI komponenty** - Kompletní přepracování UI s moderními komponentami
- ⚡ **Rychlé akce** - Tlačítka rychlých akcí v záhlaví
- 🔍 **Globální vyhledávání** - Výkonná funkce vyhledávání
- ⏪ **Funkce Zpět/Znovu** - Správa historie
- ⭐ **Oblíbené filamenty** - Označení a filtrování oblíbených filamentů
- 📦 **Hromadné operace** - Efektivní hromadná správa
- 🎨 **Modální dialogy** - Moderní modální zážitek
- ⌨️ **Klávesové zkratky** - Vylepšený systém zkratek
- 📝 **Systém protokolování** - Komplexní protokolování
- 🔔 **Vylepšení oznámení** - Lepší systém oznámení

### v0.6.0 (2025)

- 👥 **Databáze zákazníků** - Kompletní systém správy zákazníků s:
  - Přidávání, úprava, mazání zákazníků
  - Kontaktní informace (e-mail, telefon)
  - Firemní údaje (volitelné)
  - Adresa a poznámky
  - Statistiky zákazníků (celkový počet nabídek, datum poslední nabídky)
  - Funkce vyhledávání
  - Integrace s Kalkulačkou pro rychlý výběr zákazníka
- 📊 **Historie a trendy cen** - Sledování změn cen filamentu:
  - Automatické sledování historie cen při aktualizaci cen filamentu
  - Vizualizace cenových trendů s grafy SVG
  - Cenové statistiky (aktuální, průměrná, min, max cena)
  - Analýza trendů (rostoucí, klesající, stabilní)
  - Tabulka historie cen s podrobnými informacemi o změnách
  - Varování při významných změnách cen (změny 10%+)
  - Zobrazení historie cen v komponentě Filamenty během úpravy
- 🔧 **Vylepšení**:
  - Vylepšená Kalkulačka s rozbalovacím menu výběru zákazníka
  - Integrace historie cen do formuláře úpravy filamentu
  - Vylepšená trvalost dat pro zákazníky a historii cen

### v0.5.58 (2025)
- 🌍 **Podpora ukrajinštiny a ruštiny** – Přidána plná podpora překladů pro ukrajinštinu (uk) a ruštinu (ru):
  - Kompletní překladové soubory se všemi 813 překladovými klíči pro oba jazyky
  - Podpora ukrajinského locale (uk-UA) pro formátování data/času
  - Podpora ruského locale (ru-RU) pro formátování data/času
  - Všechny soubory README aktualizovány s novými jazyky v jazykovém menu
  - Počet jazyků aktualizován z 12 na 14 jazyků
  - Vytvořeny dokumentační soubory README.uk.md a README.ru.md

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
- 🌍 **Úplné jazykové překlady** – Dokončeny úplné překlady pro 6 zbývajících jazykových souborů: čeština (cs), španělština (es), italština (it), polština (pl), portugalština (pt) a slovenština (sk). Každý soubor obsahuje všech 813 překladových klíčů, takže aplikace je nyní plně podporována v těchto jazycích.
- 🔒 **Oprava oprávnění Tauri** – Soubor `update_filamentLibrary.json` je nyní explicitně povolen pro operace čtení, zápisu a vytváření v souboru možností Tauri, což zajišťuje spolehlivé fungování aktualizací knihovny filamentů.

### v0.5.55 (2025)
- 🧵 **Vylepšení úpravy nabídek** – Uložené nabídky nyní umožňují přímý výběr nebo úpravu tiskárny, přičemž náklady se automaticky přepočítávají spolu se změnami filamentu.
- 🧮 **Přesnost a protokolování** – Podrobné protokolování pomáhá sledovat kroky výpočtu nákladů (filament, elektřina, sušení, použití), což usnadňuje hledání chyb v importovaných souborech G-code.
- 🌍 **Doplňky překladů** – Přidány nové klíče a popisky i18n pro selektor tiskárny, což zajišťuje konzistentní UI editoru ve všech podporovaných jazycích.
- 📄 **Aktualizace dokumentace** – README rozšířeno o popis nových funkcí, vydání v0.5.55 přidáno do historie verzí.

### v0.5.11 (2025)
- 🗂️ **Jazyková modularizace** – Rozšíření aplikace o překladové soubory organizované do nového adresáře `languages/`, což usnadňuje přidávání nových jazyků a správu existujících textů.
- 🌍 **Sjednocené překlady UI** – Rozhraní pro import sliceru nyní funguje z centrálního překladového systému, všechny tlačítka, chybové zprávy a souhrny jsou lokalizovány.
- 🔁 **Aktualizace výběru jazyka** – V Nastavení se výběr jazyka načítá na základě objevených jazykových souborů, takže v budoucnu stačí přidat nový jazykový soubor.
- 🌐 **Nové jazykové základy** – Překladové soubory připravené pro francouzštinu, italštinu, španělštinu, polštinu, češtinu, slovenštinu, brazilskou portugalštinu a zjednodušenou čínštinu (s anglickým fallbackem), skutečné překlady lze snadno doplnit.

### v0.5.0 (2025)
- 🔎 **Tlačítko porovnání cen filamentu** – Každý vlastní filament má nyní ikonu lupy, která otevírá vyhledávání Google/Bing na základě značky/typu/barvy, poskytuje rychlé odkazy na aktuální ceny.
- 💶 **Podpora desetinné ceny** – Pole ceny filamentu nyní přijímají desetinná čísla (14.11 € atd.), vstup je automaticky validován a formátován při uložení.
- 🌐 **Reverzní vyhledávání fallback** – Pokud shell Tauri nemůže otevřít prohlížeč, aplikace automaticky otevře novou kartu, takže vyhledávání funguje na všech platformách.

### v0.4.99 (2025)
- 🧾 **Integrovaný import G-code v kalkulátoru** – Nový modální `SlicerImportModal` v horní části kalkulátoru, který načítá exporty G-code/JSON jedním kliknutím, přenáší čas tisku, množství filamentu a vytváří návrh nabídky.
- 📊 **Data sliceru z hlavičky** – Hodnoty hlavičky G-code `total filament weight/length/volume` automaticky přebírají souhrny, přesně zpracovávají ztráty při změně barvy.

### v0.4.98 (2025)
- 🧵 **Podpora vícebarevného filamentu** – Knihovna filamentů a UI pro správu nyní samostatně označují vícebarevné (duhové/duální/trojbarevné) filamenty s poznámkami a náhledem duhy.
- 🌐 **Automatický překlad při importu CSV** – Názvy barev importované z externí databáze dostávají maďarské a německé štítky, čímž zůstává výběr barev vícejazyčný bez ruční úpravy.
- 🔄 **Sloučení knihovny aktualizací** – Obsah souboru `update_filamentLibrary.json` je automaticky deduplikován a sloučen s existující knihovnou při spuštění, bez přepsání uživatelských úprav.
- 📁 **Aktualizace převodníku CSV** – Skript `convert-filament-csv.mjs` již nepřepisuje trvalý `filamentLibrary.json`, místo toho vytváří aktualizační soubor a generuje vícejazyčné štítky.
- ✨ **Ladění animačního zážitku** – Nové možnosti přechodu stránek (flip, parallax), výběr stylu mikrointerakce, pulzující zpětná vazba, kostrový seznam knihovny filamentů a jemně vyladěné efekty hover karet.
- 🎨 **Rozšíření dílny motivů** – Čtyři nové vestavěné motivy (Forest, Pastel, Charcoal, Midnight), okamžité duplikování aktivního motivu pro vlastní úpravu, vylepšené zpracování gradientu/kontrastu a zjednodušený proces sdílení.

### v0.4.0 (2025)
- 🧵 **Integrace databáze filamentů** – Více než 12 000 továrních barev z vestavěné JSON knihovny (snímek filamentcolors.xyz), uspořádaných podle značky a materiálu
- 🪟 **Panely výběru pevné velikosti** – Seznamy značek a typů otevírané tlačítkem, prohledávatelné, posouvatelné, které se vzájemně vylučují, čímž je formulář transparentnější
- 🎯 **Vylepšení výběru barev** – Když jsou rozpoznány prvky knihovny, povrchová úprava a hex kód jsou automaticky nastaveny, samostatná pole dostupná při přepnutí na vlastní režim
- 💾 **Editor knihovny filamentů** – Nová záložka nastavení s popup formulářem, zpracování duplikátů a trvalé ukládání `filamentLibrary.json` založené na Tauri FS
- 📄 **Aktualizace dokumentace** – Nová odrážka v hlavním seznamu funkcí pro knihovnu barev filamentů, čištění README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Předvolby filtrů nabídek** – Ukládatelné, pojmenovatelné nastavení filtrů, výchozí rychlé předvolby (Dnes, Včera, Týdenní, Měsíční atd.) a aplikace/odstranění jedním kliknutím
- 📝 **Poznámky ke změně stavu** – Nový modální pro úpravu stavu nabídky s volitelnou poznámkou uloženou v historii stavu
- 🖼️ **Rozšíření exportu PDF** – Obrázky uložené s filamenty se zobrazují v tabulce PDF se stylem optimalizovaným pro tisk
- 🧾 **Datový list firemní značky** – Název společnosti, adresa, daňové ID, bankovní účet, kontakt a nahrání loga; automaticky zahrnuto do hlavičky PDF
- 🎨 **Výběr šablony PDF** – Tři styly (Moderní, Minimalistický, Profesionální) k výběru vzhledu nabídky
- 👁️ **Integrovaný náhled PDF** – Samostatné tlačítko u detailů nabídky pro okamžitou vizuální kontrolu před exportem
- 📊 **Dashboard stavu** – Karty stavu se souhrnem, rychlé filtry stavu a časová osa nedávných změn stavu v nabídkách
- 📈 **Statistické grafy** – Graf trendu příjmů/nákladů/zisku, koláčový graf distribuce filamentů, sloupcový graf příjmů na tiskárnu, vše exportovatelné ve formátu SVG/PNG a lze také uložit jako PDF

### v0.3.8 (2025)
- 🐛 **Oprava formátování čísel sestavy** - Formátování na 2 desetinná místa v sestavách:
  - Hlavní statistické karty (Příjmy, Výdaje, Zisk, Nabídky): `formatNumber(formatCurrency(...), 2)`
  - Hodnoty nad grafy: `formatNumber(formatCurrency(...), 2)`
  - Podrobné statistiky (Průměrný zisk/nabídka): `formatNumber(formatCurrency(...), 2)`
  - Nyní konzistentní s domovskou stránkou (např. `6.45` místo `6.45037688333333`)
- 🎨 **Oprava navigace záložek nastavení** - Vylepšení barvy pozadí a textu:
  - Pozadí sekce navigace záložek: `rgba(255, 255, 255, 0.85)` pro gradientní motivy + `blur(10px)`
  - Pozadí tlačítek záložek: Aktivní `rgba(255, 255, 255, 0.9)`, neaktivní `rgba(255, 255, 255, 0.7)` pro gradientní motivy
  - Barva textu tlačítek záložek: `#1a202c` (tmavá) pro gradientní motivy pro čitelnost
  - Efekty hover: `rgba(255, 255, 255, 0.85)` pro gradientní motivy
  - Filtr pozadí: `blur(8px)` pro tlačítka záložek, `blur(10px)` pro sekci navigace

### v0.3.7 (2025)
- 🎨 **Modernizace designu** - Kompletní vizuální transformace s animacemi a novými motivy:
  - Nové motivy: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nových moderních motivů)
  - Animace Framer Motion integrované (fadeIn, slideIn, stagger, efekty hover)
  - Efekt glassmorphism pro gradientní motivy (rozostření + průhledné pozadí)
  - Efekt neonového záření pro neon/cyberpunk motivy
  - Modernizované karty a povrchy (větší padding, zaoblené rohy, lepší stíny)
- 🎨 **Vylepšení barev** - Lepší kontrast a čitelnost pro všechny motivy:
  - Tmavý text (#1a202c) na bílém/světlém pozadí pro gradientní motivy
  - Vstupní pole, štítky, barevné označení h3 vylepšeno ve všech komponentech
  - Konzistentní zpracování barev na všech stránkách (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Stín textu přidán pro gradientní motivy pro lepší čitelnost
- 📊 **Vylepšení stylu tabulky** - Rozmazanější pozadí a lepší kontrast textu:
  - Barva pozadí: rgba(255, 255, 255, 0.85) pro gradientní motivy (dříve 0.95)
  - Filtr pozadí: blur(8px) pro rozmazanější efekt
  - Barva textu: #333 (tmavě šedá) pro gradientní motivy pro lepší čitelnost
  - Pozadí buněk: rgba(255, 255, 255, 0.7) pro rozmazanější efekt
- 🎨 **Vylepšení barvy pozadí karet** - Rozmazanější pozadí, lepší čitelnost:
  - Barva pozadí: rgba(255, 255, 255, 0.75) pro gradientní motivy (dříve 0.95)
  - Filtr pozadí: blur(12px) pro silnější rozostření
  - Neprůhlednost: 0.85 pro matný efekt
  - Barva textu: #1a202c (tmavá) pro gradientní motivy
- 📈 **Modernizace domovské stránky** - Týdenní/měsíční/roční statistiky a porovnání období:
  - Karty porovnání období (Týdenní, Měsíční, Roční) s barevnými akcentními pruhy
  - Komponenty StatCard modernizovány (ikony s barevnými pozadími, akcentní pruhy)
  - Sekce souhrnu uspořádána v kartách s ikonami
  - Sekce porovnání období přidána
- 🐛 **Oprava filtru data** - Přesnější filtrování období:
  - Reset času (00:00:00) pro přesné porovnání
  - Horní limit nastaven (dnes je zahrnuto)
  - Týdenní: posledních 7 dní (dnes zahrnuto)
  - Měsíční: posledních 30 dní (dnes zahrnuto)
  - Roční: posledních 365 dní (dnes zahrnuto)
- 🎨 **Modernizace postranního panelu** - Ikony, glassmorphism, efekty neonového záření
- 🎨 **Modernizace ConfirmDialog** - Vlastnost motivu přidána, harmonizované barevné označení

### v0.3.6 (2025)
- 🎨 **Reorganizace UI nastavení** - Systém záložek (Obecné, Vzhled, Pokročilé, Správa dat) pro lepší UX a čistší navigaci
- 🌐 **Vylepšení překladů** - Veškerý hardcodovaný maďarský text přeložen ve všech komponentech (HU/EN/DE):
  - Calculator: "výpočet nákladů 3D tisku"
  - Filaments: "Spravovat a upravovat filamenty"
  - Printers: "Spravovat tiskárny a systémy AMS"
  - Offers: "Spravovat a exportovat uložené nabídky"
  - Home: Názvy statistik, souhrn, štítky exportu CSV (hod/Std/hrs, ks/Stk/pcs)
  - VersionHistory: "Historie verzí není k dispozici"
- 💾 **Systém cache historie verzí** - Fyzické uložení do localStorage, kontrola GitHub každou 1 hodinu:
  - Detekce změn založená na kontrolním součtu (stahuje pouze při nových vydáních)
  - Samostatná cache pro každý jazyk (Maďarština/Angličtina/Němčina)
  - Rychlé přepínání jazyka z cache (žádné nové překlady)
  - Automatická invalidace cache při novém vydání
- 🌐 **Inteligentní překlad** - Překládá pouze nová vydání, používá staré překlady z cache:
  - Validace cache (neukládat do cache, pokud stejný text)
  - API MyMemory fallback, pokud překlad selže
  - Auto-reset čítače chyb (resetuje se po 5 minutách)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate odstraněn** - Pouze použití API MyMemory (chyby 400 eliminovány, požadavek GET, žádný CORS)
- 🔄 **Refaktoring tlačítka opakovat** - Jednodušší mechanismus spouštění s useEffect
- 🐛 **Opravy chyb sestavení** - Problémy s odsazením JSX opraveny (sekce Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integrace API MyMemory** - Bezplatné překladové API místo LibreTranslate
- ✅ **Otevření stránky vydání GitHub** - Tlačítko pro otevření stránky vydání GitHub při limitu rychlosti
- ✅ **Vylepšení zpracování chyb limitu rychlosti** - Jasné chybové zprávy a tlačítko opakovat
- 🐛 **Opravy chyb sestavení** - Nepoužívané importy odstraněny (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Vylepšení validace vstupu** - Centrální nástroj validace vytvořen a integrován do komponent Calculator, Filaments, Printers
- ✅ **Chybové zprávy validace** - Vícejazyčné (HU/EN/DE) chybové zprávy s toast notifikacemi
- ✅ **Optimalizace výkonu** - Komponenty lazy loading (rozdělení kódu), optimalizace useMemo a useCallback
- ✅ **Inicializace specifická pro platformu** - Základy inicializace specifické pro platformu macOS, Windows, Linux
- 🐛 **Oprava chyby sestavení** - Funkce kontextového menu Printers.tsx přidány

### v0.3.3 (2025)
- 🖱️ **Funkce přetažení a puštění** - Změna pořadí nabídek, filamentů a tiskáren přetažením
- 📱 **Kontextová menu** - Menu pravého tlačítka myši pro rychlé akce (upravit, smazat, duplikovat, exportovat PDF)
- 🎨 **Vizuální zpětná vazba** - Změna neprůhlednosti a kurzoru během přetažení a puštění
- 🔔 **Toast notifikace** - Notifikace po změně pořadí
- 🐛 **Oprava chyby sestavení** - Oprava Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Funkce šablon** - Ukládání a načítání výpočtů jako šablon v komponentě Calculator
- 📜 **Historie/Verzování pro nabídky** - Verzování nabídek, zobrazení historie, sledování změn
- 🧹 **Oprava duplikace** - Duplikované funkce exportu/importu CSV/JSON odstraněny z komponent Filaments a Printers (zůstaly v Settings)

### v0.3.1 (2025)
- ✅ **Vylepšení validace vstupu** - Záporná čísla zakázána, maximální hodnoty nastaveny (hmotnost filamentu, čas tisku, výkon atd.)
- 📊 **Export/Import CSV/JSON** - Hromadný export/import filamentů a tiskáren ve formátu CSV a JSON
- 📥 **Tlačítka Importovat/Exportovat** - Snadný přístup k funkcím exportu/importu na stránkách Filaments a Printers
- 🎨 **Vylepšení prázdných stavů** - Informativní prázdné stavy zobrazeny, když nejsou žádná data

### v0.3.0 (2025)
- ✏️ **Úprava nabídek** - Upravit uložené nabídky (název zákazníka, kontakt, popis, procento zisku, filamenty)
- ✏️ **Upravit filamenty v nabídce** - Upravit, přidat, smazat filamenty v rámci nabídky
- ✏️ **Tlačítko úpravy** - Nové tlačítko úpravy vedle tlačítka smazat v seznamu nabídek
- 📊 **Funkce exportu statistik** - Exportovat statistiky ve formátu JSON nebo CSV z domovské stránky
- 📈 **Generování sestav** - Generovat týdenní/měsíční/roční/všechny sestavy ve formátu JSON s filtrováním období
- 📋 **Zobrazení historie verzí** - Zobrazit historii verzí v nastavení, integrace API GitHub Releases
- 🌐 **Překlad vydání GitHub** - Automatický překlad Maďarština -> Angličtina/Němčina (API MyMemory)
- 💾 **Cache překladů** - Cache localStorage pro přeložené poznámky k vydání
- 🔄 **Dynamická historie verzí** - Verze beta a release zobrazeny samostatně
- 🐛 **Opravy chyb** - Nepoužívané proměnné odstraněny, čištění kódu, chyby linteru opraveny

### v0.2.55 (2025)
- 🖥️ **Funkce Console/Log** - Nová položka menu Console pro ladění a zobrazení logů
- 🖥️ **Nastavení Console** - Může povolit zobrazení položky menu Console v nastavení
- 📊 **Shromažďování logů** - Automatické zaznamenávání všech zpráv console.log, console.error, console.warn
- 📊 **Zaznamenávání globálních chyb** - Automatické zaznamenávání událostí chyb okna a nezpracovaných odmítnutí promise
- 🔍 **Filtrování logů** - Filtrovat podle úrovně (all, error, warn, info, log, debug)
- 🔍 **Export logů** - Exportovat logy ve formátu JSON
- 🧹 **Mazání logů** - Mazat logy jedním tlačítkem
- 📜 **Auto-posun** - Automatické posouvání k novým logům
- 💾 **Úplné protokolování** - Všechny kritické operace protokolovány (uložit, exportovat, importovat, smazat, exportovat PDF, stáhnout aktualizaci)
- 🔄 **Oprava tlačítka aktualizace** - Tlačítko stahování nyní používá plugin shell Tauri, funguje spolehlivě
- 🔄 **Protokolování aktualizace** - Úplné protokolování kontroly a stahování aktualizace
- ⌨️ **Klávesové zkratky** - `Ctrl/Cmd+N` (nový), `Ctrl/Cmd+S` (uložit), `Escape` (zrušit), `Ctrl/Cmd+?` (nápověda)
- ⌨️ **Oprava klávesových zkratek macOS** - Zpracování Cmd vs Ctrl, zpracování událostí fáze zachycení
- ⏳ **Stavy načítání** - Komponenta LoadingSpinner pro stavy načítání
- 💾 **Zálohování a obnovení** - Úplné zálohování a obnovení dat s dialogem Tauri a pluginy fs
- 🛡️ **Hranice chyb** - React ErrorBoundary pro zpracování chyb na úrovni aplikace
- 💾 **Automatické ukládání** - Automatické ukládání s omezením času s konfigurovatelným intervalem (výchozí 30 sekund)
- 🔔 **Nastavení notifikací** - Toast notifikace zapnuto/vypnuto a nastavení trvání
- ⌨️ **Menu nápovědy zkratek** - Seznam klávesových zkratek v modálním okně (`Ctrl/Cmd+?`)
- 🎬 **Animace a přechody** - Plynulé přechody a animace klíčových snímků (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Kontextová nápověda pro všechny důležité prvky při najetí myší
- 🐛 **Oprava chyby renderování React** - Asynchronní operace loggeru konzole, aby neblokovala renderování
- 🔧 **Aktualizace num-bigint-dig** - Aktualizováno na v0.9.1 (oprava varování o zastaralosti)

### v0.2.0 (2025)
- 🎨 **Systém motivů** - 6 moderních motivů (Světlý, Tmavý, Modrý, Zelený, Fialový, Oranžový)
- 🎨 **Výběr motivu** - Motiv vybratelný v nastavení, okamžitě se projeví
- 🎨 **Úplná integrace motivů** - Všechny komponenty (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) používají motivy
- 🎨 **Dynamické barvy** - Všechny hardcodované barvy nahrazeny barvami motivu
- 🎨 **Responzivní motiv** - Nabídky a zápatí Sidebar také používají motivy
- 💱 **Dynamická konverze měny** - Nabídky jsou nyní zobrazeny v měně aktuálních nastavení (automatická konverze)
- 💱 **Změna měny** - Měna změněná v nastavení okamžitě ovlivňuje zobrazení nabídek
- 💱 **Konverze měny PDF** - Export PDF je také vytvořen v měně aktuálních nastavení
- 💱 **Konverze ceny filamentu** - Ceny filamentů jsou také automaticky převedeny

### v0.1.85 (2025)
- 🎨 **Vylepšení UI/UX**:
  - ✏️ Duplikované ikony odstraněny (Tlačítka Upravit, Uložit, Zrušit)
  - 📐 Sekce Export/Import v rozvržení 2 sloupců (vedle sebe)
  - 💾 Nativní dialog ukládání použit pro ukládání PDF (dialog Tauri)
  - 📊 Toast notifikace pro ukládání PDF (úspěch/chyba)
  - 🖼️ Velikost okna aplikace: 1280x720 (dříve 1000x700)
- 🐛 **Opravy chyb**:
  - Chybějící informace přidány v generování PDF (customerContact, zisk v samostatném řádku, příjmy)
  - Překladové klíče přidány (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Vylepšení exportu PDF**:
  - Kontakt zákazníka (e-mail/telefon) zobrazen v PDF
  - Výpočet zisku v samostatném řádku s procentem zisku
  - Příjmy (Celková cena) v samostatném řádku, zvýrazněno
  - Úplný rozpis nákladů v PDF

### v0.1.56 (2025)
- ✨ **Vylepšení rozvržení kalkulátoru**: Přetečení karet filamentů opraveno, responzivní flexbox rozvržení
- ✨ **Responzivní rozpis nákladů**: Nyní dynamicky reaguje na změny velikosti okna
- 🐛 **Oprava chyby**: Obsah nepřetéká z okna při přidávání filamentu
- 🐛 **Oprava chyby**: Všechny prvky Calculator správně reagují na změny velikosti okna

### v0.1.55 (2025)
- ✨ **Dialogy potvrzení**: Potvrzení požadováno před smazáním (Filamenty, Tiskárny, Nabídky)
- ✨ **Toast notifikace**: Notifikace po úspěšných operacích (přidat, aktualizovat, smazat)
- ✨ **Validace vstupu**: Záporná čísla zakázána, maximální hodnoty nastaveny
- ✨ **Stavy načítání**: Spinner načítání při spuštění aplikace
- ✨ **Hranice chyb**: Zpracování chyb na úrovni aplikace
- ✨ **Vyhledávání a filtrování**: Vyhledávat filamenty, tiskárny a nabídky
- ✨ **Duplikace**: Snadná duplikace nabídek
- ✨ **Sbalitelné formuláře**: Formuláře pro přidání filamentu a tiskárny jsou sbalitelné
- ✨ **Rozšíření nabídky**: Pole názvu zákazníka, kontaktu a popisu přidána
- 🐛 **Čištění Console.log**: Žádné console.logs v produkčním sestavení
- 🐛 **Oprava pole popisu**: Dlouhé texty se správně zalamují.

---

**Verze**: 1.1.1

**Verze**: 1.1.6

Pokud máte nějaké dotazy nebo najdete chybu, prosím otevřete issue v repozitáři GitHub!

