# 📋 História verzií - 3DPrinterCalcApp

Tento dokument obsahuje podrobný changelog pre všetky verzie aplikácie 3D Printer Calculator.

---

## v3.0.0 (2025) - 🔒 Šifrovanie Dát Zákazníkov & Súlad s GDPR

### 🔒 Šifrovanie Dát Zákazníkov
- **Šifrovanie AES-256-GCM** - Šifrované ukladanie dát zákazníkov pomocou štandardného priemyselného algoritmu AES-256-GCM
- **Hashovanie hesiel PBKDF2** - Bezpečné ukladanie hesiel pomocou algoritmu PBKDF2 (100 000 iterácií, SHA-256)
- **Ukladanie v samostatnom súbore** - Šifrované dáta zákazníkov sú uložené v samostatnom súbore `customers.json`
- **Správa hesiel v pamäti** - Heslá sú ukladané len v pamäti a mazané pri zatvorení aplikácie
- **Integrácia hesla aplikácie** - Voliteľne: heslo ochrany aplikácie môže byť tiež použité na šifrovanie
- **Systém výzvy na zadanie hesla** - Inteligentná žiadosť o heslo (nezobrazuje sa na obrazovke načítania, po uvítacej správe)
- **Ochrana integrity dát** - Šifrované dáta chránené pred náhodným vymazaním

### ✅ Ochrana Dát v Súlade s GDPR/EÚ
- **Súlad**: Aplikácia spracúva dáta zákazníkov v súlade s GDPR (Všeobecné nariadenie o ochrane údajov) a predpismi EÚ o ochrane údajov
- **Štandardné priemyselné šifrovanie**: Použitie algoritmu AES-256-GCM (spĺňa odporúčania EÚ)
- **Bezpečná správa hesiel**: Hashovací algoritmus PBKDF2 (odporúčané NIST)
- **Minimálny zber dát**: Ukladá len nevyhnutné dáta zákazníkov požadované aplikáciou
- **Uchovanie dát**: Užívateľ má plnú kontrolu nad ukladaním a mazaním dát
- **Riadenie prístupu**: Prístup chránený heslom k dátam zákazníkov

### 🎨 Vylepšenia UI/UX
- **Modal aktivácie šifrovania** - Nové modálne dialógové okno pre aktiváciu šifrovania s možnosťou hesla aplikácie
- **Rozšírenie ConfirmDialog** - Podpora vlastného obsahu pre modálne komponenty
- **Časovanie výzvy na zadanie hesla** - Inteligentné zobrazenie (nie na obrazovke načítania)
- **Integrácia nastavení** - Nastavenia šifrovania na karte Zabezpečenie

### 🔧 Technické Vylepšenia
- **Modul šifrovania backend** - Šifrovanie implementované v Rust (`src-tauri/src/encryption.rs`)
- **Utility šifrovania frontend** - Pomocné funkcie TypeScript pre správu šifrovania
- **Správca hesiel** - Systém správy hesiel v pamäti
- **Integrácia úložiska** - Funkcie saveCustomers/loadCustomers s integráciou šifrovania

### 📚 Jazyková Podpora
- **13 jazykov aktualizovaných** - Nové šifrovacie prekladové kľúče vo všetkých jazykových súboroch
- **Nové kľúče**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Monitorovanie výkonu & Systém auditného záznamu

### 🌐 Lokalizácia Správ Konzoly
- **Úplná lokalizácia konzoly** - Všetky správy konzoly sa zobrazujú vo vybranom jazyku
- **Preklad operácií úložiska** - Správy o načítaní a ukladaní (tlačiarne, filamenty, nastavenia, ponuky, zákazníci, projekty, úlohy)
- **Preklad správ zálohy** - Denná kontrola zálohy, vytvorenie zálohy, správy o rotácii
- **Preklad správ rotácie protokolov** - Správy o rotácii protokolov a protokolov auditu s dynamickými časťami
- **Preklad metrík výkonu** - Metriky CPU a pamäte, pravidelné správy protokolu
- **Preklad systémových správ** - Inicializácia aplikácie, inicializácia protokolu frontendu, uvítacia správa
- **Preklad viacdielnych správ** - Preklad dátových častí správ konzoly (dátum, časová značka, súbor, informácie o stave)
- **Podpora 13 jazykov** - Všetky správy konzoly preložené do angličtiny, maďarčiny, nemčiny, španielčiny, taliančiny, poľštiny, portugalčiny, ruštiny, ukrajinčiny, češtiny, slovenčiny a čínštiny

### ⚡ Protokolovanie metrík výkonu
- **Trieda Performance Timer** - Manuálne meranie času operácií
- **Meranie času načítania** - Všetky časy načítania modulov zaznamenané (Settings, Printers, Filaments, Offers, Customers)
- **Meranie času operácie** - Automatické meranie času pre asynchrónne a synchrónne operácie
- **Sledovanie využitia pamäte** - Sledovanie a protokolovanie pamäte haldy JavaScript
- **Sledovanie využitia CPU** - Pravidelné meranie využitia CPU každých 5 minút
- **Súhrn výkonu** - Agregované štatistiky pre časy načítania a operácie
- **Štruktúrované správy logu** - Podrobné zobrazenie percenta CPU a hodnôt pamäte
- **Backend príkazy výkonu** - Backend príkaz `get_performance_metrics` pre dáta CPU a pamäte

### 🔐 Implementácia auditného záznamu
- **Infraštruktúra auditného záznamu** - Samostatný súbor auditného záznamu (`audit-YYYY-MM-DD.json`)
- **Protokolovanie kritických operácií**:
  - CRUD operácie (Vytvorenie/Aktualizácia/Vymazanie pre Filaments, Printers, Offers, Customers)
  - Zmeny nastavení (téma, jazyk, nastavenia logu, autosave, atď.)
  - Operácie zálohovania (vytvorenie, obnovenie)
  - Operácie továrenskeho resetu
  - Záznam chýb
- **Prehliadač auditného záznamu** - Virtuálne posúvanie pre veľké súbory, s filtrovaním, vyhľadávaním a možnosťami exportu
- **Automatické čistenie** - Staré súbory auditného záznamu automaticky mazané na základe konfigurovateľných dní uchovania
- **Backend príkazy** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Plná lokalizácia** - Všetkých 13 podporovaných jazykov

### 🎯 Vylepšenia UI/UX
- **História auditného záznamu** - Dvojstĺpcové rozloženie v sekcii Nastavenia → Správa logov
- **Zobrazenie metrík výkonu** - V modálnom okne diagnostiky systému
- **Aktualizácie v reálnom čase prehliadača logov** - Prepínač automatického obnovenia, detekcia zmien založená na hash
- **Vylepšenie automatického posúvania** - Povedomie o pozícii posúvania používateľa

### 🔧 Technické vylepšenia
- **Optimalizácia kontroly aktualizácií GitHub** - Pri spustení a každých 5 hodín (založené na localStorage)
- **Formát beta tagu** - Samostatný tag `beta-v2.0.0` pre beta verzie (neprepisuje hlavnú verziu)
- **Logika kontroly verzie** - Vyhľadávanie beta verzie založené na prefixe `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnostika systému & Vylepšenia výkonu

### 🔍 Diagnostika systému
- **Komplexný nástroj kontroly zdravia systému**:
  - Zobrazenie informácií o systéme (CPU, pamäť, OS, GPU, disk)
  - Validácia systému súborov (data.json, filamentLibrary.json, update_filament.json)
  - Kontroly dostupnosti modulov (Settings, Offers, Printers, Customers, Calculator, Home)
  - Kontroly dostupnosti úložiska dát
  - Progress bar s podrobnými správami o stave
  - Súhrn so stavmi chýb/varovaní/úspechu
  - Tlačidlo pre opakované spustenie
- **Presunuté do sekcie Správa logov** (logickejšie umiestnenie)
- **Plná lokalizácia** vo všetkých 13 podporovaných jazykoch

### ⚡ Výkon prehliadača logov
- **Virtuálne posúvanie pre veľké súbory logu**:
  - Vlastná implementácia virtuálneho posúvania pre komponentu LogViewer
  - Renderované sú len viditeľné položky logu, výrazne zlepšuje výkon
  - Plynulé posúvanie a vyhľadávanie aj s obrovskými súbormi logu (100k+ riadkov)
  - Udržiava presnú pozíciu a výšku posúvača
  - Výrazne rýchlejšie operácie vyhľadávania a filtrovania

### 🔔 Zjednotený systém oznámení
- **Centrálna služba oznámení**:
  - Jeden `notificationService` pre Toast aj platformové oznámenia
  - Smerovanie oznámení založené na priorite (vysoká priorita → platformové oznámenie)
  - Automatické rozhodovanie založené na stave aplikácie (popredie/pozadie)
  - Spätne kompatibilné s existujúcimi funkciami oznámení
  - Konfigurovateľné nastavenia oznámení (Toast zap/vyp, platformové oznámenie zap/vyp, úrovne priority)

### 🎯 Vylepšenia UI/UX
- Diagnostika systému presunuté zo sekcie Zálohy do sekcie Správa logov (logickejšie umiestnenie)
- Opravené chyby linteru TypeScript (nepoužívané premenné, nesúlad typov)
- Zlepšená kvalita kódu a udržateľnosť

---

## v1.8.0 (2025) - 📊 Pokročilý systém protokolovania & Vylepšenia továrenskeho resetu

### 🔄 Modálne okno priebehu továrenskeho resetu
- **Vizuálny indikátor priebehu pre továrenský reset**:
  - Animovaný priebeh v 4 krokoch (mazanie zálohy, mazanie logu, mazanie konfigurácie, dokončenie)
  - Aktualizácie stavu v reálnom čase so správami o úspechu/chybe
  - Odpočítavanie 10 sekúnd pred zobrazením výberu jazyka
  - Modálne okno nemožno zatvoriť počas procesu resetu
  - Plná lokalizácia vo všetkých 13 podporovaných jazykoch

### 📋 Komplexné prehodnotenie systému protokolovania
- **Profesionálna infraštruktúra protokolovania**:
  - Cesty k súborom logu multiplatformové (adresáre dát špecifické pre platformu)
  - Protokolovanie informácií o systéme (CPU, pamäť, OS, GPU, disk, verzia aplikácie)
  - Protokolovanie informácií o adresároch (priečinky logov a záloh, počet súborov, veľkosti)
  - Podrobné protokolovanie stavu načítania (úspech/varovanie/chyba/kritické)
  - Úrovne logu (DEBUG, INFO, WARN, ERROR) s filtrovaním
  - Podpora štruktúrovaného formátu logu (text a JSON)
  - Rotácia logu s automatickým čistením (konfigurovateľné dni uchovania)
  - Modálne okno prehliadača logov s filtrovaním, vyhľadávaním, zvýrazňovaním a exportom
  - Konfigurácia logu v Nastaveniach (formát, úroveň, dni uchovania)
  - Obsah súboru logu zachovaný pri reštartovaní aplikácie (režim pripojenia)

### 🔍 Diagnostika systému
- **Modálne okno kontroly zdravia systému**:
  - Zobrazenie a validácia informácií o systéme
  - Sledovanie využitia pamäte s varovaniami
  - Kontroly existencie súborov
  - Kontroly dostupnosti modulov
  - Testy dostupnosti úložiska dát
  - Zobrazenie progress baru a súhrnu
  - Plná lokalizácia vo všetkých 13 podporovaných jazykoch

### 🛠️ Technické vylepšenia
- Protokolovanie zakázané počas továrenskeho resetu, aby sa zabránilo znečisteniu logu
- Vytvorenie data.json odložené až do výberu jazyka (čistejší proces továrenskeho resetu)
- Inicializácia súboru logu odložená až do výberu jazyka
- Automatický reštart aplikácie po výbere jazyka
- Backend príkazy pre správu súborov záloh a logov
- Spracovanie ciest multiplatformových pre zálohy a logy
- Opravený výpočet pamäte (kompatibilita s sysinfo 0.31)
- Opravené varovania štýlu React (konflikty skratiek CSS)

---

## v1.7.0 (2025) - 💾 Systém zálohovania, obrazovka načítania a vylepšenia knižnice filamentov

### 💾 Kompletná implementácia systému zálohovania
- **Automatický systém zálohovania** - Jeden súbor zálohy denne (vytvorený len v nový deň)
- **Hook pripomienky zálohy a komponenta UI** - Oznámenie, ak záloha neexistuje
- **UI histórie záloh v Nastaveniach** - Farebne kódovaný zoznam (zelený/žltý/červený/sivý) pre vek súboru zálohy a odpočítavanie mazania
- **Modálne okno autosave** - Vysvetlenie, keď je autosave povolený
- **Synchronizácia autosave a automatického zálohovania** - Automatická záloha pri uložení autosave
- **Továrenský reset s automatickým mazaním súborov záloh**
- **História záloh sa automaticky aktualizuje**, keď je autosave povolený

### 🔧 Optimalizácia backendu systému zálohovania
- **Pridané backend príkazy** pre mazanie starých záloh (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funkcie čistenia frontendu aktualizované pre použitie backend príkazov**, eliminujú chyby "forbidden path"
- **Všetky operácie so súbormi (vytvorenie, mazanie, výpis) teraz prebiehajú z backendu**, čím sa vyhnú problémom s oprávneniami Tauri

### ⚡ Optimalizácia výkonu systému zálohovania
- `hasTodayBackup()` optimalizované: používa backend príkaz `list_backup_files`, nie je treba čítať všetky súbory
- **Pridaný mechanizmus zámku** na prevenciu paralelných záloh
- **Rýchlejšia operácia** aj pri veľkom počte súborov záloh

### 📁 Otvorenie adresára záloh a história logov
- **Pridané tlačidlo** v sekcii Nastavenia → História záloh pre otvorenie priečinka záloh
- **Nová sekcia histórie logov** v Nastaveniach - výpis a otvorenie súborov logu
- **Automatické mazanie súborov logu** konfigurovateľné podľa dní
- **Multiplatformová podpora** (macOS, Windows, Linux)

### 🎨 Komplexné prepracovanie obrazovky načítania
- **Logo aplikácie integrované** ako pozadie s efektom glassmorphism
- **Opravené rozloženie pre začiarknutia** - Automatické posúvanie, len 3 moduly viditeľné naraz
- **Efekt shimmer, animácie pulzujúcich bodiek**
- **Kontajner posúvania** so skrytým posúvačom

### ⚙️ Vylepšenia procesu načítania
- **Spomalené načítanie** (oneskorenia 800ms) - správy o načítaní sú čitateľné
- **Spracovanie chýb pre všetky moduly** (bloky try-catch)
- **Fyzický súbor logu** pre všetky stavy a chyby
- **Súhrn načítania** na konci

### 🎨 Viacjazyčná podpora knižnice filamentov
- **Farby filamentov zobrazené** vo všetkých podporovaných jazykoch (nie len maďarčina/nemčina/angličtina)
- **Logika záložná**: Angličtina → Maďarčina → Nemčina → surová farba/názov
- Aktualizované komponenty Settings, GlobalSearch a Filaments

### 🔄 Vylepšenia továrenskeho resetu
- **Fyzické mazanie súborov** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset inštancie Store** bez opätovného načítania
- **Zobrazenie výberu jazyka** po továrenskom resetu

### 🎓 Aktualizácia tutoriálu s novými funkciami v1.7.0
- Nové kroky: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Rozšírené demo dáta: 6 filamentov → 11 filamentov, 3 ponuky → 5 ponúk
- Pridané prekladové kľúče pre všetky jazyky

---

## v1.6.0 (2025) - 📊 Interaktívne widgety & optimalizácia výkonu veľkých tabuliek

### 🧠 Interaktívne grafy a podrobné modálne zobrazenia
- **Hlavné grafy nástienky používajú zjednotenú komponentu `InteractiveChart`** s klikateľnými dátovými bodmi a animovaným podrobným modálnym zobrazením
- **Tooltip a podrobné zobrazenie sú lokalizované**, zobrazujú čitateľné štítky (príjmy, náklady, čistý zisk, počet ponúk)
- **Časové obdobie možno nastaviť priamo z grafu trendu** (týždenné / mesačné / ročné) pomocou štetca, nakrájané dáta prúdia do Home → Dashboard

### 🧵 Virtuálne posúvanie pre veľké zoznamy
- **Vlastné virtuálne posúvanie** pre zoznam ponúk a tabuľku filamentov – renderované sú len viditeľné riadky, zabezpečuje plynulé posúvanie aj pri 10k+ záznamoch
- **Nastavenia → Knižnica filamentov** používa rovnaký vzor, udržiava celú paletu 12,000+ farieb responzívnu
- **Pozícia/výška posúvača zostáva správna** vďaka prvkom medzery nad a pod viditeľným rozsahom

### 📋 Pokročilé triedenie a filtrovanie tabuliek
- **Viacstĺpcové triedenie** na stránkach Filamentov a Ponúk (klik: vzostupné/zostupné, Shift+klik: vytvor reťazec triedenia – napr. "Značka ↑, potom Cena/kg ↓")
- **Nastavenia triedenia uložené v `settings`**, takže preferované poradie pretrváva po reštarte
- **Filamenty**: filtre na úrovni stĺpca pre značku, materiál/typ a hodnotu farby/HEX
- **Ponuky**: filter sumy s hodnotami min/max a filtre rozsahu dátumov (od / do)

---

**Posledná aktualizácia**: 1. decembra 2025


