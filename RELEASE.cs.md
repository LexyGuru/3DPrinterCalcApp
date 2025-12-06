# 📋 Historie verzí - 3DPrinterCalcApp

Tento dokument obsahuje podrobný changelog pro všechny verze aplikace 3D Printer Calculator.

---

## v3.0.0 (2025) - 🔒 Šifrování Dat Zákazníků & Soulad s GDPR

### 🔒 Šifrování Dat Zákazníků
- **Šifrování AES-256-GCM** - Šifrované ukládání dat zákazníků pomocí standardního průmyslového algoritmu AES-256-GCM
- **Hashování hesel PBKDF2** - Bezpečné ukládání hesel pomocí algoritmu PBKDF2 (100 000 iterací, SHA-256)
- **Ukládání v samostatném souboru** - Šifrovaná data zákazníků jsou uložena v samostatném souboru `customers.json`
- **Správa hesel v paměti** - Hesla jsou ukládána pouze v paměti a mazána při zavření aplikace
- **Integrace hesla aplikace** - Volitelně: heslo ochrany aplikace může být také použito pro šifrování
- **Systém výzvy k zadání hesla** - Inteligentní žádost o heslo (nezobrazuje se na obrazovce načítání, po uvítací zprávě)
- **Ochrana integrity dat** - Šifrovaná data chráněná proti náhodnému smazání

### ✅ Ochrana Dat v Souladu s GDPR/EU
- **Soulad**: Aplikace zpracovává data zákazníků v souladu s GDPR (Obecné nařízení o ochraně osobních údajů) a předpisy EU o ochraně dat
- **Standardní průmyslové šifrování**: Použití algoritmu AES-256-GCM (splňuje doporučení EU)
- **Bezpečná správa hesel**: Hashovací algoritmus PBKDF2 (doporučeno NIST)
- **Minimální sběr dat**: Ukládá pouze nezbytná data zákazníků vyžadovaná aplikací
- **Uchování dat**: Uživatel má plnou kontrolu nad ukládáním a mazáním dat
- **Řízení přístupu**: Přístup chráněný heslem k datům zákazníků

### 🎨 Vylepšení UI/UX
- **Modal aktivace šifrování** - Nové modální dialogové okno pro aktivaci šifrování s možností hesla aplikace
- **Rozšíření ConfirmDialog** - Podpora vlastního obsahu pro modální komponenty
- **Časování výzvy k zadání hesla** - Inteligentní zobrazení (ne na obrazovce načítání)
- **Integrace nastavení** - Nastavení šifrování na kartě Zabezpečení

### 🔧 Technická Vylepšení
- **Modul šifrování backend** - Šifrování implementované v Rust (`src-tauri/src/encryption.rs`)
- **Utility šifrování frontend** - Pomocné funkce TypeScript pro správu šifrování
- **Správce hesel** - Systém správy hesel v paměti
- **Integrace úložiště** - Funkce saveCustomers/loadCustomers s integrací šifrování

### 📚 Jazyková Podpora
- **13 jazyků aktualizováno** - Nové šifrovací překladové klíče ve všech jazykových souborech
- **Nové klíče**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Sledování výkonu & Systém auditního záznamu

### 🌐 Lokalizace Zpráv Konzole
- **Úplná lokalizace konzole** - Všechny zprávy konzole se zobrazují ve vybraném jazyce
- **Překlad operací úložiště** - Zprávy o načítání a ukládání (tiskárny, filamenty, nastavení, nabídky, zákazníci, projekty, úkoly)
- **Překlad zpráv zálohy** - Denní kontrola zálohy, vytvoření zálohy, zprávy o rotaci
- **Překlad zpráv rotace protokolů** - Zprávy o rotaci protokolů a protokolů auditu s dynamickými částmi
- **Překlad metrik výkonu** - Metriky CPU a paměti, pravidelné zprávy protokolu
- **Překlad systémových zpráv** - Inicializace aplikace, inicializace protokolu frontendu, uvítací zpráva
- **Překlad vícečástných zpráv** - Překlad datových částí zpráv konzole (datum, časová značka, soubor, informace o stavu)
- **Podpora 13 jazyků** - Všechny zprávy konzole přeloženy do angličtiny, maďarštiny, němčiny, španělštiny, italštiny, polštiny, portugalštiny, ruštiny, ukrajinštiny, češtiny, slovenštiny a čínštiny

### ⚡ Protokolování metrik výkonu
- **Třída Performance Timer** - Ruční měření času operací
- **Měření času načítání** - Všechny časy načítání modulů zaznamenány (Settings, Printers, Filaments, Offers, Customers)
- **Měření času operace** - Automatické měření času pro asynchronní a synchronní operace
- **Sledování využití paměti** - Sledování a protokolování paměti haldy JavaScript
- **Sledování využití CPU** - Pravidelné měření využití CPU každých 5 minut
- **Shrnutí výkonu** - Agregované statistiky pro časy načítání a operace
- **Strukturované zprávy logu** - Podrobné zobrazení procenta CPU a hodnot paměti
- **Backend příkazy výkonu** - Backend příkaz `get_performance_metrics` pro data CPU a paměti

### 🔐 Implementace auditního záznamu
- **Infrastruktura auditního záznamu** - Samostatný soubor auditního záznamu (`audit-YYYY-MM-DD.json`)
- **Protokolování kritických operací**:
  - CRUD operace (Vytvoření/Aktualizace/Smazání pro Filaments, Printers, Offers, Customers)
  - Změny nastavení (téma, jazyk, nastavení logu, autosave, atd.)
  - Operace zálohování (vytvoření, obnovení)
  - Operace továrního resetu
  - Záznam chyb
- **Prohlížeč auditního záznamu** - Virtuální scrollování pro velké soubory, s filtrováním, vyhledáváním a možnostmi exportu
- **Automatické čištění** - Staré soubory auditního záznamu automaticky mazány na základě konfigurovatelných dnů uchování
- **Backend příkazy** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Plná lokalizace** - Všechny 13 podporovaných jazyků

### 🎯 Vylepšení UI/UX
- **Historie auditního záznamu** - Dvousloupcové rozvržení v sekci Nastavení → Správa logů
- **Zobrazení metrik výkonu** - V modálním okně diagnostiky systému
- **Aktualizace v reálném čase prohlížeče logů** - Přepínač automatického obnovení, detekce změn založená na hash
- **Vylepšení automatického scrollování** - Povědomí o pozici scrollování uživatele

### 🔧 Technická vylepšení
- **Optimalizace kontroly aktualizací GitHub** - Při spuštění a každých 5 hodin (založeno na localStorage)
- **Formát beta tagu** - Samostatný tag `beta-v2.0.0` pro beta verze (nepřepisuje hlavní verzi)
- **Logika kontroly verze** - Vyhledávání beta verze založené na prefixu `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnostika systému & Vylepšení výkonu

### 🔍 Diagnostika systému
- **Komplexní nástroj kontroly zdraví systému**:
  - Zobrazení informací o systému (CPU, paměť, OS, GPU, disk)
  - Validace systému souborů (data.json, filamentLibrary.json, update_filament.json)
  - Kontroly dostupnosti modulů (Settings, Offers, Printers, Customers, Calculator, Home)
  - Kontroly dostupnosti úložiště dat
  - Progress bar s podrobnými zprávami o stavu
  - Shrnutí se stavy chyb/varování/úspěchu
  - Tlačítko pro opakované spuštění
- **Přesunuto do sekce Správa logů** (logičtější umístění)
- **Plná lokalizace** ve všech 13 podporovaných jazycích

### ⚡ Výkon prohlížeče logů
- **Virtuální scrollování pro velké soubory logu**:
  - Vlastní implementace virtuálního scrollování pro komponentu LogViewer
  - Renderovány jsou pouze viditelné položky logu, výrazně zlepšuje výkon
  - Plynulé scrollování a vyhledávání i s obrovskými soubory logu (100k+ řádků)
  - Udržuje přesnou pozici a výšku posuvníku
  - Výrazně rychlejší operace vyhledávání a filtrování

### 🔔 Sjednocený systém oznámení
- **Centrální služba oznámení**:
  - Jeden `notificationService` pro Toast i platformní oznámení
  - Směrování oznámení založené na prioritě (vysoká priorita → platformní oznámení)
  - Automatické rozhodování založené na stavu aplikace (popředí/pozadí)
  - Zpětně kompatibilní s existujícími funkcemi oznámení
  - Konfigurovatelná nastavení oznámení (Toast zap/vyp, platformní oznámení zap/vyp, úrovně priority)

### 🎯 Vylepšení UI/UX
- Diagnostika systému přesunuta ze sekce Zálohy do sekce Správa logů (logičtější umístění)
- Opraveny chyby linteru TypeScript (nepoužívané proměnné, nesoulady typů)
- Zlepšena kvalita kódu a udržovatelnost

---

## v1.8.0 (2025) - 📊 Pokročilý systém protokolování & Vylepšení továrního resetu

### 🔄 Modální okno průběhu továrního resetu
- **Vizuální indikátor průběhu pro tovární reset**:
  - Animovaný průběh ve 4 krocích (mazání zálohy, mazání logu, mazání konfigurace, dokončení)
  - Aktualizace stavu v reálném čase se zprávami o úspěchu/chybě
  - Odpočet 10 sekund před zobrazením výběru jazyka
  - Modální okno nelze zavřít během procesu resetu
  - Plná lokalizace ve všech 13 podporovaných jazycích

### 📋 Komplexní přehodnocení systému protokolování
- **Profesionální infrastruktura protokolování**:
  - Cesty k souborům logu multiplatformové (adresáře dat specifické pro platformu)
  - Protokolování informací o systému (CPU, paměť, OS, GPU, disk, verze aplikace)
  - Protokolování informací o adresářích (složky logů a záloh, počet souborů, velikosti)
  - Podrobné protokolování stavu načítání (úspěch/varování/chyba/kritické)
  - Úrovně logu (DEBUG, INFO, WARN, ERROR) s filtrováním
  - Podpora strukturovaného formátu logu (text a JSON)
  - Rotace logu s automatickým čištěním (konfigurovatelné dny uchování)
  - Modální okno prohlížeče logů s filtrováním, vyhledáváním, zvýrazňováním a exportem
  - Konfigurace logu v Nastavení (formát, úroveň, dny uchování)
  - Obsah souboru logu zachován při restartování aplikace (režim připojení)

### 🔍 Diagnostika systému
- **Modální okno kontroly zdraví systému**:
  - Zobrazení a validace informací o systému
  - Sledování využití paměti s varováními
  - Kontroly existence souborů
  - Kontroly dostupnosti modulů
  - Testy dostupnosti úložiště dat
  - Zobrazení progress baru a shrnutí
  - Plná lokalizace ve všech 13 podporovaných jazycích

### 🛠️ Technická vylepšení
- Protokolování zakázáno během továrního resetu, aby se zabránilo znečištění logu
- Vytvoření data.json odloženo až do výběru jazyka (čistší proces továrního resetu)
- Inicializace souboru logu odložena až do výběru jazyka
- Automatický restart aplikace po výběru jazyka
- Backend příkazy pro správu souborů záloh a logů
- Zpracování cest multiplatformových pro zálohy a logy
- Opravený výpočet paměti (kompatibilita s sysinfo 0.31)
- Opravena varování stylu React (konflikty zkratek CSS)

---

## v1.7.0 (2025) - 💾 Systém zálohování, obrazovka načítání a vylepšení knihovny filamentů

### 💾 Kompletní implementace systému zálohování
- **Automatický systém zálohování** - Jeden soubor zálohy denně (vytvořen pouze v nový den)
- **Hook připomenutí zálohy a komponenta UI** - Oznámení, pokud záloha neexistuje
- **UI historie záloh v Nastavení** - Barevně kódovaný seznam (zelený/žlutý/červený/šedý) pro stáří souboru zálohy a odpočet mazání
- **Modální okno autosave** - Vysvětlení, když je autosave povolen
- **Synchronizace autosave a automatického zálohování** - Automatická záloha při uložení autosave
- **Tovární reset s automatickým mazáním souborů záloh**
- **Historie záloh se automaticky aktualizuje**, když je autosave povolen

### 🔧 Optimalizace backendu systému zálohování
- **Přidány backend příkazy** pro mazání starých záloh (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funkce čištění frontendu aktualizovány pro použití backend příkazů**, eliminují chyby "forbidden path"
- **Všechny operace se soubory (vytvoření, mazání, výpis) nyní probíhají z backendu**, čímž se vyhnou problémům s oprávněními Tauri

### ⚡ Optimalizace výkonu systému zálohování
- `hasTodayBackup()` optimalizováno: používá backend příkaz `list_backup_files`, není třeba číst všechny soubory
- **Přidán mechanismus zámku** k prevenci paralelních záloh
- **Rychlejší operace** i při velkém počtu souborů záloh

### 📁 Otevření adresáře záloh a historie logů
- **Přidáno tlačítko** v sekci Nastavení → Historie záloh pro otevření složky záloh
- **Nová sekce historie logů** v Nastavení - výpis a otevření souborů logu
- **Automatické mazání souborů logu** konfigurovatelné podle dnů
- **Multiplatformní podpora** (macOS, Windows, Linux)

### 🎨 Komplexní přepracování obrazovky načítání
- **Logo aplikace integrováno** jako pozadí s efektem glassmorphism
- **Opravené rozvržení pro zaškrtnutí** - Automatické scrollování, pouze 3 moduly viditelné najednou
- **Efekt shimmer, animace pulzujících teček**
- **Kontejner scrollování** se skrytou posuvníkem

### ⚙️ Vylepšení procesu načítání
- **Zpomalené načítání** (zpoždění 800ms) - zprávy o načítání jsou čitelné
- **Zpracování chyb pro všechny moduly** (bloky try-catch)
- **Fyzický soubor logu** pro všechny stavy a chyby
- **Shrnutí načítání** na konci

### 🎨 Vícejazyčná podpora knihovny filamentů
- **Barvy filamentů zobrazeny** ve všech podporovaných jazycích (ne jen maďarština/němčina/angličtina)
- **Logika záložní**: Angličtina → Maďarština → Němčina → surová barva/název
- Aktualizovány komponenty Settings, GlobalSearch a Filaments

### 🔄 Vylepšení továrního resetu
- **Fyzické mazání souborů** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset instance Store** bez opětovného načtení
- **Zobrazení výběru jazyka** po továrním resetu

### 🎓 Aktualizace tutoriálu s novými funkcemi v1.7.0
- Nové kroky: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Rozšířená demo data: 6 filamentů → 11 filamentů, 3 nabídky → 5 nabídek
- Přidány překladové klíče pro všechny jazyky

---

## v1.6.0 (2025) - 📊 Interaktivní widgety & optimalizace výkonu velkých tabulek

### 🧠 Interaktivní grafy a podrobné modální zobrazení
- **Hlavní grafy nástěnky používají sjednocenou komponentu `InteractiveChart`** s klikatelnými datovými body a animovaným podrobným modálním zobrazením
- **Tooltip a podrobné zobrazení jsou lokalizovány**, zobrazují čitelné štítky (příjmy, náklady, čistý zisk, počet nabídek)
- **Časové období lze nastavit přímo z grafu trendu** (týdenní / měsíční / roční) pomocí štětce, nakrájená data proudí do Home → Dashboard

### 🧵 Virtuální scrollování pro velké seznamy
- **Vlastní virtuální scrollování** pro seznam nabídek a tabulku filamentů – renderovány jsou pouze viditelné řádky, zajišťuje plynulé scrollování i při 10k+ záznamech
- **Nastavení → Knihovna filamentů** používá stejný vzor, udržuje celou paletu 12,000+ barev responzivní
- **Pozice/výška posuvníku zůstává správná** díky prvkům mezery nad a pod viditelným rozsahem

### 📋 Pokročilé řazení a filtrování tabulek
- **Vícesloupcové řazení** na stránkách Filamentů a Nabídek (klik: vzestupné/sestupné, Shift+klik: vytvoř řetězec řazení – např. "Značka ↑, poté Cena/kg ↓")
- **Nastavení řazení uložena v `settings`**, takže preferované pořadí přetrvává po restartu
- **Filamenty**: filtry na úrovni sloupce pro značku, materiál/typ a hodnotu barvy/HEX
- **Nabídky**: filtr částky s hodnotami min/max a filtry rozsahu dat (od / do)

---

**Poslední aktualizace**: 1. prosince 2025


