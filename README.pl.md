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
- 🔒 **Szyfrowanie danych klientów** - Szyfrowanie AES-256-GCM dla danych klientów, zgodność z RODO/UE w zakresie ochrony danych, opcjonalna ochrona hasłem
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

## 🌿 Struktura gałęzi

- **`main`**: Stabilne wersje wydania (kompilacja RELEASE)
- **`beta`**: Wersje beta i rozwój (kompilacja BETA)

Po wypchnięciu do gałęzi `beta` automatycznie uruchamia się workflow GitHub Actions, który kompiluje wersję beta.

## 📋 Historia wersji

For detailed version history and changelog, please see [RELEASE.pl.md](RELEASE.pl.md).

---

**Wersja**: 3.0.4

Jeśli masz pytania lub znajdziesz błąd, proszę otwórz issue w repozytorium GitHub!

