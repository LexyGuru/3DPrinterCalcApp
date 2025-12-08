# 📋 Historia Wersji - 3DPrinterCalcApp

Ten dokument zawiera szczegółowy dziennik zmian dla wszystkich wersji aplikacji 3D Printer Calculator.

---

## v3.0.3 (2025) - 🔧 Hotfix: Poprawki Szyfrowania Danych Klientów i Ulepszenia UI

### 🐛 Poprawki Błędów

#### Poprawki Szyfrowania Danych Klientów
- **Akcje oferty wyłączone dla zaszyfrowanych danych** - Jeśli dane klienta są zaszyfrowane i nie podano hasła, edycja, duplikacja i zmiana statusu ofert są teraz wyłączone
- **Problem zduplikowanego klucza naprawiony** - Brak błędów "Encountered two children with the same key" na liście ofert i historii statusu
- **Poprawka licznika ofert** - Licznik ofert klienta teraz liczy również według `customerId`, nie tylko według nazwy, działając poprawnie z zaszyfrowanymi danymi
- **Aktualizacja ofert po wprowadzeniu hasła** - Gdy hasło jest podane i klienci są odszyfrowywani, nazwy klientów w ofertach są przywracane zamiast "ZASZYFROWANE DANE"
- **Lista historii statusu** - Lista historii statusu teraz pokazuje tylko ID klienta, nie nazwę klienta, nawet po wprowadzeniu hasła (zgodnie z wymaganiami szyfrowania)

#### Ulepszenia Wiadomości Toast
- **Zapobieganie zduplikowanym wiadomościom toast** - Wiadomości toast teraz pojawiają się tylko raz, nawet jeśli są wywoływane wielokrotnie
- **Toast zamyka się po kliknięciu przycisku** - Po kliknięciu przycisku "Wprowadź hasło" w wiadomości toast, toast automatycznie się zamyka
- **Przeprojektowanie wiadomości toast** - Wiadomości toast mają teraz czystszy, bardziej profesjonalny wygląd z układem kolumnowym dla przycisków akcji

#### Dodane Klucze Tłumaczenia
- **Nowe klucze tłumaczenia** - Dodane do wszystkich 13 języków:
  - `encryption.passwordRequired` - "Wymagane hasło szyfrowania"
  - `encryption.passwordRequiredForOfferEdit` - "Wymagane hasło szyfrowania do edycji oferty"
  - `encryption.passwordRequiredForOfferDuplicate` - "Wymagane hasło szyfrowania do duplikacji oferty"
  - `encryption.passwordRequiredForOfferStatusChange` - "Wymagane hasło szyfrowania do zmiany statusu oferty"
  - `encryption.passwordRequiredForCustomerCreate` - "Wymagane hasło szyfrowania do utworzenia nowego klienta"
  - `encryption.passwordRequiredForCustomerEdit` - "Wymagane hasło szyfrowania do edycji"
  - `encryption.encryptedData` - "ZASZYFROWANE DANE"
  - `customers.id` - "ID Klienta"
  - `customers.encryptedDataMessage` - "🔒 Zaszyfrowane dane - wymagane hasło do wyświetlenia"

### 📝 Szczegóły Techniczne

- **Wersja zaktualizowana**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.3`
- **Zastąpione hardcoded stringi**: Wszystkie hardcoded stringi węgierskie zastąpione kluczami tłumaczenia
- **Zaktualizowane typy TypeScript**: Nowe klucze tłumaczenia dodane do typu `TranslationKey`
- **Zmodyfikowany Toast Provider**: Dodana kontrola zduplikowanych toastów i automatyczne zamykanie
- **Logika aktualizacji ofert**: Automatyczna aktualizacja ofert po odszyfrowaniu klientów gdy hasło jest podane

---

## v3.0.2 (2025) - 🔧 Hotfix: Poprawki Tutorialu, Uprawnienia, Logowanie Factory Reset

### 🐛 Poprawki Błędów

#### Poprawki Tutorialu
- **Zachowanie danych tutorialu** - Jeśli tutorial został już uruchomiony raz, istniejące dane nie są ponownie usuwane
- **Tutorial rozszerzony do 18 kroków** - Dodano: Projekty, Zadania, Kalendarz, kroki Backup/Przywracanie
- **Klucze tłumaczenia tutorialu** - Brakujące klucze tłumaczenia dodane do wszystkich plików językowych

#### Poprawki Uprawnień
- **Uprawnienia customers.json** - Uprawnienia dodane do usuwania pliku `customers.json`

#### Logowanie Factory Reset
- **Zapisywanie pliku logu backend** - Kroki Factory Reset są teraz zapisywane w pliku logu backend
- **Szczegółowe logowanie** - Każdy krok Factory Reset jest szczegółowo logowany
- **Usuwanie logu backend przywrócone** - Plik logu backend jest teraz usuwany podczas Factory Reset

### 📝 Szczegóły Techniczne

- **Wersja zaktualizowana**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Tłumaczenia, Beta Build Workflow

### 🐛 Poprawki Błędów

#### Poprawka Factory Reset
- **Factory reset naprawiony** - Plik `customers.json` jest teraz jawnie usuwany podczas factory reset
- **Pełne usunięcie danych klientów** - Plik zaszyfrowanych danych klientów (`customers.json`) jest również usuwany, zapewniając pełne wymazanie danych

#### Brakujące Klucze Tłumaczenia
- **Klucz `encryption.noAppPassword` dodany** - Brakujący klucz tłumaczenia dodany do wszystkich 14 języków
- **Tłumaczenia komunikatów backup** - Tłumaczenia dla komunikatu "Brak jeszcze automatycznych plików kopii zapasowych" dodane
- **Tłumaczenia zarządzania logami** - Tłumaczenia dla tekstów zarządzania Log i Audit Log dodane:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Tłumaczenia kalendarza** - Tłumaczenia dla nazw miesięcy i dni dodane:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Opis menu pomocy** - Tłumaczenia dla opisu "Show Help menu item in Sidebar" dodane

#### Poprawka Workflow Beta Build
- **Jawne checkout branch beta** - Workflow teraz używa jawnego najnowszego commitu z brancha `beta`
- **Poprawka commitu tagu** - Tag `beta-v3.0.1` teraz wskazuje na poprawny commit (nie stary commit)
- **Poprawka daty kodu źródłowego** - Data "Source code" teraz pokazuje czas kompilacji, nie datę starego commitu
- **Dodane kroki weryfikacji** - Weryfikacja Git pull i commit SHA dodana do workflow

### 📝 Szczegóły Techniczne

- **Wersja zaktualizowana**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Zduplikowane klucze usunięte**: Duplikacje `settings.logs.openFolder` usunięte ze wszystkich plików językowych
- **Typy TypeScript zaktualizowane**: `encryption.noAppPassword` dodany do typu `TranslationKey`

---

## v3.0.0 (2025) - 🔒 Szyfrowanie Danych Klientów & Zgodność z RODO + ⚡ Optymalizacja Wydajności

### ⚡ Optymalizacja Wydajności i Code Splitting

#### Dokumentacja i Optymalizacja React.lazy()
- **Dokumentacja implementacji React.lazy()** - Pełna dokumentacja utworzona (`docs/PERFORMANCE.md`)
- **Optymalizacja fazy ładowania** - Tylko dane ładują się podczas fazy ładowania, komponenty na żądanie
- **Optymalizacja fallback Suspense** - Zoptymalizowane komponenty fallback w AppRouter.tsx
- **Error boundary dodany** - Komponent LazyErrorBoundary.tsx dla leniwie ładowanych komponentów

#### Code Splitting Oparty na Trasach
- **Integracja React Router** - React Router v7.10.0 zainstalowany i skonfigurowany
- **Nawigacja oparta na URL** - Struktura tras zaimplementowana (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy loading dla tras** - Każda trasa automatycznie podzielona na oddzielne pliki
- **Konwersja State-based → Routing** - Stan `activePage` przekonwertowany na routing oparty na URL
- **Strony możliwe do zakładki** - Wszystkie strony dostępne przez bezpośredni URL
- **Obsługa nawigacji przeglądarki** - Przyciski wstecz/do przodu działają, lepsze UX

#### Precyzyjne Dostrojenie Code Splitting
- **Optymalizacja konfiguracji build Vite** - `rollupOptions.output.manualChunks` skonfigurowane
- **Optymalizacja chunk-ów vendor**:
  - React/React-DOM/React-Router oddzielny chunk (`vendor-react`)
  - API Tauri oddzielny chunk (`vendor-tauri`)
  - Biblioteki UI oddzielne chunki (`vendor-ui-framer`, `vendor-ui-charts`)
  - Inne node_modules (`vendor`)
- **Chunking oparty na trasach** - Automatyczne lazy loading tworzy oddzielne chunki na trasę
- **Grupowanie plików router** - Zorganizowane w chunki `router`, `routes`
- **Grupowanie wspólnych komponentów** - Chunk `components-shared`
- **Limit ostrzeżenia rozmiaru chunk** - Ustawiony na 1000 KB

#### Architektura Modułowa
- **Dokumentacja architektury modułowej** - Pełna dokumentacja (`docs/MODULAR_ARCHITECTURE.md`)
- **Aliasy ścieżek** - Aliasy `@features`, `@shared`, `@core` skonfigurowane
- **Konfiguracja Vite i TypeScript** - Zaktualizowana z obsługą aliasów ścieżek
- **Implementacja modułów wspólnych**:
  - Wspólne komponenty (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Wspólne hooki (useModal, useForm)
  - Wspólne narzędzia (debounce, format, validation)
- **Refaktoryzacja modułów funkcji** - Pełna refaktoryzacja 6 modułów:
  - Calculator: 582 linie → 309 linii (-46.9%)
  - Settings: 5947 linii → 897 linii (-85%!)
  - Offers: 3985 linii → 3729 linii (-6.4%)
  - Home: 3454 linie → 3308 linii (-4.2%)
  - Moduły Filaments i Printers również zrefaktoryzowane

### 🔒 Szyfrowanie Danych Klientów
- **Szyfrowanie AES-256-GCM** - Szyfrowane przechowywanie danych klientów przy użyciu standardowego algorytmu branżowego AES-256-GCM
- **Haszowanie haseł PBKDF2** - Bezpieczne przechowywanie haseł przy użyciu algorytmu PBKDF2 (100 000 iteracji, SHA-256)
- **Przechowywanie w oddzielnym pliku** - Zaszyfrowane dane klientów są przechowywane w oddzielnym pliku `customers.json`
- **Zarządzanie hasłami w pamięci** - Hasła są przechowywane tylko w pamięci i usuwane po zamknięciu aplikacji
- **Integracja hasła aplikacji** - Opcjonalnie: hasło ochrony aplikacji może być również używane do szyfrowania
- **System monitowania hasła** - Inteligentne żądanie hasła (nie pojawia się na ekranie ładowania, po wiadomości powitalnej)
- **Ochrona integralności danych** - Zaszyfrowane dane chronione przed przypadkowym usunięciem

### ✅ Ochrona Danych Zgodna z RODO/UE
- **Zgodność**: Aplikacja obsługuje dane klientów zgodnie z RODO (Rozporządzenie Ogólne o Ochronie Danych) i przepisami UE dotyczącymi ochrony danych
- **Standardowe szyfrowanie branżowe**: Użycie algorytmu AES-256-GCM (spełnia zalecenia UE)
- **Bezpieczne zarządzanie hasłami**: Algorytm haszujący PBKDF2 (zalecany przez NIST)
- **Minimalna zbiórka danych**: Przechowuje tylko niezbędne dane klientów wymagane przez aplikację
- **Retencja danych**: Użytkownik ma pełną kontrolę nad przechowywaniem i usuwaniem danych
- **Kontrola dostępu**: Dostęp chroniony hasłem do danych klientów

### 🎨 Ulepszenia UI/UX
- **Modal aktywacji szyfrowania** - Nowe okno dialogowe modalne do włączania szyfrowania z opcją hasła aplikacji
- **Rozszerzenie ConfirmDialog** - Obsługa niestandardowej treści dla komponentów modalnych
- **Timing monitowania hasła** - Inteligentne wyświetlanie (nie na ekranie ładowania)
- **Integracja ustawień** - Ustawienia szyfrowania w zakładce Bezpieczeństwo

### 🔧 Ulepszenia Techniczne
- **Moduł szyfrowania backend** - Szyfrowanie zaimplementowane w Rust (`src-tauri/src/encryption.rs`)
- **Narzędzia szyfrowania frontend** - Funkcje narzędziowe TypeScript do obsługi szyfrowania
- **Menedżer haseł** - System zarządzania hasłami w pamięci
- **Integracja magazynu** - Funkcje saveCustomers/loadCustomers z integracją szyfrowania

### 📚 Wsparcie Językowe
- **13 języków zaktualizowanych** - Nowe klucze tłumaczenia szyfrowania we wszystkich plikach językowych
- **Nowe klucze**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Monitorowanie Wydajności & System Dzienników Audytu

### 🌐 Lokalizacja Komunikatów Konsoli
- **Pełna lokalizacja konsoli** - Wszystkie komunikaty konsoli wyświetlane są w wybranym języku
- **Tłumaczenie operacji magazynu** - Komunikaty ładowania i zapisywania (drukarki, filamenty, ustawienia, oferty, klienci, projekty, zadania)
- **Tłumaczenie komunikatów kopii zapasowej** - Codzienna kontrola kopii zapasowej, tworzenie kopii zapasowej, komunikaty rotacji
- **Tłumaczenie komunikatów rotacji dziennika** - Komunikaty rotacji dziennika i dziennika audytu z dynamicznymi częściami
- **Tłumaczenie metryk wydajności** - Metryki CPU i pamięci, regularne komunikaty dziennika
- **Tłumaczenie komunikatów systemowych** - Inicjalizacja aplikacji, inicjalizacja dziennika frontendu, komunikat powitalny
- **Tłumaczenie komunikatów wieloczęściowych** - Tłumaczenie części danych komunikatów konsoli (data, znacznik czasu, plik, informacje o statusie)
- **Wsparcie dla 13 języków** - Wszystkie komunikaty konsoli przetłumaczone na angielski, węgierski, niemiecki, hiszpański, włoski, polski, portugalski, rosyjski, ukraiński, czeski, słowacki i chiński

### ⚡ Rejestrowanie Metryk Wydajności
- **Klasa Performance Timer** - Ręczne mierzenie czasu operacji
- **Pomiar czasu ładowania** - Rejestrowane są wszystkie czasy ładowania modułów (Settings, Printers, Filaments, Offers, Customers)
- **Pomiar czasu operacji** - Automatyczne mierzenie czasu dla operacji asynchronicznych i synchronicznych
- **Monitorowanie wykorzystania pamięci** - Śledzenie i rejestrowanie pamięci sterty JavaScript
- **Monitorowanie wykorzystania CPU** - Regularne pomiary wykorzystania CPU co 5 minut
- **Podsumowanie wydajności** - Agregowane statystyki dla czasów ładowania i operacji
- **Strukturyzowane komunikaty dziennika** - Szczegółowe wyświetlanie procentowego wykorzystania CPU i wartości pamięci
- **Polecenia wydajności backendu** - Polecenie backendu `get_performance_metrics` dla danych CPU i pamięci

### 🔐 Implementacja Dzienników Audytu
- **Infrastruktura dzienników audytu** - Oddzielny plik dziennika audytu (`audit-YYYY-MM-DD.json`)
- **Rejestrowanie operacji krytycznych**:
  - Operacje CRUD (Tworzenie/Aktualizacja/Usuwanie dla Filaments, Printers, Offers, Customers)
  - Zmiany ustawień (motyw, język, ustawienia dziennika, autozapis, itp.)
  - Operacje kopii zapasowych (tworzenie, przywracanie)
  - Operacje Resetu do Ustawień Fabrycznych
  - Rejestrowanie błędów
- **Przeglądarka Dzienników Audytu** - Wirtualne przewijanie dla dużych plików, z filtrowaniem, wyszukiwaniem i możliwościami eksportu
- **Automatyczne czyszczenie** - Stare pliki dzienników audytu automatycznie usuwane na podstawie konfigurowalnych dni przechowywania
- **Polecenia backendu** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Pełna lokalizacja** - Wszystkie 13 obsługiwanych języków

### 🎯 Ulepszenia UI/UX
- **Historia Dzienników Audytu** - Układ dwukolumnowy w sekcji Ustawienia → Zarządzanie Dziennikami
- **Wyświetlanie metryk wydajności** - W oknie diagnostyki systemu
- **Aktualizacje w czasie rzeczywistym Przeglądarki Dzienników** - Przełącznik auto-odświeżania, wykrywanie zmian oparte na hash
- **Udoskonalenie automatycznego przewijania** - Świadomość pozycji przewijania użytkownika

### 🔧 Ulepszenia Techniczne
- **Optymalizacja sprawdzania aktualizacji GitHub** - Przy starcie i co 5 godzin (oparte na localStorage)
- **Format tagu beta** - Osobny tag `beta-v2.0.0` dla wydań beta (nie nadpisuje głównego wydania)
- **Logika sprawdzania wersji** - Wyszukiwanie wersji beta oparte na prefiksie `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnostyka Systemu & Ulepszenia Wydajności

### 🔍 Diagnostyka Systemu
- **Kompleksowe narzędzie sprawdzania stanu systemu**:
  - Wyświetlanie informacji o systemie (CPU, pamięć, OS, GPU, dysk)
  - Walidacja systemu plików (data.json, filamentLibrary.json, update_filament.json)
  - Sprawdzanie dostępności modułów (Settings, Offers, Printers, Customers, Calculator, Home)
  - Sprawdzanie dostępności przechowywania danych
  - Pasek postępu ze szczegółowymi komunikatami statusu
  - Podsumowanie ze stanami błędów/ostrzeżeń/sukcesu
  - Przycisk ponownego uruchomienia
- **Przeniesione do sekcji Zarządzanie Dziennikami** (bardziej logiczne umiejscowienie)
- **Pełna lokalizacja** we wszystkich 13 obsługiwanych językach

### ⚡ Wydajność Przeglądarki Dzienników
- **Wirtualne przewijanie dla dużych plików dziennika**:
  - Niestandardowa implementacja wirtualnego przewijania dla komponentu LogViewer
  - Renderowane są tylko widoczne wpisy dziennika, znacząco poprawiając wydajność
  - Płynne przewijanie i wyszukiwanie nawet przy ogromnych plikach dziennika (100k+ linii)
  - Utrzymuje dokładną pozycję i wysokość paska przewijania
  - Znacznie szybsze operacje wyszukiwania i filtrowania

### 🔔 Ujednolicony System Powiadomień
- **Centralny serwis powiadomień**:
  - Pojedynczy `notificationService` dla powiadomień Toast i platformy
  - Routing powiadomień oparty na priorytecie (wysoki priorytet → powiadomienie platformy)
  - Automatyczne podejmowanie decyzji oparte na stanie aplikacji (pierwszy plan/tło)
  - Zgodne wstecz z istniejącymi funkcjami powiadomień
  - Konfigurowalne ustawienia powiadomień (Toast włącz/wyłącz, powiadomienie platformy włącz/wyłącz, poziomy priorytetu)

### 🎯 Ulepszenia UI/UX
- Diagnostyka Systemu przeniesiona z sekcji Kopie Zapasowe do sekcji Zarządzanie Dziennikami (bardziej logiczne umiejscowienie)
- Błędy lintera TypeScript naprawione (nieużywane zmienne, rozbieżności typów)
- Poprawiona jakość kodu i utrzymanie

---

## v1.8.0 (2025) - 📊 Zaawansowany System Rejestrowania & Ulepszenia Resetu do Ustawień Fabrycznych

### 🔄 Modal Postępu Resetu do Ustawień Fabrycznych
- **Wizualny wskaźnik postępu dla resetu fabrycznego**:
  - Animowany postęp 4-etapowy (usuwanie kopii zapasowej, usuwanie dziennika, usuwanie konfiguracji, ukończenie)
  - Aktualizacje statusu w czasie rzeczywistym z komunikatami sukcesu/błędu
  - Odliczanie 10 sekund przed wyświetleniem selektora języka
  - Modal nie może być zamknięty podczas procesu resetu
  - Pełna lokalizacja we wszystkich 13 obsługiwanych językach

### 📋 Kompleksowa Przegląd Systemu Rejestrowania
- **Profesjonalna infrastruktura rejestrowania**:
  - Ścieżki plików dziennika multiplatformowe (katalogi danych specyficzne dla platformy)
  - Rejestrowanie informacji o systemie (CPU, pamięć, OS, GPU, dysk, wersja aplikacji)
  - Rejestrowanie informacji o katalogach (foldery dzienników i kopii zapasowych, liczba plików, rozmiary)
  - Szczegółowe rejestrowanie statusu ładowania (sukces/ostrzeżenie/błąd/krytyczny)
  - Poziomy dziennika (DEBUG, INFO, WARN, ERROR) z filtrowaniem
  - Obsługa strukturyzowanego formatu dziennika (tekst i JSON)
  - Rotacja dziennika z automatycznym czyszczeniem (konfigurowalne dni przechowywania)
  - Modal Przeglądarki Dzienników z filtrowaniem, wyszukiwaniem, podświetlaniem i eksportem
  - Konfiguracja dziennika w Ustawieniach (format, poziom, dni przechowywania)
  - Zawartość pliku dziennika zachowana przy ponownym uruchomieniu aplikacji (tryb dołączania)

### 🔍 Diagnostyka Systemu
- **Modal sprawdzania stanu systemu**:
  - Wyświetlanie i walidacja informacji o systemie
  - Monitorowanie wykorzystania pamięci z ostrzeżeniami
  - Sprawdzanie istnienia plików
  - Sprawdzanie dostępności modułów
  - Testy dostępności przechowywania danych
  - Wyświetlanie paska postępu i podsumowania
  - Pełna lokalizacja we wszystkich 13 obsługiwanych językach

### 🛠️ Ulepszenia Techniczne
- Rejestrowanie wyłączone podczas Resetu do Ustawień Fabrycznych, aby zapobiec zanieczyszczeniu dziennika
- Tworzenie data.json opóźnione do wyboru języka (czystszy proces Resetu do Ustawień Fabrycznych)
- Inicjalizacja pliku dziennika opóźniona do wyboru języka
- Automatyczne ponowne uruchomienie aplikacji po wyborze języka
- Polecenia backendu do zarządzania plikami kopii zapasowych i dzienników
- Obsługa ścieżek multiplatformowych dla kopii zapasowych i dzienników
- Naprawione obliczanie pamięci (zgodność z sysinfo 0.31)
- Ostrzeżenia stylu React naprawione (konflikty skrótów CSS)

---

## v1.7.0 (2025) - 💾 System kopii zapasowych, ekran ładowania i ulepszenia biblioteki filamentów

### 💾 Pełna Implementacja Systemu Kopii Zapasowych
- **Automatyczny system kopii zapasowych** - Jeden plik kopii zapasowej dziennie (tworzony tylko w nowy dzień)
- **Hook przypomnienia o kopii zapasowej i komponent UI** - Powiadomienie, jeśli nie ma kopii zapasowej
- **UI Historii Kopii Zapasowych w Ustawieniach** - Lista kodowana kolorami (zielony/żółty/czerwony/szary) dla wieku pliku kopii zapasowej i odliczanie usuwania
- **Okno modalne autozapisu** - Wyjaśnienie, gdy autozapis jest włączony
- **Synchronizacja autozapisu i automatycznej kopii zapasowej** - Automatyczna kopia zapasowa przy zapisie autozapisu
- **Reset do Ustawień Fabrycznych z automatycznym usuwaniem plików kopii zapasowych**
- **Historia kopii zapasowych automatycznie odświeża się**, gdy autozapis jest włączony

### 🔧 Optymalizacja Backendu Systemu Kopii Zapasowych
- **Dodane polecenia backendu** do usuwania starych kopii zapasowych (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funkcje czyszczenia frontendu zaktualizowane, aby używały poleceń backendu**, eliminując błędy "forbidden path"
- **Wszystkie operacje plików (tworzenie, usuwanie, listowanie) teraz odbywają się z backendu**, unikając problemów z uprawnieniami Tauri

### ⚡ Optymalizacja Wydajności Systemu Kopii Zapasowych
- `hasTodayBackup()` zoptymalizowane: używa polecenia backendu `list_backup_files`, nie trzeba czytać wszystkich plików
- **Dodany mechanizm blokady** w celu zapobieżenia równoległym kopiom zapasowym
- **Szybsza operacja** nawet przy dużej liczbie plików kopii zapasowych

### 📁 Otwieranie Katalogu Kopii Zapasowych i Historia Dzienników
- **Dodany przycisk** w sekcji Ustawienia → Historia Kopii Zapasowych do otwarcia folderu kopii zapasowych
- **Nowa sekcja historii dzienników** w Ustawieniach - listuj i otwieraj pliki dzienników
- **Automatyczne usuwanie plików dziennika** konfigurowalne według dni
- **Wsparcie multiplatformowe** (macOS, Windows, Linux)

### 🎨 Kompleksowa Przegląd Ekranu Ładowania
- **Logo aplikacji zintegrowane** jako tło z efektem glassmorphism
- **Naprawiony układ dla znaczników** - Automatyczne przewijanie, tylko 3 moduły widoczne naraz
- **Efekt shimmer, animacje pulsujących kropek**
- **Kontener przewijania** z ukrytym paskiem przewijania

### ⚙️ Ulepszenia Procesu Ładowania
- **Spowolnione ładowanie** (opóźnienia 800ms) - komunikaty ładowania są czytelne
- **Obsługa błędów dla wszystkich modułów** (bloki try-catch)
- **Fizyczny plik dziennika** dla wszystkich statusów i błędów
- **Podsumowanie ładowania** na końcu

### 🎨 Wielojęzyczne Wsparcie Biblioteki Filamentów
- **Kolory filamentów wyświetlane** we wszystkich obsługiwanych językach (nie tylko węgierski/niemiecki/angielski)
- **Logika zapasowa**: Angielski → Węgierski → Niemiecki → surowy kolor/nazwa
- Zaktualizowane komponenty Settings, GlobalSearch i Filaments

### 🔄 Ulepszenia Resetu do Ustawień Fabrycznych
- **Fizyczne usuwanie plików** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset instancji Store** bez przeładowania
- **Wyświetlanie selektora języka** po Resecie do Ustawień Fabrycznych

### 🎓 Aktualizacja Samouczka z Nowymi Funkcjami v1.7.0
- Nowe kroki: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Rozszerzone dane demonstracyjne: 6 filamentów → 11 filamentów, 3 oferty → 5 ofert
- Dodane klucze tłumaczeń dla wszystkich języków

---

## v1.6.0 (2025) - 📊 Interaktywne widgety & dostrojenie wydajności dużych tabel

### 🧠 Interaktywne Wykresy i Szczegółowe Widoki Modalne
- **Główne wykresy pulpitu używają ujednoliconego komponentu `InteractiveChart`** z klikalnymi punktami danych i animowanym szczegółowym widokiem modalnym
- **Tooltip i widok szczegółowy są zlokalizowane**, pokazując czytelne etykiety (przychody, koszty, zysk netto, liczba ofert)
- **Okres czasu można ustawić bezpośrednio z wykresu trendu** (tygodniowy / miesięczny / roczny) używając pędzla, pokrojone dane płyną do Home → Dashboard

### 🧵 Wirtualne Przewijanie dla Dużych List
- **Niestandardowe wirtualne przewijanie** dla listy Ofert i tabeli Filamentów – renderowane są tylko widoczne wiersze, zapewniając płynne przewijanie nawet przy 10k+ rekordach
- **Ustawienia → Biblioteka Filamentów** używa tego samego wzorca, utrzymując pełną paletę 12,000+ kolorów responsywną
- **Pozycja/wysokość paska przewijania pozostaje poprawna** dzięki elementom spacerów powyżej i poniżej widocznego zakresu

### 📋 Zaawansowane Sortowanie i Filtrowanie Tabel
- **Sortowanie wielokolumnowe** na stronach Filamentów i Ofert (klik: rosnąco/malejąco, Shift+klik: buduj łańcuch sortowania – np. "Marka ↑, następnie Cena/kg ↓")
- **Ustawienia sortowania zapisane w `settings`**, więc preferowana kolejność utrzymuje się po ponownym uruchomieniu
- **Filamenty**: filtry na poziomie kolumny dla marki, materiału/typu i wartości koloru/HEX
- **Oferty**: filtr kwoty z wartościami min/max i filtry zakresu dat (od / do)

---

**Ostatnia aktualizacja**: 1 grudnia 2025


