# 🖨️ 3D Printer Calculator App

> **🌍 Wybór języka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

Nowoczesna aplikacja desktopowa do obliczania kosztów druku 3D. Zbudowana z Tauri v2, frontendem React i backendem Rust.

## ✨ Funkcje

- 📊 **Obliczanie kosztów** - Automatyczne obliczanie kosztów filamentu, energii elektrycznej, suszenia i zużycia
- 🧵 **Zarządzanie filamentami** - Dodawanie, edytowanie, usuwanie filamentów (marka, typ, kolor, cena)
- 🖨️ **Zarządzanie drukarkami** - Zarządzanie drukarkami i systemami AMS
- 💰 **Obliczanie zysku** - Wybieralny procent zysku (10%, 20%, 30%, 40%, 50%)
- 📄 **Oferty** - Zapisywanie, zarządzanie i eksportowanie ofert PDF (nazwa klienta, kontakt, opis)
- 🧠 **Presety filtrów** - Zapisywanie filtrów ofert, stosowanie szybkich presetów, automatyczne filtry oparte na dacie/czasie
- 🗂️ **Panel statusu** - Karty statusu, szybkie filtry i oś czasu ostatnich zmian statusu
- 📝 **Notatki statusu** - Każda zmiana statusu z opcjonalnymi notatkami i rejestrowaniem historii
- 👁️ **Podgląd PDF i szablony** - Wbudowany podgląd PDF, wybieralne szablony i bloki brandingowe firmy
- 🎨 **Biblioteka kolorów filamentu** - Ponad 2000 kolorów fabrycznych z panelami wyboru opartymi na marce i typie
- 💾 **Edytor biblioteki filamentów** - Dodawanie/edytowanie oparte na modalu, ostrzeżenia o duplikatach i trwałe zapisywanie w `filamentLibrary.json`
- 🖼️ **Obrazy filamentów w PDF** - Wyświetlanie logo filamentów i próbek kolorów w generowanych plikach PDF
- 🧾 **Import G-code i tworzenie szkicu** - Ładowanie eksportów G-code/JSON (Prusa, Cura, Orca, Qidi) z modala w kalkulatorze, ze szczegółowym podsumowaniem i automatycznym generowaniem szkicu oferty
- 📈 **Statystyki** - Panel podsumowania zużycia filamentu, przychodów, zysku
- 🌍 **Wielojęzyczność** - Pełne tłumaczenie na węgierski, angielski, niemiecki, francuski, chiński uproszczony, czeski, hiszpański, włoski, polski, portugalski i słowacki (12 języków, 813 kluczy tłumaczenia na język)
- 💱 **Wiele walut** - EUR, HUF, USD
- 🔄 **Automatyczne aktualizacje** - Sprawdza GitHub Releases pod kątem nowych wersji
- 🧪 **Wersje beta** - Obsługa gałęzi beta i kompilacji beta
- ⚙️ **Sprawdzanie beta** - Konfigurowalne sprawdzanie wersji beta
- 🎨 **Responsywny układ** - Wszystkie elementy aplikacji dynamicznie dostosowują się do rozmiaru okna
- ✅ **Okna dialogowe potwierdzenia** - Prośba o potwierdzenie przed usunięciem
- 🔔 **Powiadomienia toast** - Powiadomienia po udanych operacjach
- 🔍 **Wyszukiwanie i filtrowanie** - Wyszukiwanie filamentów, drukarek i ofert
- 🔎 **Porównywanie cen online** - Jedno kliknięcie otwiera wyniki wyszukiwania Google/Bing dla wybranego filamentu, cena natychmiast aktualizowalna
- 📋 **Duplikowanie** - Łatwe duplikowanie ofert
- 🖱️ **Przeciąganie i upuszczanie** - Zmiana kolejności ofert, filamentów i drukarek przez przeciąganie
- 📱 **Menu kontekstowe** - Menu prawego przycisku myszy do szybkich akcji (edytuj, usuń, duplikuj, eksportuj)

## 📸 Zrzuty ekranu

Aplikacja zawiera:
- Panel główny ze statystykami
- Zarządzanie filamentami
- Zarządzanie drukarkami
- Kalkulator obliczania kosztów
- Lista ofert i widok szczegółowy
- Panel statusu i oś czasu
- Eksport PDF i wbudowany podgląd

## 🚀 Instalacja

### Wymagania wstępne

- **Rust**: [Zainstaluj Rust](https://rustup.rs/)
- **Node.js**: [Zainstaluj Node.js](https://nodejs.org/) (wersja 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Specyficzne dla macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Specyficzne dla Linux (Ubuntu/Debian)

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

### Specyficzne dla Windows

- Visual Studio Build Tools (narzędzia kompilacji C++)
- Windows SDK

## 📦 Kompilacja

### Uruchamianie w trybie deweloperskim

```bash
cd src-tauri
cargo tauri dev
```

### Kompilacja produkcyjna (Tworzenie samodzielnej aplikacji)

```bash
cd src-tauri
cargo tauri build
```

Samodzielna aplikacja będzie znajdować się w:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` lub `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Kompilacja beta

Projekt zawiera gałąź `beta` skonfigurowaną do oddzielnych kompilacji:

```bash
# Przełącz na gałąź beta
git checkout beta

# Lokalna kompilacja beta
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Kompilacja beta automatycznie ustawia zmienną `VITE_IS_BETA=true`, więc w menu pojawia się "BETA".

**GitHub Actions**: Po wypchnięciu do gałęzi `beta` automatycznie uruchamia się workflow `.github/workflows/build-beta.yml`, który kompiluje wersję beta dla wszystkich trzech platform.

Szczegółowy przewodnik: [BUILD.md](BUILD.md) i [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Rozwój

### Struktura projektu

```
3DPrinterCalcApp/
├── frontend/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Komponenty React
│   │   ├── utils/        # Funkcje pomocnicze
│   │   └── types.ts      # Typy TypeScript
│   └── package.json
├── src-tauri/         # Backend Rust
│   ├── src/           # Kod źródłowy Rust
│   ├── Cargo.toml     # Zależności Rust
│   └── tauri.conf.json # Konfiguracja Tauri
└── README.md
```

### Rozwój frontendu

```bash
cd frontend
pnpm install
pnpm dev
```

### Zależności

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (przechowywanie danych)
- tauri-plugin-log (rejestrowanie)

## 📖 Użycie

1. **Dodaj drukarkę**: Menu Drukarki → Dodaj nową drukarkę
2. **Dodaj filament**: Menu Filamenty → Dodaj nowy filament
3. **Oblicz koszt**: Menu Kalkulator → Wybierz drukarkę i filamenty
4. **Zapisz ofertę**: Kliknij przycisk "Zapisz jako ofertę" w kalkulatorze
5. **Eksport PDF**: Menu Oferty → Wybierz ofertę → Eksport PDF
6. **Sprawdź wersje beta**: Menu Ustawienia → Włącz opcję "Sprawdź aktualizacje beta"

## 🔄 Zarządzanie wersjami i aktualizacje

Aplikacja automatycznie sprawdza GitHub Releases pod kątem nowych wersji:

- **Przy starcie**: Automatycznie sprawdza aktualizacje
- **Co 5 minut**: Automatycznie ponownie sprawdza
- **Powiadomienie**: Jeśli dostępna jest nowa wersja, pojawia się powiadomienie w prawym górnym rogu

### Sprawdzanie wersji beta

Aby sprawdzić wersje beta:

1. Przejdź do menu **Ustawienia**
2. Włącz opcję **"Sprawdź aktualizacje beta"**
3. Aplikacja natychmiast sprawdza wersje beta
4. Jeśli dostępna jest nowsza wersja beta, pojawia się powiadomienie
5. Kliknij przycisk "Pobierz", aby przejść do strony GitHub Release

**Przykład**: Jeśli używasz wersji RELEASE (np. 0.1.0) i włączysz sprawdzanie beta, aplikacja znajdzie najnowszą wersję beta (np. 0.2.0-beta) i powiadomi Cię, jeśli jest nowsza.

Szczegółowy przewodnik: [VERSIONING.md](VERSIONING.md)

## 🛠️ Stack technologiczny

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Przechowywanie danych**: Tauri Store Plugin (pliki JSON)
- **Stylizacja**: Style inline (commonStyles)
- **i18n**: Własny system tłumaczeń
- **CI/CD**: GitHub Actions (automatyczne kompilacje dla macOS, Linux, Windows)
- **Zarządzanie wersjami**: Integracja z API GitHub Releases

## 📝 Licencja

Ten projekt jest objęty **licencją MIT**, jednak **użycie komercyjne wymaga pozwolenia**.

Pełne prawa autorskie aplikacji: **Lekszikov Miklós (LexyGuru)**

- ✅ **Użycie osobiste i edukacyjne**: Dozwolone
- ❌ **Użycie komercyjne**: Tylko z wyraźnym pisemnym pozwoleniem

Szczegóły: plik [LICENSE](LICENSE)

## 👤 Autor

Lekszikov Miklós (LexyGuru)

## 🙏 Podziękowania

- [Tauri](https://tauri.app/) - Framework aplikacji desktopowych wieloplatformowych
- [React](https://react.dev/) - Framework frontendowy
- [Vite](https://vitejs.dev/) - Narzędzie kompilacji

## 📚 Dodatkowa dokumentacja

- [BUILD.md](BUILD.md) - Szczegółowy przewodnik kompilacji dla wszystkich platform
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Tworzenie samodzielnej aplikacji
- [VERSIONING.md](VERSIONING.md) - Zarządzanie wersjami i aktualizacje
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Tworzenie pierwszego GitHub Release

## 🌿 Struktura gałęzi

- **`main`**: Stabilne wersje wydania (kompilacja RELEASE)
- **`beta`**: Wersje beta i rozwój (kompilacja BETA)

Po wypchnięciu do gałęzi `beta` automatycznie uruchamia się workflow GitHub Actions, który kompiluje wersję beta.

## 📋 Historia wersji

### v0.5.56 (2025)
- 🌍 **Pełne tłumaczenia językowe** – Ukończono pełne tłumaczenia dla 6 pozostałych plików językowych: czeski (cs), hiszpański (es), włoski (it), polski (pl), portugalski (pt) i słowacki (sk). Każdy plik zawiera wszystkie 813 kluczy tłumaczenia, więc aplikacja jest teraz w pełni obsługiwana w tych językach.
- 🔒 **Poprawka uprawnień Tauri** – Plik `update_filamentLibrary.json` jest teraz wyraźnie włączony do operacji odczytu, zapisu i tworzenia w pliku możliwości Tauri, zapewniając niezawodne działanie aktualizacji biblioteki filamentów.

### v0.5.55 (2025)
- 🧵 **Ulepszenie edycji ofert** – Zapisane oferty umożliwiają teraz bezpośredni wybór lub modyfikację drukarki, z automatycznym przeliczaniem kosztów wraz ze zmianami filamentu.
- 🧮 **Dokładność i rejestrowanie** – Szczegółowe rejestrowanie pomaga śledzić kroki obliczania kosztów (filament, energia elektryczna, suszenie, użycie), ułatwiając znajdowanie błędów w importowanych plikach G-code.
- 🌍 **Dodatki tłumaczeniowe** – Dodano nowe klucze i etykiety i18n dla selektora drukarki, zapewniając spójny interfejs edytora we wszystkich obsługiwanych językach.
- 📄 **Aktualizacja dokumentacji** – README rozszerzony o opis nowych funkcji, wydanie v0.5.55 dodane do historii wersji.

---

**Wersja**: 0.5.56

Jeśli masz pytania lub znajdziesz błąd, proszę otwórz issue w repozytorium GitHub!

