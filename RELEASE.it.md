# 📋 Note di Rilascio - 3DPrinterCalcApp

Questo documento contiene il changelog dettagliato per tutte le versioni dell'app 3D Printer Calculator.

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


