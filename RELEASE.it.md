# 📋 Note di Rilascio - 3DPrinterCalcApp

Questo documento contiene il changelog dettagliato per tutte le versioni dell'app 3D Printer Calculator.

---

## v3.0.3 (2025) - 🔧 Hotfix: Correzioni Crittografia Dati Cliente e Miglioramenti UI

### 🐛 Correzioni di Bug

#### Correzioni Crittografia Dati Cliente
- **Azioni offerta disabilitate per dati crittografati** - Se i dati del cliente sono crittografati e non viene fornita una password, la modifica, duplicazione e cambio di stato delle offerte sono ora disabilitate
- **Problema chiave duplicata risolto** - Nessun errore "Encountered two children with the same key" nella lista offerte e storico stato
- **Correzione contatore offerte** - Il contatore offerte cliente ora conta anche per `customerId`, non solo per nome, funzionando correttamente con dati crittografati
- **Aggiornamento offerte dopo inserimento password** - Quando viene fornita la password e i clienti vengono decrittati, i nomi dei clienti nelle offerte vengono ripristinati invece di "DATI CRITTOGRAFATI"
- **Lista storico stato** - La lista storico stato ora mostra solo l'ID cliente, non il nome del cliente, anche dopo l'inserimento della password (conforme ai requisiti di crittografia)

#### Miglioramenti Messaggi Toast
- **Prevenzione messaggi toast duplicati** - I messaggi toast ora appaiono solo una volta, anche se chiamati più volte
- **Toast si chiude al click del pulsante** - Cliccando sul pulsante "Inserisci password" nel messaggio toast, il toast si chiude automaticamente
- **Ridisegno messaggio toast** - I messaggi toast ora hanno un aspetto più pulito e professionale con layout a colonne per i pulsanti di azione

#### Chiavi di Traduzione Aggiunte
- **Nuove chiavi di traduzione** - Aggiunte a tutte le 13 lingue:
  - `encryption.passwordRequired` - "Password di crittografia richiesta"
  - `encryption.passwordRequiredForOfferEdit` - "Password di crittografia richiesta per modificare l'offerta"
  - `encryption.passwordRequiredForOfferDuplicate` - "Password di crittografia richiesta per duplicare l'offerta"
  - `encryption.passwordRequiredForOfferStatusChange` - "Password di crittografia richiesta per modificare lo stato dell'offerta"
  - `encryption.passwordRequiredForCustomerCreate` - "Password di crittografia richiesta per creare un nuovo cliente"
  - `encryption.passwordRequiredForCustomerEdit` - "Password di crittografia richiesta per modificare"
  - `encryption.encryptedData` - "DATI CRITTOGRAFATI"
  - `customers.id` - "ID Cliente"
  - `customers.encryptedDataMessage` - "🔒 Dati crittografati - password richiesta per visualizzare"

### 📝 Dettagli Tecnici

- **Versione aggiornata**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.3`
- **Stringhe hardcoded sostituite**: Tutte le stringhe hardcoded in ungherese sostituite con chiavi di traduzione
- **Tipi TypeScript aggiornati**: Nuove chiavi di traduzione aggiunte al tipo `TranslationKey`
- **Toast Provider modificato**: Controllo toast duplicati e chiusura automatica aggiunti
- **Logica aggiornamento offerte**: Aggiornamento automatico offerte dopo decrittazione clienti quando viene fornita password

---

## v3.0.2 (2025) - 🔧 Hotfix: Correzioni Tutorial, Permessi, Registrazione Factory Reset

### 🐛 Correzioni di Bug

#### Correzioni Tutorial
- **Preservazione dati tutorial** - Se il tutorial è già stato eseguito una volta, i dati esistenti non vengono eliminati nuovamente
- **Tutorial espanso a 18 passaggi** - Aggiunti: Progetti, Attività, Calendario, passaggi Backup/Ripristino
- **Chiavi di traduzione tutorial** - Chiavi di traduzione mancanti aggiunte a tutti i file di lingua

#### Correzioni Permessi
- **Permessi customers.json** - Permessi aggiunti per l'eliminazione del file `customers.json`

#### Registrazione Factory Reset
- **Scrittura file di log backend** - I passaggi di Factory Reset sono ora registrati nel file di log backend
- **Registrazione dettagliata** - Ogni passaggio di Factory Reset è registrato in dettaglio
- **Eliminazione log backend ripristinata** - Il file di log backend viene ora eliminato durante il Factory Reset

### 📝 Dettagli Tecnici

- **Versione aggiornata**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Traduzioni, Beta Build Workflow

### 🐛 Correzioni di Bug

#### Correzione Factory Reset
- **Factory reset corretto** - Il file `customers.json` viene ora eliminato esplicitamente durante il factory reset
- **Eliminazione completa dei dati cliente** - Il file dei dati cliente crittografati (`customers.json`) viene anche eliminato, assicurando la cancellazione completa dei dati

#### Chiavi di Traduzione Mancanti
- **Chiave `encryption.noAppPassword` aggiunta** - Chiave di traduzione mancante aggiunta a tutte le 14 lingue
- **Traduzioni dei messaggi di backup** - Traduzioni per il messaggio "Nessun file di backup automatico ancora" aggiunte
- **Traduzioni della gestione dei log** - Traduzioni per i testi di gestione Log e Audit Log aggiunte:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Traduzioni del calendario** - Traduzioni per i nomi dei mesi e dei giorni aggiunte:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Descrizione del menu di aiuto** - Traduzioni per la descrizione "Show Help menu item in Sidebar" aggiunte

#### Correzione del Workflow Beta Build
- **Checkout esplicito del branch beta** - Il workflow ora usa esplicitamente il commit più recente del branch `beta`
- **Correzione del commit del tag** - Il tag `beta-v3.0.1` ora punta al commit corretto (non al vecchio commit)
- **Correzione della data del codice sorgente** - La data "Source code" ora mostra il tempo di compilazione, non la data del vecchio commit
- **Passaggi di verifica aggiunti** - Verifica Git pull e commit SHA aggiunta al workflow

### 📝 Dettagli Tecnici

- **Versione aggiornata**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Chiavi duplicate rimosse**: Duplicazioni di `settings.logs.openFolder` rimosse da tutti i file di lingua
- **Tipi TypeScript aggiornati**: `encryption.noAppPassword` aggiunto al tipo `TranslationKey`

---

## v3.0.0 (2025) - 🔒 Crittografia Dati Clienti & Conformità GDPR + ⚡ Ottimizzazione delle Prestazioni

### ⚡ Ottimizzazione delle Prestazioni e Code Splitting

#### Documentazione e Ottimizzazione di React.lazy()
- **Documentazione implementazione React.lazy()** - Documentazione completa creata (`docs/PERFORMANCE.md`)
- **Ottimizzazione fase di caricamento** - Solo i dati vengono caricati durante la fase di caricamento, componenti su richiesta
- **Ottimizzazione fallback Suspense** - Componenti fallback ottimizzati in AppRouter.tsx
- **Error boundary aggiunto** - Componente LazyErrorBoundary.tsx per componenti lazy caricati

#### Code Splitting Basato su Route
- **Integrazione React Router** - React Router v7.10.0 installato e configurato
- **Navigazione basata su URL** - Struttura delle route implementata (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy loading per route** - Ogni route automaticamente divisa in file separati
- **Conversione State-based → Routing** - Stato `activePage` convertito in routing basato su URL
- **Pagine aggiungibili ai preferiti** - Tutte le pagine accessibili tramite URL diretto
- **Supporto navigazione browser** - Pulsanti indietro/avanti funzionano, migliore UX

#### Ottimizzazione Fine del Code Splitting
- **Ottimizzazione configurazione build Vite** - `rollupOptions.output.manualChunks` configurato
- **Ottimizzazione chunk vendor**:
  - React/React-DOM/React-Router chunk separato (`vendor-react`)
  - API Tauri chunk separato (`vendor-tauri`)
  - Librerie UI chunk separati (`vendor-ui-framer`, `vendor-ui-charts`)
  - Altri node_modules (`vendor`)
- **Chunking basato su route** - Lazy loading automatico crea chunk separati per route
- **Raggruppamento file router** - Organizzati in chunk `router`, `routes`
- **Raggruppamento componenti condivisi** - Chunk `components-shared`
- **Limite avviso dimensione chunk** - Impostato a 1000 KB

#### Architettura Modulare
- **Documentazione architettura modulare** - Documentazione completa (`docs/MODULAR_ARCHITECTURE.md`)
- **Alias di percorso** - Alias `@features`, `@shared`, `@core` configurati
- **Configurazione Vite e TypeScript** - Aggiornata con supporto alias di percorso
- **Implementazione moduli condivisi**:
  - Componenti condivisi (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Hooks condivisi (useModal, useForm)
  - Utilità condivise (debounce, format, validation)
- **Refactoring moduli funzionalità** - Refactoring completo di 6 moduli:
  - Calculator: 582 righe → 309 righe (-46.9%)
  - Settings: 5947 righe → 897 righe (-85%!)
  - Offers: 3985 righe → 3729 righe (-6.4%)
  - Home: 3454 righe → 3308 righe (-4.2%)
  - Moduli Filaments e Printers anch'essi refactorizzati

### 🔒 Crittografia Dati Clienti
- **Crittografia AES-256-GCM** - Archiviazione crittografata dei dati dei clienti utilizzando l'algoritmo standard del settore AES-256-GCM
- **Hashing password PBKDF2** - Archiviazione sicura delle password utilizzando l'algoritmo PBKDF2 (100.000 iterazioni, SHA-256)
- **Archiviazione in file separato** - I dati crittografati dei clienti sono archiviati in un file separato `customers.json`
- **Gestione password in memoria** - Le password vengono archiviate solo in memoria e eliminate alla chiusura dell'applicazione
- **Integrazione password app** - Opzionale: la password di protezione dell'app può essere utilizzata anche per la crittografia
- **Sistema prompt password** - Richiesta intelligente della password (non appare nella schermata di caricamento, dopo il messaggio di benvenuto)
- **Protezione integrità dati** - Dati crittografati protetti contro eliminazione accidentale

### ✅ Protezione Dati Conforme a GDPR/UE
- **Conformità**: L'applicazione gestisce i dati dei clienti in conformità con il GDPR (Regolamento Generale sulla Protezione dei Dati) e le normative di protezione dei dati dell'UE
- **Crittografia standard del settore**: Utilizzo dell'algoritmo AES-256-GCM (soddisfa le raccomandazioni dell'UE)
- **Gestione sicura delle password**: Algoritmo di hash PBKDF2 (raccomandato da NIST)
- **Raccolta dati minima**: Archivia solo i dati dei clienti necessari per l'applicazione
- **Conservazione dati**: L'utente ha il controllo completo sull'archiviazione e l'eliminazione dei dati
- **Controllo accesso**: Accesso protetto da password ai dati dei clienti

### 🎨 Miglioramenti UI/UX
- **Modal attivazione crittografia** - Nuova finestra di dialogo modale per attivare la crittografia con opzione password app
- **Estensione ConfirmDialog** - Supporto contenuto personalizzato per componenti modali
- **Timing prompt password** - Visualizzazione intelligente (non nella schermata di caricamento)
- **Integrazione impostazioni** - Impostazioni di crittografia nella scheda Sicurezza

### 🔧 Miglioramenti Tecnici
- **Modulo crittografia backend** - Crittografia implementata in Rust (`src-tauri/src/encryption.rs`)
- **Utilità crittografia frontend** - Funzioni di utilità TypeScript per la gestione della crittografia
- **Gestore password** - Sistema di gestione password in memoria
- **Integrazione store** - Funzioni saveCustomers/loadCustomers con integrazione crittografia

### 📚 Supporto Lingue
- **13 lingue aggiornate** - Nuove chiavi di traduzione crittografia in tutti i file linguistici
- **Nuove chiavi**: `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Monitoraggio delle Prestazioni & Sistema di Audit Log

### 🌐 Localizzazione dei Messaggi della Console
- **Localizzazione completa della console** - Tutti i messaggi della console vengono visualizzati nella lingua selezionata
- **Traduzione delle operazioni di archiviazione** - Messaggi di caricamento e salvataggio (stampanti, filamenti, impostazioni, offerte, clienti, progetti, attività)
- **Traduzione dei messaggi di backup** - Controllo giornaliero del backup, creazione del backup, messaggi di rotazione
- **Traduzione dei messaggi di rotazione dei log** - Messaggi di rotazione dei log e dei log di audit con parti dinamiche
- **Traduzione delle metriche di performance** - Metriche CPU e memoria, messaggi di registrazione regolari
- **Traduzione dei messaggi di sistema** - Inizializzazione dell'applicazione, inizializzazione del log frontend, messaggio di benvenuto
- **Traduzione dei messaggi multi-parte** - Traduzione delle parti dati dei messaggi della console (data, timestamp, file, informazioni di stato)
- **Supporto per 13 lingue** - Tutti i messaggi della console tradotti in inglese, ungherese, tedesco, spagnolo, italiano, polacco, portoghese, russo, ucraino, ceco, slovacco e cinese

### ⚡ Registrazione delle Metriche di Prestazione
- **Classe Performance Timer** - Temporizzazione manuale per le operazioni
- **Misurazione del tempo di caricamento** - Tutti i tempi di caricamento dei moduli registrati (Settings, Printers, Filaments, Offers, Customers)
- **Misurazione del tempo di operazione** - Temporizzazione automatica per operazioni asincrone e sincrone
- **Monitoraggio dell'uso della memoria** - Tracciamento e registrazione della memoria heap JavaScript
- **Monitoraggio dell'uso della CPU** - Misurazione regolare dell'uso della CPU ogni 5 minuti
- **Riepilogo delle prestazioni** - Statistiche aggregate per tempi di caricamento e operazione
- **Messaggi di log strutturati** - Visualizzazione dettagliata della percentuale CPU e valori di memoria
- **Comandi di prestazione del backend** - Comando backend `get_performance_metrics` per dati CPU e memoria

### 🔐 Implementazione Audit Log
- **Infrastruttura audit log** - File audit log separato (`audit-YYYY-MM-DD.json`)
- **Registrazione operazioni critiche**:
  - Operazioni CRUD (Crea/Aggiorna/Elimina per Filaments, Printers, Offers, Customers)
  - Modifiche alle impostazioni (tema, lingua, impostazioni log, autosave, ecc.)
  - Operazioni di backup (crea, ripristina)
  - Operazioni di Reset di Fabbrica
  - Registrazione errori
- **Visualizzatore Audit Log** - Scorrimento virtuale per file grandi, con filtri, ricerca e capacità di esportazione
- **Pulizia automatica** - File audit log vecchi eliminati automaticamente in base a giorni di conservazione configurabili
- **Comandi backend** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Localizzazione completa** - Tutte le 13 lingue supportate

### 🎯 Miglioramenti UI/UX
- **Cronologia Audit Log** - Layout a due colonne nella sezione Impostazioni → Gestione Log
- **Visualizzazione metriche prestazioni** - Nel modale Diagnostica Sistema
- **Aggiornamenti in tempo reale del Visualizzatore Log** - Toggle auto-aggiornamento, rilevamento modifiche basato su hash
- **Raffinamento auto-scorrimento** - Consapevolezza della posizione di scorrimento dell'utente

### 🔧 Miglioramenti Tecnici
- **Ottimizzazione controllo aggiornamenti GitHub** - All'avvio e ogni 5 ore (basato su localStorage)
- **Formato tag beta** - Tag separato `beta-v2.0.0` per rilasci beta (non sovrascrive il rilascio principale)
- **Logica controllo versione** - Ricerca versione beta basata su prefisso `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnostica Sistema & Miglioramenti Prestazioni

### 🔍 Diagnostica Sistema
- **Strumento completo di controllo stato sistema**:
  - Visualizzazione informazioni sistema (CPU, memoria, OS, GPU, disco)
  - Validazione file system (data.json, filamentLibrary.json, update_filament.json)
  - Controlli disponibilità moduli (Settings, Offers, Printers, Customers, Calculator, Home)
  - Controlli disponibilità archiviazione dati
  - Barra di avanzamento con messaggi di stato dettagliati
  - Riepilogo con stati errore/avviso/successo
  - Pulsante ri-esecuzione
- **Spostato nella sezione Gestione Log** (posizionamento più logico)
- **Localizzazione completa** in tutte le 13 lingue supportate

### ⚡ Prestazioni Visualizzatore Log
- **Scorrimento virtuale per file log grandi**:
  - Implementazione scorrimento virtuale personalizzata per componente LogViewer
  - Solo voci log visibili vengono renderizzate, migliorando significativamente le prestazioni
  - Scorrimento e ricerca fluidi anche con file log enormi (100k+ righe)
  - Mantiene posizione e altezza precisa della scrollbar
  - Operazioni di ricerca e filtro significativamente più veloci

### 🔔 Sistema Notifiche Unificato
- **Servizio notifiche centralizzato**:
  - Unico `notificationService` per notifiche Toast e piattaforma
  - Instradamento notifiche basato su priorità (priorità alta → notifica piattaforma)
  - Decisione automatica basata su stato app (primo piano/sfondo)
  - Compatibile con funzioni notifiche esistenti
  - Impostazioni notifiche configurabili (Toast on/off, notifica piattaforma on/off, livelli priorità)

### 🎯 Miglioramenti UI/UX
- Diagnostica Sistema spostata dalla sezione Backup alla sezione Gestione Log (posizionamento più logico)
- Errori linter TypeScript corretti (variabili non utilizzate, discrepanze tipo)
- Qualità codice e manutenibilità migliorate

---

## v1.8.0 (2025) - 📊 Sistema Logging Avanzato & Miglioramenti Reset di Fabbrica

### 🔄 Modale Progresso Reset di Fabbrica
- **Indicatore progresso visivo per reset di fabbrica**:
  - Progresso animato a 4 fasi (eliminazione backup, eliminazione log, eliminazione config, completamento)
  - Aggiornamenti stato in tempo reale con messaggi successo/errore
  - Countdown 10 secondi prima della visualizzazione selettore lingua
  - Modale non può essere chiuso durante processo reset
  - Localizzazione completa in tutte le 13 lingue supportate

### 📋 Revisione Completa Sistema Logging
- **Infrastruttura logging professionale**:
  - Percorsi file log multipiattaforma (directory dati specifiche piattaforma)
  - Registrazione informazioni sistema (CPU, memoria, OS, GPU, disco, versione app)
  - Registrazione informazioni directory (cartelle log e backup, numero file, dimensioni)
  - Registrazione stato caricamento dettagliata (successo/avviso/errore/critico)
  - Livelli log (DEBUG, INFO, WARN, ERROR) con filtro
  - Supporto formato log strutturato (testo e JSON)
  - Rotazione log con pulizia automatica (giorni conservazione configurabili)
  - Modale Visualizzatore Log con filtro, ricerca, evidenziazione ed esportazione
  - Configurazione log nelle Impostazioni (formato, livello, giorni conservazione)
  - Contenuto file log preservato al riavvio app (modalità append)

### 🔍 Diagnostica Sistema
- **Modale controllo stato sistema**:
  - Visualizzazione e validazione informazioni sistema
  - Monitoraggio uso memoria con avvisi
  - Controlli esistenza file
  - Controlli disponibilità moduli
  - Test disponibilità archiviazione dati
  - Visualizzazione barra avanzamento e riepilogo
  - Localizzazione completa in tutte le 13 lingue supportate

### 🛠️ Miglioramenti Tecnici
- Logging disabilitato durante Reset di Fabbrica per evitare inquinamento log
- Creazione data.json ritardata fino alla selezione lingua (processo Reset di Fabbrica più pulito)
- Inizializzazione file log ritardata fino alla selezione lingua
- Riavvio automatico app dopo selezione lingua
- Comandi backend per gestione file backup e log
- Gestione percorsi multipiattaforma per backup e log
- Calcolo memoria corretto (compatibilità sysinfo 0.31)
- Avvisi stile React corretti (conflitti abbreviazione CSS)

---

## v1.7.0 (2025) - 💾 Sistema backup, schermata caricamento e miglioramenti biblioteca filamenti

### 💾 Implementazione Completa Sistema Backup
- **Sistema backup automatico** - Un file backup al giorno (creato solo in nuovo giorno)
- **Hook promemoria backup e componente UI** - Notifica se non esiste backup
- **UI Cronologia Backup nelle Impostazioni** - Lista codificata colori (verde/giallo/rosso/grigio) per età file backup e countdown eliminazione
- **Finestra modale autosave** - Spiegazione quando autosave è abilitato
- **Sincronizzazione autosave e backup automatico** - Backup automatico al salvataggio autosave
- **Reset di Fabbrica con eliminazione automatica file backup**
- **Cronologia backup si aggiorna automaticamente** quando autosave è abilitato

### 🔧 Ottimizzazione Backend Sistema Backup
- **Comandi backend aggiunti** per eliminare backup vecchi (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funzioni pulizia frontend aggiornate per usare comandi backend**, eliminando errori "forbidden path"
- **Tutte le operazioni file (crea, elimina, elenca) ora avvengono dal backend**, evitando problemi permessi Tauri

### ⚡ Ottimizzazione Prestazioni Sistema Backup
- `hasTodayBackup()` ottimizzato: usa comando backend `list_backup_files`, non è necessario leggere tutti i file
- **Meccanismo lock aggiunto** per prevenire backup paralleli
- **Operazione più veloce** anche con grande numero file backup

### 📁 Apertura Directory Backup e Cronologia Log
- **Pulsante aggiunto** nella sezione Impostazioni → Cronologia Backup per aprire cartella backup
- **Nuova sezione cronologia log** nelle Impostazioni - elenca e apri file log
- **Eliminazione automatica file log** configurabile per giorni
- **Supporto multipiattaforma** (macOS, Windows, Linux)

### 🎨 Revisione Completa Schermata Caricamento
- **Logo app integrato** come sfondo con effetto glassmorphism
- **Layout fisso per segni di spunta** - Scorrimento automatico, solo 3 moduli visibili alla volta
- **Effetto shimmer, animazioni punti pulsanti**
- **Contenitore scorrimento** con scrollbar nascosta

### ⚙️ Miglioramenti Processo Caricamento
- **Caricamento rallentato** (ritardi 800ms) - messaggi caricamento sono leggibili
- **Gestione errori per tutti i moduli** (blocchi try-catch)
- **File log fisico** per tutti gli stati e errori
- **Riepilogo caricamento** alla fine

### 🎨 Supporto Multilingue Biblioteca Filamenti
- **Colori filamenti visualizzati** in tutte le lingue supportate (non solo Ungherese/Tedesco/Inglese)
- **Logica fallback**: Inglese → Ungherese → Tedesco → colore/nome raw
- Componenti Settings, GlobalSearch e Filaments aggiornati

### 🔄 Miglioramenti Reset di Fabbrica
- **Eliminazione fisica file** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset istanza Store** senza ricaricamento
- **Visualizzazione selettore lingua** dopo Reset di Fabbrica

### 🎓 Aggiornamento Tutorial con Nuove Funzionalità v1.7.0
- Nuovi passi: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Dati demo espansi: 6 filamenti → 11 filamenti, 3 offerte → 5 offerte
- Chiavi traduzione aggiunte per tutte le lingue

---

## v1.6.0 (2025) - 📊 Widget interattivi & ottimizzazione prestazioni tabelle grandi

### 🧠 Grafici Interattivi e Viste Modali Dettagliate
- **Grafici dashboard principale usano componente unificato `InteractiveChart`** con punti dati cliccabili e vista modale dettagliata animata
- **Tooltip e vista dettagliata sono localizzati**, mostrando etichette leggibili (ricavi, costi, profitto netto, conteggio offerte)
- **Periodo tempo può essere impostato direttamente da grafico tendenze** (settimanale / mensile / annuale) usando brush, dati affettati fluiscono a Home → Dashboard

### 🧵 Scorrimento Virtuale per Liste Grandi
- **Scorrimento virtuale personalizzato** per lista Offerte e tabella Filamenti – solo righe visibili vengono renderizzate, assicurando scorrimento fluido anche con 10k+ record
- **Impostazioni → Biblioteca Filamenti** usa lo stesso pattern, mantenendo palette completa 12,000+ colori reattiva
- **Posizione/altezza scrollbar rimane corretta** grazie a elementi spaziatore sopra e sotto intervallo visibile

### 📋 Ordinamento e Filtraggio Avanzato Tabelle
- **Ordinamento multi-colonna** su pagine Filamenti e Offerte (clic: ascendente/discendente, Maiusc+clic: costruisci catena ordinamento – es. "Marca ↑, poi Prezzo/kg ↓")
- **Impostazioni ordinamento salvate in `settings`**, così ordine preferito persiste dopo riavvio
- **Filamenti**: filtri livello colonna per marca, materiale/tipo e valore colore/HEX
- **Offerte**: filtro importo con valori min/max e filtri intervallo date (da / a)

---

**Ultimo aggiornamento**: 1 dicembre 2025



- **Sistema backup automatico** - Un file backup al giorno (creato solo in nuovo giorno)
- **Hook promemoria backup e componente UI** - Notifica se non esiste backup
- **UI Cronologia Backup nelle Impostazioni** - Lista codificata colori (verde/giallo/rosso/grigio) per età file backup e countdown eliminazione
- **Finestra modale autosave** - Spiegazione quando autosave è abilitato
- **Sincronizzazione autosave e backup automatico** - Backup automatico al salvataggio autosave
- **Reset di Fabbrica con eliminazione automatica file backup**
- **Cronologia backup si aggiorna automaticamente** quando autosave è abilitato

### 🔧 Ottimizzazione Backend Sistema Backup
- **Comandi backend aggiunti** per eliminare backup vecchi (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Funzioni pulizia frontend aggiornate per usare comandi backend**, eliminando errori "forbidden path"
- **Tutte le operazioni file (crea, elimina, elenca) ora avvengono dal backend**, evitando problemi permessi Tauri

### ⚡ Ottimizzazione Prestazioni Sistema Backup
- `hasTodayBackup()` ottimizzato: usa comando backend `list_backup_files`, non è necessario leggere tutti i file
- **Meccanismo lock aggiunto** per prevenire backup paralleli
- **Operazione più veloce** anche con grande numero file backup

### 📁 Apertura Directory Backup e Cronologia Log
- **Pulsante aggiunto** nella sezione Impostazioni → Cronologia Backup per aprire cartella backup
- **Nuova sezione cronologia log** nelle Impostazioni - elenca e apri file log
- **Eliminazione automatica file log** configurabile per giorni
- **Supporto multipiattaforma** (macOS, Windows, Linux)

### 🎨 Revisione Completa Schermata Caricamento
- **Logo app integrato** come sfondo con effetto glassmorphism
- **Layout fisso per segni di spunta** - Scorrimento automatico, solo 3 moduli visibili alla volta
- **Effetto shimmer, animazioni punti pulsanti**
- **Contenitore scorrimento** con scrollbar nascosta

### ⚙️ Miglioramenti Processo Caricamento
- **Caricamento rallentato** (ritardi 800ms) - messaggi caricamento sono leggibili
- **Gestione errori per tutti i moduli** (blocchi try-catch)
- **File log fisico** per tutti gli stati e errori
- **Riepilogo caricamento** alla fine

### 🎨 Supporto Multilingue Biblioteca Filamenti
- **Colori filamenti visualizzati** in tutte le lingue supportate (non solo Ungherese/Tedesco/Inglese)
- **Logica fallback**: Inglese → Ungherese → Tedesco → colore/nome raw
- Componenti Settings, GlobalSearch e Filaments aggiornati

### 🔄 Miglioramenti Reset di Fabbrica
- **Eliminazione fisica file** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Reset istanza Store** senza ricaricamento
- **Visualizzazione selettore lingua** dopo Reset di Fabbrica

### 🎓 Aggiornamento Tutorial con Nuove Funzionalità v1.7.0
- Nuovi passi: widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Dati demo espansi: 6 filamenti → 11 filamenti, 3 offerte → 5 offerte
- Chiavi traduzione aggiunte per tutte le lingue

---

## v1.6.0 (2025) - 📊 Widget interattivi & ottimizzazione prestazioni tabelle grandi

### 🧠 Grafici Interattivi e Viste Modali Dettagliate
- **Grafici dashboard principale usano componente unificato `InteractiveChart`** con punti dati cliccabili e vista modale dettagliata animata
- **Tooltip e vista dettagliata sono localizzati**, mostrando etichette leggibili (ricavi, costi, profitto netto, conteggio offerte)
- **Periodo tempo può essere impostato direttamente da grafico tendenze** (settimanale / mensile / annuale) usando brush, dati affettati fluiscono a Home → Dashboard

### 🧵 Scorrimento Virtuale per Liste Grandi
- **Scorrimento virtuale personalizzato** per lista Offerte e tabella Filamenti – solo righe visibili vengono renderizzate, assicurando scorrimento fluido anche con 10k+ record
- **Impostazioni → Biblioteca Filamenti** usa lo stesso pattern, mantenendo palette completa 12,000+ colori reattiva
- **Posizione/altezza scrollbar rimane corretta** grazie a elementi spaziatore sopra e sotto intervallo visibile

### 📋 Ordinamento e Filtraggio Avanzato Tabelle
- **Ordinamento multi-colonna** su pagine Filamenti e Offerte (clic: ascendente/discendente, Maiusc+clic: costruisci catena ordinamento – es. "Marca ↑, poi Prezzo/kg ↓")
- **Impostazioni ordinamento salvate in `settings`**, così ordine preferito persiste dopo riavvio
- **Filamenti**: filtri livello colonna per marca, materiale/tipo e valore colore/HEX
- **Offerte**: filtro importo con valori min/max e filtri intervallo date (da / a)

---

**Ultimo aggiornamento**: 1 dicembre 2025


