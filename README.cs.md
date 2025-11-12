# 🖨️ 3D Printer Calculator App

> **🌍 Výběr jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

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
- 🎨 **Knihovna barev filamentu** - Více než 2000 továrních barev s volitelnými panely založenými na značce a typu
- 💾 **Editor knihovny filamentů** - Přidávání/úprava založená na modalu, varování před duplikáty a trvalé ukládání do `filamentLibrary.json`
- 🖼️ **Obrázky filamentů v PDF** - Zobrazení log filamentů a vzorků barev v generovaných PDF
- 🧾 **Import G-code a vytváření konceptu** - Načítání exportů G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačce, s podrobným shrnutím a automatickým generováním konceptu nabídky
- 📈 **Statistiky** - Přehledný dashboard pro spotřebu filamentu, příjmy, zisk
- 🌍 **Vícejazyčnost** - Úplný překlad do maďarštiny, angličtiny, němčiny, francouzštiny, zjednodušené čínštiny, češtiny, španělštiny, italštiny, polštiny, portugalštiny a slovenštiny (12 jazyků, 813 překladových klíčů na jazyk)
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

### v0.5.56 (2025)
- 🌍 **Úplné jazykové překlady** – Dokončeny úplné překlady pro 6 zbývajících jazykových souborů: čeština (cs), španělština (es), italština (it), polština (pl), portugalština (pt) a slovenština (sk). Každý soubor obsahuje všech 813 překladových klíčů, takže aplikace je nyní plně podporována v těchto jazycích.
- 🔒 **Oprava oprávnění Tauri** – Soubor `update_filamentLibrary.json` je nyní explicitně povolen pro operace čtení, zápisu a vytváření v souboru možností Tauri, což zajišťuje spolehlivé fungování aktualizací knihovny filamentů.

### v0.5.55 (2025)
- 🧵 **Vylepšení úpravy nabídek** – Uložené nabídky nyní umožňují přímý výběr nebo úpravu tiskárny, přičemž náklady se automaticky přepočítávají spolu se změnami filamentu.
- 🧮 **Přesnost a protokolování** – Podrobné protokolování pomáhá sledovat kroky výpočtu nákladů (filament, elektřina, sušení, použití), což usnadňuje hledání chyb v importovaných souborech G-code.
- 🌍 **Doplňky překladů** – Přidány nové klíče a popisky i18n pro selektor tiskárny, což zajišťuje konzistentní UI editoru ve všech podporovaných jazycích.
- 📄 **Aktualizace dokumentace** – README rozšířeno o popis nových funkcí, vydání v0.5.55 přidáno do historie verzí.

---

**Verze**: 0.5.56

Pokud máte nějaké dotazy nebo najdete chybu, prosím otevřete issue v repozitáři GitHub!

