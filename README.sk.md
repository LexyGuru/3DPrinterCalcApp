# 🖨️ 3D Printer Calculator App

> **🌍 Výber jazyka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

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
- 🎨 **Knižnica farieb filamentu** - Viac ako 2000 továrenských farieb s voliteľnými panelmi založenými na značke a type
- 💾 **Editor knižnice filamentov** - Pridávanie/úprava založená na modale, varovania pred duplikátmi a trvalé ukladanie do `filamentLibrary.json`
- 🖼️ **Obrázky filamentov v PDF** - Zobrazenie log filamentov a vzoriek farieb v generovaných PDF
- 🧾 **Import G-code a vytváranie konceptu** - Načítanie exportov G-code/JSON (Prusa, Cura, Orca, Qidi) z modalu v kalkulačke, s podrobným zhrnutím a automatickým generovaním konceptu ponuky
- 📈 **Štatistiky** - Prehľadný dashboard pre spotrebu filamentu, príjmy, zisk
- 🌍 **Viacjazyčnosť** - Úplný preklad do maďarčiny, angličtiny, nemčiny, francúzštiny, zjednodušenej čínštiny, češtiny, španielčiny, taliančiny, poľštiny, portugalčiny a slovenčiny (12 jazykov, 813 prekladových kľúčov na jazyk)
- 💱 **Viaceré meny** - EUR, HUF, USD
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

### v0.5.56 (2025)
- 🌍 **Úplné jazykové preklady** – Dokončené úplné preklady pre 6 zostávajúcich jazykových súborov: čeština (cs), španielčina (es), taliančina (it), poľština (pl), portugalčina (pt) a slovenčina (sk). Každý súbor obsahuje všetkých 813 prekladových kľúčov, takže aplikácia je teraz plne podporovaná v týchto jazykoch.
- 🔒 **Oprava oprávnení Tauri** – Súbor `update_filamentLibrary.json` je teraz explicitne povolený pre operácie čítania, zápisu a vytvárania v súbore možností Tauri, čo zabezpečuje spoľahlivé fungovanie aktualizácií knižnice filamentov.

### v0.5.55 (2025)
- 🧵 **Vylepšenie úpravy ponúk** – Uložené ponuky teraz umožňujú priamy výber alebo úpravu tlačiarne, pričom náklady sa automaticky prepočítavajú spolu so zmenami filamentu.
- 🧮 **Presnosť a protokolovanie** – Podrobné protokolovanie pomáha sledovať kroky výpočtu nákladov (filament, elektrina, sušenie, použitie), čo uľahčuje hľadanie chýb v importovaných súboroch G-code.
- 🌍 **Doplnky prekladov** – Pridané nové kľúče a popisky i18n pre selektor tlačiarne, čo zabezpečuje konzistentné UI editora vo všetkých podporovaných jazykoch.
- 📄 **Aktualizácia dokumentácie** – README rozšírené o popis nových funkcií, vydanie v0.5.55 pridané do histórie verzií.

---

**Verzia**: 0.5.56

Ak máte nejaké otázky alebo nájdete chybu, prosím otvorte issue v repozitári GitHub!

