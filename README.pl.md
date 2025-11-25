# 🖨️ 3D Printer Calculator App

> **🌍 Wybór języka**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

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
- 🎨 **Biblioteka kolorów filamentu** - Ponad 12,000 kolorów fabrycznych z panelami wyboru opartymi na marce i typie
- 💾 **Edytor biblioteki filamentów** - Dodawanie/edytowanie oparte na modalu, ostrzeżenia o duplikatach i trwałe zapisywanie w `filamentLibrary.json`
- 🖼️ **Obrazy filamentów w PDF** - Wyświetlanie logo filamentów i próbek kolorów w generowanych plikach PDF
- 🧾 **Import G-code i tworzenie szkicu** - Ładowanie eksportów G-code/JSON (Prusa, Cura, Orca, Qidi) z modala w kalkulatorze, ze szczegółowym podsumowaniem i automatycznym generowaniem szkicu oferty
- 📈 **Statystyki** - Panel podsumowania zużycia filamentu, przychodów, zysku
- 👥 **Baza danych klientów** - Zarządzanie klientami z informacjami kontaktowymi, danymi firmy i statystykami ofert
- 📊 **Historia i trendy cen** - Śledzenie zmian cen filamentu z wykresami i statystykami
- 🌍 **Wielojęzyczność** - Pełne tłumaczenie na węgierski, angielski, niemiecki, francuski, chiński uproszczony, czeski, hiszpański, włoski, polski, portugalski, słowacki, ukraiński i rosyjski (14 języków, 850+ kluczy tłumaczenia na język)
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

## 📋 Dziennik zmian (Changelog)

### v1.4.33 (2025) - 🔧 Ulepszenia układu i przeciągania widgetów

- 📊 **Poprawki układu widgetów** - Naprawione pozycjonowanie i funkcjonalność przeciągania widgetów:
  - Naprawione automatyczne pozycjonowanie 6 małych widgetów rozmiaru "S", aby były wyrównane obok siebie
  - Widgety teraz zachowują swoje pozycje po ręcznym przeciągnięciu i upuszczeniu
  - Naprawiona trwałość układu - widgety nie wracają już do swoich pierwotnych pozycji
  - Ulepszona funkcjonalność uchwytu przeciągania - widgety można przeciągać z nagłówka lub paska uchwytu
  - Naprawione problemy z pustą przestrzenią pod widgetami po zmianie pozycji
  - Ulepszona obsługa zmian układu, aby nie nadpisywać zmian ręcznych

### v1.3.12 (2025) - 🎨 Ulepszenia systemu widgetów i walut

- 📊 **Ulepszenia systemu widgetów** - Ulepszona funkcjonalność widgetów i lokalizacja:
  - Dodane nowe widgety: Wykres czasu druku, Wykres statystyk klientów, Wykres statusu ofert
  - Naprawiona funkcjonalność eksportu widgetów - wszystkie widgety wykresów teraz eksportowalne jako SVG
  - Dynamiczne tłumaczenie tytułów widgetów na podstawie wybranego języka
  - Zlokalizowane nazwy plików eksportu z odpowiednią nazwą zgodną z OS (podkreślenia, brak znaków specjalnych)
  - Języki widgetów aktualizują się natychmiast po zmianie języka
  - Powiadomienia toast dla udanych eksportów wykresów
  - Wszystkie elementy widgetów i stany ładowania w pełni przetłumaczone we wszystkich 14 językach
- 💱 **Rozszerzenie wsparcia walut** - Rozszerzone wsparcie walut:
  - Dodane waluty: GBP (Funt brytyjski), PLN (Złoty polski), CZK (Korona czeska), CNY (Juan chiński), UAH (Hrywna ukraińska), RUB (Rubel rosyjski)
  - Symbole i etykiety walut dla wszystkich nowych walut
  - Prawidłowa konwersja i wyświetlanie walut we wszystkich komponentach
  - Menu rozwijane wyboru waluty zaktualizowane wszystkimi obsługiwanymi walutami
- 💰 **Naprawa precyzji obliczeń kosztów** - Naprawione problemy z precyzją zmiennoprzecinkową:
  - Wszystkie obliczenia kosztów (filament, prąd, suszenie, użycie, całkowity) teraz zaokrąglone do 2 miejsc po przecinku
  - Wyeliminowane długie wyświetlania dziesiętne (np. `0.17500000000000002` → `0.18`)
  - Spójne formatowanie liczb w całej aplikacji
- 🏢 **Okno dialogowe informacji o firmie** - Ulepszona obsługa informacji o firmie:
  - Formularz informacji o firmie przeniesiony do okna dialogowego modalnego (podobnie jak Towary/Filamenty)
  - Przycisk "Szczegóły firmy" do otwierania/edytowania informacji o firmie
  - Okno dialogowe można zamknąć za pomocą przycisku X, kliknięcia w tło lub klawisza Escape
  - Lepsze UX z animowanymi przejściami modalnymi
  - Wszystkie pola informacji o firmie dostępne w zorganizowanym interfejsie okna dialogowego

### v1.3.11 (2025) - 🎨 Ulepszenia panelu widgetów

- 📊 **Ulepszenia panelu widgetów** - Ulepszona funkcjonalność panelu widgetów:
  - Naprawione wypełnienie i marginesy kontenera widgetów dla lepszego układu od krawędzi do krawędzi
  - Ulepszone zachowanie przewijania - widgety teraz prawidłowo się przewijają, gdy zawartość przekracza widok
  - Naprawiony problem kurczenia się widgetów przy zmianie rozmiaru okna - widgety zachowują rozmiar we wszystkich punktach przerwania
  - Spójny układ 12 kolumn na wszystkich rozmiarach ekranu
  - Lepsze pozycjonowanie i odstępy widgetów
- 🔧 **Poprawki układu**:
  - Usunięte stałe wypełnienie kontenera, które uniemożliwiało widgetom dotarcie do krawędzi aplikacji
  - Naprawione obliczanie wysokości ResponsiveGridLayout dla prawidłowego przewijania
  - Ulepszona obsługa przepełnienia kontenera
  - Lepsza spójność układu grupy widgetów

### v1.2.1 (2025) - 🎨 Spójność interfejsu i zarządzanie kolumnami

- 📊 **Zarządzanie kolumnami filamentów** - Dodano widoczność i sortowanie kolumn do komponentu Filamenty:
  - Menu przełączania widoczności kolumn (jak w komponencie Drukarki)
  - Kolumny sortowalne: Marka, Typ, Waga, Cena/kg
  - Preferencje widoczności kolumn zapisane w ustawieniach
  - Spójny interfejs z komponentem Drukarki (przycisk zarządzania, menu rozwijane, wskaźniki sortowania)
- 🎨 **Spójność kolorów motywu** - Ulepszone użycie kolorów motywu we wszystkich komponentach:
  - Wszystkie przyciski i menu rozwijane teraz konsekwentnie używają kolorów motywu (Filamenty, Drukarki, Kalkulator, Trendy cenowe)
  - Usunięto hardcodowane kolory (szare przyciski zastąpione podstawowym kolorem motywu)
  - Komponent Header w pełni dostosowuje się do wszystkich motywów i kolorów
  - Karta informacji o stanie używa kolorów motywu zamiast hardcodowanych wartości rgba
  - Spójne efekty hover używając themeStyles.buttonHover
- 🔧 **Ulepszenia interfejsu**:
  - Przycisk "Zarządzaj kolumnami" teraz używa podstawowego koloru motywu zamiast drugorzędnego
  - Menu rozwijane select Trendy cenowe używa odpowiednich stylów fokusa
  - Wszystkie menu rozwijane stylizowane konsekwentnie z kolorami motywu
  - Lepsza spójność wizualna na wszystkich stronach

### v1.1.6 (2025) - 🌍 Pełne pokrycie tłumaczeń

- 🌍 **Tłumaczenia samouczka** - Dodano brakujące klucze tłumaczeń samouczka do wszystkich plików językowych:
  - 8 nowych kroków samouczka w pełni przetłumaczonych (Panel statusu, Podgląd PDF, Przeciągnij i upuść, Menu kontekstowe, Historia cen, Porównanie cen online, Eksport/Import, Kopia zapasowa/Przywracanie)
  - Cała zawartość samouczka jest teraz dostępna we wszystkich 14 obsługiwanych językach
  - Pełne doświadczenie samouczka w języku czeskim, hiszpańskim, francuskim, włoskim, polskim, portugalskim, rosyjskim, słowackim, ukraińskim i chińskim
- 🎨 **Tłumaczenie nazw motywów** - Nazwy motywów są teraz w pełni przetłumaczone we wszystkich językach:
  - 15 nazw motywów dodanych do wszystkich plików językowych (Jasny, Ciemny, Niebieski, Zielony, Las, Fioletowy, Pomarańczowy, Pastelowy, Węgiel, Północ, Gradient, Neon, Cyberpunk, Zachód słońca, Ocean)
  - Nazwy motywów są dynamicznie ładowane z systemu tłumaczeń zamiast zakodowanych wartości
  - Mechanizm zapasowy: klucz tłumaczenia → displayName → nazwa motywu
  - Wszystkie motywy są teraz wyświetlane w języku wybranym przez użytkownika w Ustawieniach

### v1.1.5 (2025) - 🎨 Ulepszenia interfejsu i zarządzanie logami

- 🎨 **Przeprojektowanie okna dialogowego dodawania filamentu** - Ulepszony układ dwukolumnowy dla lepszej organizacji:
  - Lewa kolumna: Dane podstawowe (Marka, Typ, Waga, Cena, Przesyłanie obrazu)
  - Prawa kolumna: Wybór koloru ze wszystkimi opcjami kolorów
  - Wszystkie pola wejściowe mają spójną szerokość
  - Lepsza hierarchia wizualna i odstępy
  - Przesyłanie obrazu przeniesione do lewej kolumny pod pole Ceny
- 📋 **Zarządzanie plikami logów** - Nowa sekcja zarządzania logami w ustawieniach Zarządzania danymi:
  - Konfigurowalne automatyczne usuwanie starych plików logów (5, 10, 15, 30, 60, 90 dni lub nigdy)
  - Przycisk do otwierania folderu logów w menedżerze plików
  - Automatyczne czyszczenie przy zmianie ustawienia
  - Otwieranie folderu specyficzne dla platformy (macOS, Windows, Linux)
- 📦 **Układ Eksport/Import** - Sekcje Eksport i Import są teraz obok siebie:
  - Responsywny układ dwukolumnowy
  - Lepsze wykorzystanie przestrzeni
  - Ulepszona równowaga wizualna
- 🍎 **Ostrzeżenie o powiadomieniach macOS** - Zamykane okno dialogowe ostrzeżenia:
  - Pojawia się tylko na platformie macOS
  - Dwie opcje zamknięcia: tymczasowe (przycisk X) lub trwałe (przycisk Zamknij)
  - Zamknięcie tymczasowe: ukryte tylko dla bieżącej sesji, pojawia się ponownie po ponownym uruchomieniu
  - Zamknięcie trwałe: zapisane w ustawieniach, nigdy się nie pojawia
  - Jasne rozróżnienie wizualne między typami zamknięcia

### v1.1.4 (2025) - 🐛 Automatyczne tworzenie pliku aktualizacji biblioteki filamentów

- 🐛 **Automatyczne tworzenie pliku aktualizacji** - Naprawiono problem, gdzie `update_filamentLibrary.json` nie był automatycznie tworzony:
  - Plik jest teraz automatycznie tworzony z `filamentLibrarySample.json` przy pierwszym uruchomieniu
  - Zapewnia, że plik aktualizacji jest zawsze dostępny do scalenia
  - Tworzy tylko, jeśli plik nie istnieje (nie nadpisuje istniejącego)
  - Ulepszona obsługa błędów i rejestrowanie dla operacji na pliku aktualizacji

### v1.1.3 (2025) - 🪟 Poprawki zgodności z Windows

- 🪟 **Poprawka zgodności z Windows** - Ulepszenia ładowania biblioteki filamentów:
  - Dynamiczny import dla dużych plików JSON (zamiast statycznego importu)
  - Mechanizm cache, aby uniknąć wielokrotnych ładowań
  - Ulepszona obsługa błędów dla przypadków nieznalezionego pliku w Windows
  - Kompatybilność międzyplatformowa (Windows, macOS, Linux)
- 🔧 **Ulepszenia obsługi błędów** - Ulepszone komunikaty o błędach:
  - Prawidłowa obsługa komunikatów o błędach specyficznych dla Windows
  - Cicha obsługa przypadków nieznalezionego pliku (nie jako ostrzeżenia)

### v1.1.2 (2025) - 🌍 Selektor języka i ulepszenia

- 🌍 **Selektor języka przy pierwszym uruchomieniu** - Nowoczesne, animowane okno dialogowe wyboru języka przy pierwszym uruchomieniu:
  - Obsługa 13 języków z ikonami flag
  - Design świadomy motywu
  - Płynne animacje
  - Samouczek działa w wybranym języku
- 🔄 **Przywracanie ustawień fabrycznych** - Funkcja całkowitego usuwania danych:
  - Usuwa wszystkie zapisane dane (drukarki, filamenty, oferty, klienci, ustawienia)
  - Okno dialogowe potwierdzenia dla niebezpiecznych operacji
  - Aplikacja uruchamia się ponownie jak przy pierwszym uruchomieniu
- 🎨 **Ulepszenia UI**:
  - Poprawka kontrastu tekstu stopki (dynamiczny wybór koloru)
  - Natychmiastowe zapisywanie przy zmianie języka
  - Ulepszone pozycjonowanie tooltipów
- 📚 **Tłumaczenia samouczka** - Pełne tłumaczenie samouczka we wszystkich obsługiwanych językach (dodano rosyjski, ukraiński, chiński)

### v1.1.1 (2025) - 🎨 Ulepszenia układu nagłówka

- 📐 **Reorganizacja nagłówka** - Struktura nagłówka z trzema częściami:
  - Lewa: Menu + Logo + Tytuł
  - Środek: Breadcrumb (dynamicznie się zmniejsza)
  - Prawa: Szybkie akcje + Karta informacji o stanie
- 📊 **Karta informacji o stanie** - Kompaktowy, nowoczesny styl:
  - "Następne zapisanie" (etykieta i wartość)
  - Data i godzina (ułożone jeden pod drugim)
  - Zawsze pozycjonowane po prawej stronie
- 📱 **Design responsywny** - Ulepszone punkty przerwania:
  - Ukryj breadcrumb <1000px
  - Ukryj datę <900px
  - Ukryj "Następne zapisanie" <800px
  - Kompaktowe szybkie akcje <700px
- 🔢 **Poprawka formatowania liczb** - Zaokrąglanie procentów postępu ładowania

### v1.1.0 (2025) - 🚀 Aktualizacja funkcji

- 🔍 **Rozszerzone wyszukiwanie globalne** - Ulepszona funkcjonalność wyszukiwania:
  - Wyszukiwanie ofert według nazwy klienta, ID, statusu i daty
  - Wyszukiwanie filamentów z bazy danych (filamentLibrary) według marki, typu i koloru
  - Dodawanie filamentów do zapisanej listy jednym kliknięciem z wyników wyszukiwania
  - Ulepszone wyniki wyszukiwania ze wskaźnikami typu
- 💀 **System ładowania Skeleton** - Spektakularne doświadczenie ładowania:
  - Animowane komponenty skeleton z efektami shimmer
  - Śledzenie postępu z wskaźnikami wizualnymi
  - Kroki ładowania ze znacznikami dla ukończonych kroków
  - Płynne przejścia fade-in
  - Kolory skeleton dopasowane do motywu
  - Ładowarki skeleton specyficzne dla strony
- 🎨 **Ulepszenia UI/UX**:
  - Lepsze stany ładowania
  - Ulepszona informacja zwrotna użytkownika podczas ładowania danych
  - Ulepszone doświadczenie wizualne

### v1.0.0 (2025) - 🎉 Pierwsza stabilna wersja

- 🎨 **Nowoczesne komponenty UI** - Kompletna przebudowa UI z nowoczesnymi komponentami:
  - Komponent Empty State dla lepszego doświadczenia użytkownika
  - Komponent Card z efektami hover
  - Komponent Progress Bar dla operacji eksportu/importu PDF
  - Komponent Tooltip z integracją motywu
  - Nawigacja Breadcrumb dla wyraźnej hierarchii stron
- ⚡ **Szybkie akcje** - Przyciski szybkich akcji w nagłówku dla szybszego przepływu pracy:
  - Przyciski szybkiego dodawania dla Filamentów, Drukarek i Klientów
  - Dynamiczne przyciski na podstawie aktywnej strony
  - Integracja skrótów klawiszowych
- 🔍 **Wyszukiwanie globalne (Command Palette)** - Potężna funkcja wyszukiwania:
  - `Ctrl/Cmd+K` aby otworzyć wyszukiwanie globalne
  - Wyszukiwanie stron i szybkich akcji
  - Nawigacja klawiaturowa (↑↓, Enter, Esc)
  - Styl dostosowany do motywu
- ⏪ **Funkcja Cofnij/Ponów** - Zarządzanie historią dla Filamentów:
  - `Ctrl/Cmd+Z` aby cofnąć
  - `Ctrl/Cmd+Shift+Z` aby ponów
  - Wizualne przyciski cofnij/ponów w UI
  - Wsparcie historii 50 kroków
- ⭐ **Ulubione Filamenty** - Oznaczaj i filtruj ulubione filamenty:
  - Ikona gwiazdy aby przełączyć status ulubionego
  - Filtr aby pokazać tylko ulubione
  - Trwały status ulubionego
- 📦 **Operacje masowe** - Wydajne zarządzanie masowe:
  - Zaznaczenie checkbox dla wielu filamentów
  - Funkcjonalność Zaznacz wszystkie / Odznacz wszystkie
  - Masowe usuwanie z dialogiem potwierdzenia
  - Wizualne wskaźniki zaznaczenia
- 🎨 **Dialogi modalne** - Nowoczesne doświadczenie modalne:
  - Modale z rozmytym tłem dla formularzy dodawania/edycji
  - Pola wprowadzania o stałym rozmiarze
  - Klawisz Escape aby zamknąć
  - Płynne animacje z framer-motion
- ⌨️ **Skróty klawiszowe** - Ulepszony system skrótów:
  - Niestandardowe skróty klawiszowe
  - Dialog pomocy skrótów (`Ctrl/Cmd+?`)
  - Edycja skrótów z przechwytywaniem klawiszy
  - Trwałe przechowywanie skrótów
- 📝 **System logowania** - Kompleksowe logowanie:
  - Oddzielne pliki logów dla frontendu i backendu
  - Rozdzielczość katalogu logów niezależna od platformy
  - Automatyczna rotacja logów
  - Integracja konsoli
- 🔔 **Ulepszenia powiadomień** - Lepszy system powiadomień:
  - Nazwa klienta w powiadomieniach o usunięciu oferty
  - Wsparcie powiadomień wieloplatformowych
  - Ulepszona obsługa błędów
- 🎯 **Ulepszenia UI/UX**:
  - Stałe rozmiary pól wprowadzania
  - Lepsze układy formularzy
  - Ulepszona integracja motywu
  - Zwiększona dostępność

### v0.6.0 (2025)

#### 🐛 Naprawy błędów
- **Optymalizacja logowania**: Zmniejszenie nadmiernego i zduplikowanego logowania
  - Logi informacyjne pojawiają się tylko w trybie deweloperskim (DEV)
  - Błędy nadal są logowane w buildach produkcyjnych
  - Inicjalizacja FilamentLibrary odbywa się cicho
- **Naprawa fałszywych ostrzeżeń**: Rozpoznawanie koloru filamentu ostrzega tylko wtedy, gdy biblioteka jest już załadowana i kolor nadal nie został znaleziony
  - Zapobiega fałszywym ostrzeżeniom podczas asynchronicznego ładowania biblioteki
  - Ostrzeżenia pojawiają się tylko w przypadku rzeczywistych problemów
- **Naprawa duplikacji sprawdzania aktualizacji**: Usunięcie zduplikowanych wywołań sprawdzania aktualizacji
- **Naprawa logowania skrótów klawiszowych**: Loguje tylko wtedy, gdy istnieje skrót, pomija nieprawidłowe kombinacje

#### ⚡ Ulepszenia wydajności
- Optymalizacja logowania operacji magazynu (tylko tryb DEV)
- Mniej operacji konsoli w buildach produkcyjnych
- Czystsze wyjście konsoli podczas rozwoju

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

### v1.1.1 (2025) - 🎨 Ulepszenia układu nagłówka

- 🎨 **Przebudowa nagłówka** - Kompletna przebudowa układu nagłówka:
  - Struktura trzech sekcji (lewa: logo/menu, środek: breadcrumb, prawa: akcje/status)
  - Karta informacji o statusie zawsze pozycjonowana po prawej stronie
  - Nowoczesny design typu karty dla informacji o statusie
  - Lepsze odstępy i wyrównanie w całym nagłówku
- 📱 **Projekt responsywny** - Lepsze doświadczenie na urządzeniach mobilnych i małych ekranach:
  - Dynamiczne punkty przerwania dla widoczności elementów
  - Poprawki przycinania breadcrumb
  - Szybkie akcje dostosowują się do rozmiaru ekranu
  - Responsywne rozmiarowanie karty informacji o statusie
- 🔧 **Poprawki układu**:
  - Naprawione problemy z przepełnieniem i przycinaniem breadcrumb
  - Ulepszenia pozycjonowania karty informacji o statusie
  - Lepsze zarządzanie układem flexbox
  - Ulepszone odstępy i przerwy między elementami

### v1.1.0 (2025) - 🚀 Aktualizacja funkcji

- 🔍 **Rozszerzone wyszukiwanie globalne** - Ulepszona funkcjonalność wyszukiwania
- 💀 **System ładowania Skeleton** - Spektakularne doświadczenie ładowania
- 🎨 **Ulepszenia UI/UX** - Lepsze stany ładowania i doświadczenie wizualne

### v1.0.0 (2025) - 🎉 Pierwsza stabilna wersja

- 🎨 **Nowoczesne komponenty UI** - Kompletna przebudowa UI z nowoczesnymi komponentami
- ⚡ **Szybkie akcje** - Przyciski szybkich akcji w nagłówku
- 🔍 **Wyszukiwanie globalne** - Potężna funkcjonalność wyszukiwania
- ⏪ **Funkcjonalność Cofnij/Ponów** - Zarządzanie historią
- ⭐ **Ulubione filamenty** - Oznaczanie i filtrowanie ulubionych filamentów
- 📦 **Operacje masowe** - Wydajne zarządzanie masowe
- 🎨 **Okna dialogowe modalne** - Nowoczesne doświadczenie modalne
- ⌨️ **Skróty klawiszowe** - Ulepszony system skrótów
- 📝 **System rejestrowania** - Kompleksowe rejestrowanie
- 🔔 **Ulepszenia powiadomień** - Lepszy system powiadomień

### v0.6.0 (2025)

- 👥 **Baza danych klientów** - Kompletny system zarządzania klientami z:
  - Dodawanie, edycja, usuwanie klientów
  - Informacje kontaktowe (e-mail, telefon)
  - Dane firmy (opcjonalne)
  - Adres i notatki
  - Statystyki klientów (łączna liczba ofert, data ostatniej oferty)
  - Funkcjonalność wyszukiwania
  - Integracja z Kalkulatorem dla szybkiego wyboru klienta
- 📊 **Historia i trendy cen** - Śledzenie zmian cen filamentu:
  - Automatyczne śledzenie historii cen przy aktualizacji cen filamentu
  - Wizualizacja trendów cenowych z wykresami SVG
  - Statystyki cen (cena bieżąca, średnia, min, max)
  - Analiza trendów (rosnący, malejący, stabilny)
  - Tabela historii cen ze szczegółowymi informacjami o zmianach
  - Ostrzeżenia o znaczących zmianach cen (zmiany 10%+)
  - Wyświetlanie historii cen w komponencie Filamenty podczas edycji
- 🔧 **Ulepszenia**:
  - Ulepszony Kalkulator z menu rozwijanym wyboru klienta
  - Integracja historii cen w formularzu edycji filamentu
  - Ulepszona trwałość danych dla klientów i historii cen

### v0.5.58 (2025)
- 🌍 **Obsługa języków ukraińskiego i rosyjskiego** – Dodano pełne wsparcie tłumaczeń dla ukraińskiego (uk) i rosyjskiego (ru):
  - Kompletne pliki tłumaczeń ze wszystkimi 813 kluczami tłumaczenia dla obu języków
  - Obsługa locale ukraińskiego (uk-UA) dla formatowania daty/czasu
  - Obsługa locale rosyjskiego (ru-RU) dla formatowania daty/czasu
  - Wszystkie pliki README zaktualizowane z nowymi językami w menu językowym
  - Liczba języków zaktualizowana z 12 do 14 języków
  - Utworzono pliki dokumentacji README.uk.md i README.ru.md

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
- 🌍 **Pełne tłumaczenia językowe** – Ukończono pełne tłumaczenia dla 6 pozostałych plików językowych: czeski (cs), hiszpański (es), włoski (it), polski (pl), portugalski (pt) i słowacki (sk). Każdy plik zawiera wszystkie 813 kluczy tłumaczenia, więc aplikacja jest teraz w pełni obsługiwana w tych językach.
- 🔒 **Poprawka uprawnień Tauri** – Plik `update_filamentLibrary.json` jest teraz wyraźnie włączony do operacji odczytu, zapisu i tworzenia w pliku możliwości Tauri, zapewniając niezawodne działanie aktualizacji biblioteki filamentów.

### v0.5.55 (2025)
- 🧵 **Ulepszenie edycji ofert** – Zapisane oferty umożliwiają teraz bezpośredni wybór lub modyfikację drukarki, z automatycznym przeliczaniem kosztów wraz ze zmianami filamentu.
- 🧮 **Dokładność i rejestrowanie** – Szczegółowe rejestrowanie pomaga śledzić kroki obliczania kosztów (filament, energia elektryczna, suszenie, użycie), ułatwiając znajdowanie błędów w importowanych plikach G-code.
- 🌍 **Dodatki tłumaczeniowe** – Dodano nowe klucze i etykiety i18n dla selektora drukarki, zapewniając spójny interfejs edytora we wszystkich obsługiwanych językach.
- 📄 **Aktualizacja dokumentacji** – README rozszerzony o opis nowych funkcji, wydanie v0.5.55 dodane do historii wersji.

### v0.5.11 (2025)
- 🗂️ **Modularyzacja językowa** – Rozszerzenie aplikacji o pliki tłumaczeń zorganizowane w nowym katalogu `languages/`, ułatwiając dodawanie nowych języków i zarządzanie istniejącymi tekstami.
- 🌍 **Ujednolicone tłumaczenia UI** – Interfejs importu slicera działa teraz z centralnego systemu tłumaczeń, wszystkie przyciski, komunikaty błędów i podsumowania są zlokalizowane.
- 🔁 **Aktualizacja selektora języka** – W Ustawieniach selektor języka ładuje się na podstawie odkrytych plików językowych, więc w przyszłości wystarczy dodać nowy plik językowy.
- 🌐 **Nowe podstawy językowe** – Pliki tłumaczeń przygotowane dla francuskiego, włoskiego, hiszpańskiego, polskiego, czeskiego, słowackiego, portugalskiego brazylijskiego i chińskiego uproszczonego (z angielskim fallbackiem), rzeczywiste tłumaczenia można łatwo uzupełnić.

### v0.5.0 (2025)
- 🔎 **Przycisk porównania cen filamentu** – Każdy niestandardowy filament ma teraz ikonę lupy, która otwiera wyszukiwanie Google/Bing na podstawie marki/typu/koloru, zapewniając szybkie linki do aktualnych cen.
- 💶 **Obsługa ceny dziesiętnej** – Pola ceny filamentu akceptują teraz wartości dziesiętne (14.11 € itp.), wprowadzanie jest automatycznie walidowane i formatowane przy zapisie.
- 🌐 **Odwrócone wyszukiwanie fallback** – Jeśli powłoka Tauri nie może otworzyć przeglądarki, aplikacja automatycznie otwiera nową kartę, więc wyszukiwanie działa na wszystkich platformach.

### v0.4.99 (2025)
- 🧾 **Wbudowany import G-code w kalkulatorze** – Nowy modal `SlicerImportModal` na górze kalkulatora, który ładuje eksporty G-code/JSON jednym kliknięciem, przenosząc czas druku, ilość filamentu i tworząc szkic oferty.
- 📊 **Dane slicera z nagłówka** – Wartości nagłówka G-code `total filament weight/length/volume` automatycznie przejmują podsumowania, dokładnie obsługując straty przy zmianie koloru.

### v0.4.98 (2025)
- 🧵 **Obsługa filamentu wielokolorowego** – Biblioteka filamentów i interfejs zarządzania teraz osobno oznaczają filamenty wielokolorowe (tęczowe/podwójne/trójkolorowe) z notatkami i podglądem tęczy.
- 🌐 **Automatyczne tłumaczenie przy imporcie CSV** – Nazwy kolorów importowane z zewnętrznej bazy danych otrzymują etykiety węgierskie i niemieckie, zachowując selektor kolorów wielojęzyczny bez ręcznej edycji.
- 🔄 **Scalanie biblioteki aktualizacji** – Zawartość pliku `update_filamentLibrary.json` jest automatycznie deduplikowana i scalana z istniejącą biblioteką przy starcie, bez nadpisywania modyfikacji użytkownika.
- 📁 **Aktualizacja konwertera CSV** – Skrypt `convert-filament-csv.mjs` nie nadpisuje już trwałego `filamentLibrary.json`, zamiast tego tworzy plik aktualizacji i generuje etykiety wielojęzyczne.
- ✨ **Dostrojenie doświadczenia animacji** – Nowe opcje przejścia stron (flip, parallax), selektor stylu mikrointerakcji, pulsujące informacje zwrotne, lista szkieletowa biblioteki filamentów i dopracowane efekty hover kart.
- 🎨 **Rozszerzenia warsztatu motywów** – Cztery nowe wbudowane motywy (Forest, Pastel, Charcoal, Midnight), natychmiastowa duplikacja aktywnego motywu do edycji niestandardowej, ulepszona obsługa gradientu/kontrastu i uproszczony proces udostępniania.

### v0.4.0 (2025)
- 🧵 **Integracja bazy danych filamentów** – Ponad 12 000 kolorów fabrycznych z wbudowanej biblioteki JSON (migawka filamentcolors.xyz), zorganizowane według marki i materiału
- 🪟 **Panele selektora o stałym rozmiarze** – Listy marek i typów otwierane przyciskiem, przeszukiwalne, przewijalne, które wykluczają się wzajemnie, czyniąc formularz bardziej przejrzystym
- 🎯 **Ulepszenia selektora kolorów** – Gdy elementy biblioteki są rozpoznawane, wykończenie i kod hex są automatycznie ustawiane, osobne pola dostępne przy przełączaniu na tryb niestandardowy
- 💾 **Edytor biblioteki filamentów** – Nowa zakładka ustawień z formularzem popup, obsługa duplikatów i trwałe zapisywanie `filamentLibrary.json` oparte na Tauri FS
- 📄 **Aktualizacja dokumentacji** – Nowy punkt na głównej liście funkcji dla biblioteki kolorów filamentów, czyszczenie README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Presety filtrów ofert** – Zapisywalne, nazywane ustawienia filtrów, domyślne szybkie presety (Dzisiaj, Wczoraj, Tygodniowy, Miesięczny itp.) i zastosowanie/usunięcie jednym kliknięciem
- 📝 **Notatki zmiany statusu** – Nowy modal do modyfikacji statusu oferty z opcjonalną notatką przechowywaną w historii statusu
- 🖼️ **Rozszerzenie eksportu PDF** – Obrazy przechowywane z filamentami pojawiają się w tabeli PDF ze stylem zoptymalizowanym do druku
- 🧾 **Arkusz danych brandingu firmy** – Nazwa firmy, adres, NIP, konto bankowe, kontakt i przesyłanie logo; automatycznie włączone w nagłówek PDF
- 🎨 **Selektor szablonu PDF** – Trzy style (Nowoczesny, Minimalistyczny, Profesjonalny) do wyboru wyglądu oferty
- 👁️ **Wbudowany podgląd PDF** – Osobny przycisk przy szczegółach oferty do natychmiastowej wizualnej weryfikacji przed eksportem
- 📊 **Panel statusu** – Karty statusu z podsumowaniem, szybkie filtry statusu i oś czasu ostatnich zmian statusu w ofertach
- 📈 **Wykresy statystyczne** – Wykres trendu przychodów/kosztów/zysku, wykres kołowy dystrybucji filamentów, wykres słupkowy przychodów na drukarkę, wszystko eksportowalne w formacie SVG/PNG i można również zapisać jako PDF

### v0.3.8 (2025)
- 🐛 **Poprawka formatowania liczb raportu** - Formatowanie do 2 miejsc dziesiętnych w raportach:
  - Główne karty statystyk (Przychody, Wydatki, Zysk, Oferty): `formatNumber(formatCurrency(...), 2)`
  - Wartości nad wykresami: `formatNumber(formatCurrency(...), 2)`
  - Szczegółowe statystyki (Średni zysk/oferta): `formatNumber(formatCurrency(...), 2)`
  - Teraz spójne ze stroną główną (np. `6.45` zamiast `6.45037688333333`)
- 🎨 **Poprawka nawigacji zakładek ustawień** - Ulepszenia koloru tła i tekstu:
  - Tło sekcji nawigacji zakładek: `rgba(255, 255, 255, 0.85)` dla motywów gradientowych + `blur(10px)`
  - Tła przycisków zakładek: Aktywny `rgba(255, 255, 255, 0.9)`, nieaktywny `rgba(255, 255, 255, 0.7)` dla motywów gradientowych
  - Kolor tekstu przycisków zakładek: `#1a202c` (ciemny) dla motywów gradientowych dla czytelności
  - Efekty hover: `rgba(255, 255, 255, 0.85)` dla motywów gradientowych
  - Filtr tła: `blur(8px)` dla przycisków zakładek, `blur(10px)` dla sekcji nawigacji

### v0.3.7 (2025)
- 🎨 **Modernizacja projektu** - Kompletna transformacja wizualna z animacjami i nowymi motywami:
  - Nowe motywy: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nowych nowoczesnych motywów)
  - Animacje Framer Motion zintegrowane (fadeIn, slideIn, stagger, efekty hover)
  - Efekt glassmorphism dla motywów gradientowych (rozmycie + przezroczyste tło)
  - Efekt świecenia neonowego dla motywów neon/cyberpunk
  - Zmodernizowane karty i powierzchnie (większy padding, zaokrąglone rogi, lepsze cienie)
- 🎨 **Ulepszenia kolorów** - Lepszy kontrast i czytelność dla wszystkich motywów:
  - Ciemny tekst (#1a202c) na białym/jasnym tle dla motywów gradientowych
  - Pola wprowadzania, etykiety, kolorowanie h3 ulepszone we wszystkich komponentach
  - Spójna obsługa kolorów na wszystkich stronach (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Cień tekstu dodany dla motywów gradientowych dla lepszej czytelności
- 📊 **Ulepszenia stylu tabeli** - Bardziej rozmyte tło i lepszy kontrast tekstu:
  - Kolor tła: rgba(255, 255, 255, 0.85) dla motywów gradientowych (wcześniej 0.95)
  - Filtry tła: blur(8px) dla bardziej rozmytego efektu
  - Kolor tekstu: #333 (ciemny szary) dla motywów gradientowych dla lepszej czytelności
  - Tła komórek: rgba(255, 255, 255, 0.7) dla bardziej rozmytego efektu
- 🎨 **Ulepszenia koloru tła kart** - Bardziej rozmyte tło, lepsza czytelność:
  - Kolor tła: rgba(255, 255, 255, 0.75) dla motywów gradientowych (wcześniej 0.95)
  - Filtry tła: blur(12px) dla silniejszego rozmycia
  - Nieprzezroczystość: 0.85 dla efektu matowego
  - Kolor tekstu: #1a202c (ciemny) dla motywów gradientowych
- 📈 **Modernizacja strony głównej** - Statystyki tygodniowe/miesięczne/roczne i porównanie okresów:
  - Karty porównania okresów (Tygodniowy, Miesięczny, Roczny) z kolorowymi paskami akcentów
  - Komponenty StatCard zmodernizowane (ikony z kolorowymi tłami, paski akcentów)
  - Sekcja podsumowania zorganizowana w karty z ikonami
  - Sekcja porównania okresów dodana
- 🐛 **Poprawka filtra daty** - Bardziej precyzyjne filtrowanie okresów:
  - Reset czasu (00:00:00) dla precyzyjnego porównania
  - Górna granica ustawiona (dzisiaj jest uwzględnione)
  - Tygodniowy: ostatnie 7 dni (dzisiaj uwzględnione)
  - Miesięczny: ostatnie 30 dni (dzisiaj uwzględnione)
  - Roczny: ostatnie 365 dni (dzisiaj uwzględnione)
- 🎨 **Modernizacja paska bocznego** - Ikony, glassmorphism, efekty świecenia neonowego
- 🎨 **Modernizacja ConfirmDialog** - Właściwość motywu dodana, zharmonizowane kolorowanie

### v0.3.6 (2025)
- 🎨 **Reorganizacja UI ustawień** - System zakładek (Ogólne, Wygląd, Zaawansowane, Zarządzanie danymi) dla lepszej UX i czystszej nawigacji
- 🌐 **Ulepszenia tłumaczeń** - Cały tekst węgierski zakodowany na stałe przetłumaczony we wszystkich komponentach (HU/EN/DE):
  - Calculator: "obliczanie kosztów druku 3D"
  - Filaments: "Zarządzaj i edytuj filamenty"
  - Printers: "Zarządzaj drukarkami i systemami AMS"
  - Offers: "Zarządzaj i eksportuj zapisane oferty"
  - Home: Tytuły statystyk, podsumowanie, etykiety eksportu CSV (godz/Std/hrs, szt/Stk/pcs)
  - VersionHistory: "Brak dostępnej historii wersji"
- 💾 **System cache historii wersji** - Fizyczne zapisanie w localStorage, sprawdzanie GitHub co 1 godzinę:
  - Wykrywanie zmian oparte na sumie kontrolnej (pobiera tylko przy nowych wydaniach)
  - Osobny cache dla każdego języka (Węgierski/Angielski/Niemiecki)
  - Szybkie przełączanie języka z cache (brak ponownego tłumaczenia)
  - Automatyczne unieważnienie cache przy nowym wydaniu
- 🌐 **Inteligentne tłumaczenie** - Tłumaczy tylko nowe wydania, używa starych tłumaczeń z cache:
  - Walidacja cache (nie cacheować, jeśli ten sam tekst)
  - API MyMemory fallback, jeśli tłumaczenie się nie powiedzie
  - Auto-reset licznika błędów (resetuje się po 5 minutach)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate usunięty** - Tylko użycie API MyMemory (błędy 400 wyeliminowane, żądanie GET, brak CORS)
- 🔄 **Refaktoryzacja przycisku ponów** - Prostszy mechanizm wyzwalania z useEffect
- 🐛 **Poprawki błędów kompilacji** - Problemy z wcięciami JSX naprawione (sekcja Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integracja API MyMemory** - Darmowe API tłumaczeń zamiast LibreTranslate
- ✅ **Otwieranie strony wydań GitHub** - Przycisk do otwarcia strony wydań GitHub przy limicie szybkości
- ✅ **Ulepszenie obsługi błędów limitu szybkości** - Jasne komunikaty błędów i przycisk ponów
- 🐛 **Poprawki błędów kompilacji** - Nieużywane importy usunięte (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Ulepszenie walidacji wprowadzania** - Centralne narzędzie walidacji utworzone i zintegrowane w komponentach Calculator, Filaments, Printers
- ✅ **Komunikaty błędów walidacji** - Wielojęzyczne (HU/EN/DE) komunikaty błędów z powiadomieniami toast
- ✅ **Optymalizacja wydajności** - Komponenty lazy loading (podział kodu), optymalizacja useMemo i useCallback
- ✅ **Inicjalizacja specyficzna dla platformy** - Podstawy inicjalizacji specyficznej dla platformy macOS, Windows, Linux
- 🐛 **Poprawka błędu kompilacji** - Funkcje menu kontekstowego Printers.tsx dodane

### v0.3.3 (2025)
- 🖱️ **Funkcje przeciągania i upuszczania** - Zmiana kolejności ofert, filamentów i drukarek przez przeciąganie
- 📱 **Menu kontekstowe** - Menu prawego przycisku myszy dla szybkich akcji (edytuj, usuń, duplikuj, eksportuj PDF)
- 🎨 **Informacje zwrotne wizualne** - Zmiana nieprzezroczystości i kursora podczas przeciągania i upuszczania
- 🔔 **Powiadomienia toast** - Powiadomienia po zmianie kolejności
- 🐛 **Poprawka błędu kompilacji** - Poprawka Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Funkcje szablonów** - Zapisywanie i ładowanie obliczeń jako szablonów w komponencie Calculator
- 📜 **Historia/Wersjonowanie dla ofert** - Wersjonowanie ofert, przeglądanie historii, śledzenie zmian
- 🧹 **Poprawka duplikacji** - Zduplikowane funkcje eksportu/importu CSV/JSON usunięte z komponentów Filaments i Printers (pozostały w Settings)

### v0.3.1 (2025)
- ✅ **Ulepszenie walidacji wprowadzania** - Liczby ujemne wyłączone, wartości maksymalne ustawione (waga filamentu, czas druku, moc itp.)
- 📊 **Eksport/Import CSV/JSON** - Masowy eksport/import filamentów i drukarek w formacie CSV i JSON
- 📥 **Przyciski Importuj/Eksportuj** - Łatwy dostęp do funkcji eksportu/importu na stronach Filaments i Printers
- 🎨 **Ulepszenie stanów pustych** - Informacyjne stany puste wyświetlane, gdy nie ma danych

### v0.3.0 (2025)
- ✏️ **Edycja ofert** - Edytuj zapisane oferty (nazwa klienta, kontakt, opis, procent zysku, filamenty)
- ✏️ **Edytuj filamenty w ofercie** - Modyfikuj, dodawaj, usuwaj filamenty w obrębie oferty
- ✏️ **Przycisk edycji** - Nowy przycisk edycji obok przycisku usuń na liście ofert
- 📊 **Funkcja eksportu statystyk** - Eksportuj statystyki w formacie JSON lub CSV ze strony głównej
- 📈 **Generowanie raportów** - Generuj raporty tygodniowe/miesięczne/roczne/wszystkie w formacie JSON z filtrowaniem okresów
- 📋 **Wyświetlanie historii wersji** - Przeglądaj historię wersji w ustawieniach, integracja API GitHub Releases
- 🌐 **Tłumaczenie wydań GitHub** - Automatyczne tłumaczenie Węgierski -> Angielski/Niemiecki (API MyMemory)
- 💾 **Cache tłumaczeń** - Cache localStorage dla przetłumaczonych notatek wydań
- 🔄 **Dynamiczna historia wersji** - Wersje beta i release wyświetlane osobno
- 🐛 **Poprawki błędów** - Nieużywane zmienne usunięte, czyszczenie kodu, błędy lintera naprawione

### v0.2.55 (2025)
- 🖥️ **Funkcja Console/Log** - Nowy element menu Console do debugowania i przeglądania logów
- 🖥️ **Ustawienie Console** - Można włączyć wyświetlanie elementu menu Console w ustawieniach
- 📊 **Zbieranie logów** - Automatyczne rejestrowanie wszystkich wiadomości console.log, console.error, console.warn
- 📊 **Rejestrowanie błędów globalnych** - Automatyczne rejestrowanie zdarzeń błędów okna i nieobsłużonych odrzuceń obietnic
- 🔍 **Filtrowanie logów** - Filtruj według poziomu (all, error, warn, info, log, debug)
- 🔍 **Eksport logów** - Eksportuj logi w formacie JSON
- 🧹 **Usuwanie logów** - Usuwaj logi jednym przyciskiem
- 📜 **Auto-przewijanie** - Automatyczne przewijanie do nowych logów
- 💾 **Pełne rejestrowanie** - Wszystkie krytyczne operacje rejestrowane (zapisz, eksportuj, importuj, usuń, eksportuj PDF, pobierz aktualizację)
- 🔄 **Poprawka przycisku aktualizacji** - Przycisk pobierania używa teraz wtyczki shell Tauri, działa niezawodnie
- 🔄 **Rejestrowanie aktualizacji** - Pełne rejestrowanie sprawdzania i pobierania aktualizacji
- ⌨️ **Skróty klawiszowe** - `Ctrl/Cmd+N` (nowy), `Ctrl/Cmd+S` (zapisz), `Escape` (anuluj), `Ctrl/Cmd+?` (pomoc)
- ⌨️ **Poprawka skrótów klawiszowych macOS** - Obsługa Cmd vs Ctrl, obsługa zdarzeń fazy przechwytywania
- ⏳ **Stany ładowania** - Komponent LoadingSpinner dla stanów ładowania
- 💾 **Kopia zapasowa i przywracanie** - Pełna kopia zapasowa i przywracanie danych z dialogiem Tauri i wtyczkami fs
- 🛡️ **Granice błędów** - React ErrorBoundary do obsługi błędów na poziomie aplikacji
- 💾 **Automatyczne zapisywanie** - Automatyczne zapisywanie z ograniczeniem czasu z konfigurowalnym interwałem (domyślnie 30 sekund)
- 🔔 **Ustawienia powiadomień** - Powiadomienia toast włączone/wyłączone i ustawienie czasu trwania
- ⌨️ **Menu pomocy skrótów** - Lista skrótów klawiszowych w oknie modalnym (`Ctrl/Cmd+?`)
- 🎬 **Animacje i przejścia** - Płynne przejścia i animacje klatek kluczowych (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Kontekstowa pomoc dla wszystkich ważnych elementów przy najechaniu
- 🐛 **Poprawka błędu renderowania React** - Asynchroniczna operacja rejestratora konsoli, aby nie blokowała renderowania
- 🔧 **Aktualizacja num-bigint-dig** - Zaktualizowano do v0.9.1 (poprawka ostrzeżenia o deprecacji)

### v0.2.0 (2025)
- 🎨 **System motywów** - 6 nowoczesnych motywów (Jasny, Ciemny, Niebieski, Zielony, Fioletowy, Pomarańczowy)
- 🎨 **Selektor motywów** - Motyw do wyboru w ustawieniach, działa natychmiast
- 🎨 **Pełna integracja motywów** - Wszystkie komponenty (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) używają motywów
- 🎨 **Dynamiczne kolory** - Wszystkie zakodowane na stałe kolory zastąpione kolorami motywu
- 🎨 **Responsywny motyw** - Oferty i stopka Sidebar również używają motywów
- 💱 **Dynamiczna konwersja waluty** - Oferty są teraz wyświetlane w walucie bieżących ustawień (automatyczna konwersja)
- 💱 **Zmiana waluty** - Waluta zmieniona w ustawieniach natychmiast wpływa na wyświetlanie ofert
- 💱 **Konwersja waluty PDF** - Eksport PDF jest również tworzony w walucie bieżących ustawień
- 💱 **Konwersja ceny filamentu** - Ceny filamentów są również automatycznie konwertowane

### v0.1.85 (2025)
- 🎨 **Ulepszenia UI/UX**:
  - ✏️ Zduplikowane ikony usunięte (Przyciski Edytuj, Zapisz, Anuluj)
  - 📐 Sekcje Eksportuj/Importuj w układzie 2 kolumn (obok siebie)
  - 💾 Natywny dialog zapisu używany do zapisywania PDF (dialog Tauri)
  - 📊 Powiadomienia toast do zapisywania PDF (sukces/błąd)
  - 🖼️ Rozmiar okna aplikacji: 1280x720 (wcześniej 1000x700)
- 🐛 **Poprawki błędów**:
  - Brakujące informacje dodane w generowaniu PDF (customerContact, zysk w osobnej linii, przychody)
  - Klucze tłumaczeń dodane (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Ulepszenia eksportu PDF**:
  - Kontakt klienta (e-mail/telefon) wyświetlany w PDF
  - Obliczanie zysku w osobnej linii z procentem zysku
  - Przychody (Całkowita cena) w osobnej linii, podświetlone
  - Pełny podział kosztów w PDF

### v0.1.56 (2025)
- ✨ **Ulepszenia układu kalkulatora**: Przepełnienie kart filamentów naprawione, responsywny układ flexbox
- ✨ **Responsywny podział kosztów**: Teraz dynamicznie reaguje na zmiany rozmiaru okna
- 🐛 **Poprawka błędu**: Zawartość nie przelewa się z okna przy dodawaniu filamentu
- 🐛 **Poprawka błędu**: Wszystkie elementy Calculator prawidłowo reagują na zmiany rozmiaru okna

### v0.1.55 (2025)
- ✨ **Dialogi potwierdzenia**: Potwierdzenie wymagane przed usunięciem (Filamenty, Drukarki, Oferty)
- ✨ **Powiadomienia toast**: Powiadomienia po udanych operacjach (dodaj, zaktualizuj, usuń)
- ✨ **Walidacja wprowadzania**: Liczby ujemne wyłączone, wartości maksymalne ustawione
- ✨ **Stany ładowania**: Spinner ładowania przy starcie aplikacji
- ✨ **Granica błędów**: Obsługa błędów na poziomie aplikacji
- ✨ **Wyszukiwanie i filtrowanie**: Wyszukuj filamenty, drukarki i oferty
- ✨ **Duplikacja**: Łatwa duplikacja ofert
- ✨ **Formularze zwijane**: Formularze dodawania filamentu i drukarki są zwijane
- ✨ **Rozszerzenia oferty**: Pola nazwy klienta, kontaktu i opisu dodane
- 🐛 **Czyszczenie Console.log**: Brak console.logs w kompilacji produkcyjnej
- 🐛 **Poprawka pola opisu**: Długie teksty prawidłowo zawijają się.

---

**Wersja**: 1.4.33

Jeśli masz pytania lub znajdziesz błąd, proszę otwórz issue w repozytorium GitHub!

