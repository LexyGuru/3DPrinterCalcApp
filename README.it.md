# 🖨️ 3D Printer Calculator App

> **🌍 Selezione lingua**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

Un'applicazione desktop moderna per calcolare i costi di stampa 3D. Realizzata con Tauri v2, frontend React e backend Rust.

## ✨ Funzionalità

- 📊 **Calcolo costi** - Calcolo automatico dei costi di filamento, elettricità, essiccazione e usura
- 🧵 **Gestione filamenti** - Aggiungi, modifica, elimina filamenti (marca, tipo, colore, prezzo)
- 🖨️ **Gestione stampanti** - Gestisci stampanti e sistemi AMS
- 💰 **Calcolo profitto** - Percentuale di profitto selezionabile (10%, 20%, 30%, 40%, 50%)
- 📄 **Preventivi** - Salva, gestisci ed esporta preventivi PDF (nome cliente, contatto, descrizione)
- 🧠 **Preset filtri** - Salva filtri preventivi, applica preset rapidi, filtri automatici basati su data/ora
- 🗂️ **Dashboard stato** - Carte di stato, filtri rapidi e timeline delle modifiche di stato recenti
- 📝 **Note di stato** - Ogni modifica di stato con note opzionali e registrazione cronologia
- 👁️ **Anteprima PDF e modelli** - Anteprima PDF integrata, modelli selezionabili e blocchi di branding aziendale
- 🎨 **Libreria colori filamento** - Oltre 2000 colori di fabbrica con pannelli selezionabili basati su marca e tipo
- 💾 **Editor libreria filamenti** - Aggiungi/modifica basato su modale, avvisi duplicati e salvataggio persistente in `filamentLibrary.json`
- 🖼️ **Immagini filamento in PDF** - Mostra loghi filamento e campioni di colore nei PDF generati
- 🧾 **Importazione G-code e creazione bozza** - Carica esportazioni G-code/JSON (Prusa, Cura, Orca, Qidi) da modale nella calcolatrice, con riepilogo dettagliato e generazione automatica bozza preventivo
- 📈 **Statistiche** - Dashboard di riepilogo per consumo filamento, ricavi, profitto
- 👥 **Database clienti** - Gestione clienti con informazioni di contatto, dettagli aziendali e statistiche delle offerte
- 📊 **Storico e tendenze dei prezzi** - Tracciamento delle variazioni di prezzo del filamento con grafici e statistiche
- 🌍 **Multilingue** - Traduzione completa in ungherese, inglese, tedesco, francese, cinese semplificato, ceco, spagnolo, italiano, polacco, portoghese, slovacco, ucraino e russo (14 lingue, 850+ chiavi di traduzione per lingua)
- 💱 **Valute multiple** - EUR, HUF, USD
- 🔄 **Aggiornamenti automatici** - Controlla GitHub Releases per nuove versioni
- 🧪 **Versioni beta** - Supporto branch beta e build beta
- ⚙️ **Controllo beta** - Controllo configurabile versioni beta
- 🎨 **Layout responsive** - Tutti gli elementi dell'applicazione si adattano dinamicamente alla dimensione della finestra
- ✅ **Dialoghi di conferma** - Richiesta di conferma prima dell'eliminazione
- 🔔 **Notifiche toast** - Notifiche dopo operazioni riuscite
- 🔍 **Ricerca e filtraggio** - Cerca filamenti, stampanti e preventivi
- 🔎 **Confronto prezzi online** - Un clic apre risultati di ricerca Google/Bing per il filamento selezionato, prezzo aggiornabile istantaneamente
- 📋 **Duplicazione** - Duplicazione facile dei preventivi
- 🖱️ **Trascina e rilascia** - Riordina preventivi, filamenti e stampanti trascinando
- 📱 **Menu contestuali** - Menu tasto destro per azioni rapide (modifica, elimina, duplica, esporta)
- 🍎 **Funzionalità specifiche della piattaforma** - Badge Dock macOS, notifiche native, integrazione system tray

## 📋 Registro delle modifiche (Changelog)

### v1.1.3 (2025) - 🪟 Correzioni di compatibilità Windows

- 🪟 **Correzione di compatibilità Windows** - Miglioramenti al caricamento della libreria filamenti:
  - Import dinamico per file JSON grandi (invece di import statico)
  - Meccanismo di cache per evitare caricamenti multipli
  - Gestione errori migliorata per casi di file non trovato su Windows
  - Compatibilità multipiattaforma (Windows, macOS, Linux)
- 🔧 **Miglioramenti alla gestione degli errori** - Messaggi di errore migliorati:
  - Gestione corretta dei messaggi di errore specifici di Windows
  - Gestione silenziosa dei casi di file non trovato (non come avvisi)

### v1.1.2 (2025) - 🌍 Selettore lingua e miglioramenti

- 🌍 **Selettore lingua al primo avvio** - Dialogo moderno e animato per la selezione della lingua al primo avvio:
  - Supporto per 13 lingue con icone bandiera
  - Design consapevole del tema
  - Animazioni fluide
  - Il tutorial viene eseguito nella lingua selezionata
- 🔄 **Ripristino alle impostazioni di fabbrica** - Funzione di eliminazione completa dei dati:
  - Elimina tutti i dati memorizzati (stampanti, filamenti, offerte, clienti, impostazioni)
  - Dialogo di conferma per operazioni pericolose
  - L'applicazione si riavvia come al primo avvio
- 🎨 **Miglioramenti UI**:
  - Correzione del contrasto del testo del piè di pagina (selezione colore dinamica)
  - Salvataggio immediato al cambio lingua
  - Posizionamento migliorato dei tooltip
- 📚 **Traduzioni tutorial** - Traduzione completa del tutorial in tutte le lingue supportate (aggiunto russo, ucraino, cinese)

### v1.1.1 (2025) - 🎨 Miglioramenti layout header

- 📐 **Riorganizzazione header** - Struttura header a tre parti:
  - Sinistra: Menu + Logo + Titolo
  - Centro: Breadcrumb (si riduce dinamicamente)
  - Destra: Azioni rapide + Card informazioni stato
- 📊 **Card informazioni stato** - Stile compatto e moderno:
  - "Prossimo salvataggio" (etichetta e valore)
  - Data e ora (impilate)
  - Sempre posizionata a destra
- 📱 **Design responsive** - Breakpoint migliorati:
  - Nascondi breadcrumb <1000px
  - Nascondi data <900px
  - Nascondi "Prossimo salvataggio" <800px
  - Azioni rapide compatte <700px
- 🔢 **Correzione formattazione numeri** - Arrotondamento percentuali progresso caricamento

### v1.1.0 (2025) - 🚀 Aggiornamento funzionalità

- 🔍 **Ricerca globale estesa** - Funzionalità di ricerca migliorata:
  - Cerca offerte per nome cliente, ID, stato e data
  - Cerca filamenti dal database (filamentLibrary) per marca, tipo e colore
  - Aggiungi filamenti all'elenco salvato con un clic dai risultati di ricerca
  - Risultati di ricerca migliorati con indicatori di tipo
- 💀 **Sistema di caricamento Skeleton** - Esperienza di caricamento spettacolare:
  - Componenti skeleton animati con effetti shimmer
  - Tracciamento del progresso con indicatori visivi
  - Passaggi di caricamento con segni di spunta per i passaggi completati
  - Transizioni fade-in fluide
  - Colori skeleton adattati al tema
  - Caricatori skeleton specifici per pagina
- 🎨 **Miglioramenti UI/UX**:
  - Stati di caricamento migliori
  - Feedback utente migliorato durante il caricamento dei dati
  - Esperienza visiva migliorata

### v1.0.0 (2025) - 🎉 Prima versione stabile

- 🎨 **Componenti UI moderni** - Rinnovamento completo dell'UI con componenti moderni:
  - Componente Empty State per una migliore esperienza utente
  - Componente Card con effetti hover
  - Componente Progress Bar per operazioni di export/import PDF
  - Componente Tooltip con integrazione tema
  - Navigazione Breadcrumb per una chiara gerarchia delle pagine
- ⚡ **Azioni rapide** - Pulsanti di azione rapida nell'intestazione per un flusso di lavoro più veloce:
  - Pulsanti di aggiunta rapida per Filamenti, Stampanti e Clienti
  - Pulsanti dinamici basati sulla pagina attiva
  - Integrazione scorciatoie da tastiera
- 🔍 **Ricerca globale (Command Palette)** - Funzionalità di ricerca potente:
  - `Ctrl/Cmd+K` per aprire la ricerca globale
  - Ricerca pagine e azioni rapide
  - Navigazione da tastiera (↑↓, Enter, Esc)
  - Stile adattato al tema
- ⏪ **Funzionalità Annulla/Ripeti** - Gestione cronologia per Filamenti:
  - `Ctrl/Cmd+Z` per annullare
  - `Ctrl/Cmd+Shift+Z` per ripetere
  - Pulsanti visivi annulla/ripeti nell'UI
  - Supporto cronologia a 50 passi
- ⭐ **Filamenti preferiti** - Segna e filtra i filamenti preferiti:
  - Icona stella per attivare/disattivare lo stato preferito
  - Filtro per mostrare solo i preferiti
  - Stato preferito persistente
- 📦 **Operazioni in blocco** - Gestione efficiente in blocco:
  - Selezione checkbox per più filamenti
  - Funzionalità Seleziona tutto / Deseleziona tutto
  - Eliminazione in blocco con dialogo di conferma
  - Indicatori di selezione visivi
- 🎨 **Dialoghi modali** - Esperienza modale moderna:
  - Modali con sfondo sfocato per moduli di aggiunta/modifica
  - Campi di input a dimensione fissa
  - Tasto Esc per chiudere
  - Animazioni fluide con framer-motion
- ⌨️ **Scorciatoie da tastiera** - Sistema di scorciatoie migliorato:
  - Scorciatoie da tastiera personalizzabili
  - Dialogo di aiuto scorciatoie (`Ctrl/Cmd+?`)
  - Modifica scorciatoie con cattura tasti
  - Archiviazione scorciatoie persistente
- 📝 **Sistema di registrazione** - Registrazione completa:
  - File di log separati per frontend e backend
  - Risoluzione directory log indipendente dalla piattaforma
  - Rotazione automatica dei log
  - Integrazione console
- 🔔 **Miglioramenti notifiche** - Migliore sistema di notifiche:
  - Nome cliente nelle notifiche di eliminazione offerta
  - Supporto notifiche multipiattaforma
  - Gestione errori migliorata
- 🎯 **Miglioramenti UI/UX**:
  - Dimensioni campi di input fisse
  - Layout moduli migliori
  - Integrazione tema migliorata
  - Accessibilità migliorata

### v0.6.0 (2025)

#### 🐛 Correzioni di bug
- **Ottimizzazione del logging**: Riduzione della registrazione eccessiva e duplicata
  - I log informativi compaiono solo in modalità sviluppo (DEV)
  - Gli errori vengono ancora registrati nelle build di produzione
  - L'inizializzazione di FilamentLibrary avviene silenziosamente
- **Correzione di avvisi falsi**: La risoluzione del colore del filamento avvisa solo quando la libreria è già caricata e il colore non è ancora stato trovato
  - Previene avvisi falsi durante il caricamento asincrono della libreria
  - Gli avvisi compaiono solo per problemi reali
- **Correzione della duplicazione del controllo aggiornamenti**: Rimozione delle chiamate duplicate di controllo aggiornamenti
- **Correzione del logging delle scorciatoie da tastiera**: Registra solo quando esiste una scorciatoia, ignora combinazioni non valide

#### ⚡ Miglioramenti delle prestazioni
- Logging delle operazioni di archiviazione ottimizzato (solo modalità DEV)
- Meno operazioni console nelle build di produzione
- Output console più pulito durante lo sviluppo

## 📸 Screenshot

L'applicazione include:
- Dashboard home con statistiche
- Gestione filamenti
- Gestione stampanti
- Calcolatrice calcolo costi
- Lista preventivi e vista dettagliata
- Dashboard stato e timeline
- Esportazione PDF e anteprima integrata

## 🚀 Installazione

### Prerequisiti

- **Rust**: [Installa Rust](https://rustup.rs/)
- **Node.js**: [Installa Node.js](https://nodejs.org/) (versione 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Specifico macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Specifico Linux (Ubuntu/Debian)

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

### Specifico Windows

- Visual Studio Build Tools (strumenti di compilazione C++)
- Windows SDK

## 📦 Compilazione

### Esecuzione in modalità sviluppo

```bash
cd src-tauri
cargo tauri dev
```

### Build di produzione (Creare applicazione standalone)

```bash
cd src-tauri
cargo tauri build
```

L'applicazione standalone si troverà in:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` o `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Build beta

Il progetto include un branch `beta` configurato per build separate:

```bash
# Passa al branch beta
git checkout beta

# Build beta locale
./build-frontend.sh
cd src-tauri
cargo tauri build
```

La build beta imposta automaticamente la variabile `VITE_IS_BETA=true`, quindi appare "BETA" nel menu.

**GitHub Actions**: Quando si fa push al branch `beta`, il workflow `.github/workflows/build-beta.yml` viene eseguito automaticamente, compilando la versione beta per tutte e tre le piattaforme.

Guida dettagliata: [BUILD.md](BUILD.md) e [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Sviluppo

### Struttura progetto

```
3DPrinterCalcApp/
├── frontend/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Componenti React
│   │   ├── utils/        # Funzioni helper
│   │   └── types.ts      # Tipi TypeScript
│   └── package.json
├── src-tauri/         # Backend Rust
│   ├── src/           # Codice sorgente Rust
│   ├── Cargo.toml     # Dipendenze Rust
│   └── tauri.conf.json # Configurazione Tauri
└── README.md
```

### Sviluppo frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Dipendenze

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (archiviazione dati)
- tauri-plugin-log (registrazione)

## 📖 Utilizzo

1. **Aggiungi stampante**: Menu Stampanti → Aggiungi nuova stampante
2. **Aggiungi filamento**: Menu Filamenti → Aggiungi nuovo filamento
3. **Calcola costo**: Menu Calcolatrice → Seleziona stampante e filamenti
4. **Salva preventivo**: Clicca sul pulsante "Salva come preventivo" nella calcolatrice
5. **Esporta PDF**: Menu Preventivi → Seleziona un preventivo → Esporta PDF
6. **Controlla versioni beta**: Menu Impostazioni → Abilita opzione "Controlla aggiornamenti beta"

## 🔄 Gestione versioni e aggiornamenti

L'applicazione controlla automaticamente GitHub Releases per nuove versioni:

- **All'avvio**: Controlla automaticamente gli aggiornamenti
- **Ogni 5 minuti**: Ricontrolla automaticamente
- **Notifica**: Se è disponibile una nuova versione, appare una notifica nell'angolo superiore destro

### Controllo versioni beta

Per controllare le versioni beta:

1. Vai al menu **Impostazioni**
2. Abilita l'opzione **"Controlla aggiornamenti beta"**
3. L'applicazione controlla immediatamente le versioni beta
4. Se è disponibile una versione beta più recente, appare una notifica
5. Clicca sul pulsante "Scarica" per andare alla pagina GitHub Release

**Esempio**: Se stai usando una versione RELEASE (es. 0.1.0) e abiliti il controllo beta, l'applicazione trova l'ultima versione beta (es. 0.2.0-beta) e ti notifica se ce n'è una più recente.

Guida dettagliata: [VERSIONING.md](VERSIONING.md)

## 🛠️ Stack tecnologico

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Archiviazione dati**: Tauri Store Plugin (file JSON)
- **Stile**: Stili inline (commonStyles)
- **i18n**: Sistema di traduzione personalizzato
- **CI/CD**: GitHub Actions (build automatici per macOS, Linux, Windows)
- **Gestione versioni**: Integrazione API GitHub Releases

## 📝 Licenza

Questo progetto è concesso in licenza sotto **licenza MIT**, tuttavia **l'uso commerciale richiede autorizzazione**.

Copyright completo dell'applicazione: **Lekszikov Miklós (LexyGuru)**

- ✅ **Uso personale ed educativo**: Consentito
- ❌ **Uso commerciale**: Solo con autorizzazione scritta esplicita

Dettagli: file [LICENSE](LICENSE)

## 👤 Autore

Lekszikov Miklós (LexyGuru)

## 🙏 Ringraziamenti

- [Tauri](https://tauri.app/) - Il framework per app desktop multipiattaforma
- [React](https://react.dev/) - Il framework frontend
- [Vite](https://vitejs.dev/) - Lo strumento di build

## 📚 Documentazione aggiuntiva

- [BUILD.md](BUILD.md) - Guida dettagliata alla build per tutte le piattaforme
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Creare applicazione standalone
- [VERSIONING.md](VERSIONING.md) - Gestione versioni e aggiornamenti
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Creare primo GitHub Release

## 🌿 Struttura branch

- **`main`**: Versioni di release stabili (build RELEASE)
- **`beta`**: Versioni beta e sviluppo (build BETA)

Quando si fa push al branch `beta`, il workflow GitHub Actions viene eseguito automaticamente, compilando la versione beta.

## 📋 Cronologia versioni

### v1.1.1 (2025) - 🎨 Miglioramenti al layout dell'intestazione

- 🎨 **Ridisegno dell'intestazione** - Revisione completa del layout dell'intestazione:
  - Struttura a tre sezioni (sinistra: logo/menu, centro: breadcrumb, destra: azioni/stato)
  - Scheda informazioni stato sempre posizionata all'estrema destra
  - Design moderno tipo scheda per informazioni stato
  - Migliori spaziature e allineamento in tutta l'intestazione
- 📱 **Design responsivo** - Migliore esperienza su mobile e schermi piccoli:
  - Breakpoint dinamici per la visibilità degli elementi
  - Correzioni del troncamento del breadcrumb
  - Azioni rapide si adattano alle dimensioni dello schermo
  - Dimensionamento responsivo della scheda informazioni stato
- 🔧 **Correzioni layout**:
  - Problemi di overflow e troncamento del breadcrumb risolti
  - Miglioramenti al posizionamento della scheda informazioni stato
  - Migliore gestione del layout flexbox
  - Spaziatura e gap migliorati tra gli elementi

### v1.1.0 (2025) - 🚀 Aggiornamento funzionalità

- 🔍 **Ricerca globale estesa** - Funzionalità di ricerca migliorata
- 💀 **Sistema di caricamento Skeleton** - Esperienza di caricamento spettacolare
- 🎨 **Miglioramenti UI/UX** - Stati di caricamento migliori e esperienza visiva

### v1.0.0 (2025) - 🎉 Prima versione stabile

- 🎨 **Componenti UI moderni** - Rinnovamento completo dell'UI con componenti moderni
- ⚡ **Azioni rapide** - Pulsanti di azione rapida nell'intestazione
- 🔍 **Ricerca globale** - Funzionalità di ricerca potente
- ⏪ **Funzionalità Annulla/Ripeti** - Gestione cronologia
- ⭐ **Filamenti preferiti** - Segna e filtra filamenti preferiti
- 📦 **Operazioni in blocco** - Gestione in blocco efficiente
- 🎨 **Dialoghi modali** - Esperienza modale moderna
- ⌨️ **Scorciatoie da tastiera** - Sistema di scorciatoie migliorato
- 📝 **Sistema di registrazione** - Registrazione completa
- 🔔 **Miglioramenti notifiche** - Miglior sistema di notifiche

### v0.6.0 (2025)

- 👥 **Database clienti** - Sistema completo di gestione clienti con:
  - Aggiungere, modificare, eliminare clienti
  - Informazioni di contatto (email, telefono)
  - Dettagli aziendali (opzionale)
  - Indirizzo e note
  - Statistiche clienti (totale offerte, data ultima offerta)
  - Funzionalità di ricerca
  - Integrazione con Calcolatrice per selezione rapida clienti
- 📊 **Storico e tendenze dei prezzi** - Tracciamento delle variazioni di prezzo del filamento:
  - Tracciamento automatico dello storico prezzi quando i prezzi del filamento vengono aggiornati
  - Visualizzazione delle tendenze dei prezzi con grafici SVG
  - Statistiche dei prezzi (prezzo attuale, medio, min, max)
  - Analisi delle tendenze (in aumento, in diminuzione, stabile)
  - Tabella dello storico prezzi con informazioni dettagliate sulle variazioni
  - Avvisi per variazioni significative dei prezzi (variazioni del 10%+)
  - Visualizzazione dello storico prezzi nel componente Filamenti durante la modifica
- 🔧 **Miglioramenti**:
  - Calcolatrice migliorata con menu a tendina di selezione clienti
  - Integrazione dello storico prezzi nel modulo di modifica filamento
  - Persistenza dei dati migliorata per clienti e storico prezzi

### v0.5.58 (2025)
- 🌍 **Supporto lingue ucraino e russo** – Aggiunto supporto completo per le traduzioni per ucraino (uk) e russo (ru):
  - File di traduzione completi con tutte le 813 chiavi di traduzione per entrambe le lingue
  - Supporto locale ucraino (uk-UA) per la formattazione data/ora
  - Supporto locale russo (ru-RU) per la formattazione data/ora
  - Tutti i file README aggiornati con nuove lingue nel menu delle lingue
  - Conteggio lingue aggiornato da 12 a 14 lingue
  - File di documentazione README.uk.md e README.ru.md creati

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
- 🌍 **Traduzioni linguistiche complete** – Completate le traduzioni complete per 6 file linguistici rimanenti: ceco (cs), spagnolo (es), italiano (it), polacco (pl), portoghese (pt) e slovacco (sk). Ogni file contiene tutte le 813 chiavi di traduzione, quindi l'applicazione è ora completamente supportata in queste lingue.
- 🔒 **Correzione permessi Tauri** – Il file `update_filamentLibrary.json` è ora esplicitamente abilitato per operazioni di lettura, scrittura e creazione nel file delle capacità Tauri, garantendo che gli aggiornamenti della libreria dei filamenti funzionino in modo affidabile.

### v0.5.55 (2025)
- 🧵 **Miglioramento modifica preventivi** – I preventivi salvati ora consentono la selezione o modifica diretta della stampante, con costi ricalcolati automaticamente insieme alle modifiche del filamento.
- 🧮 **Precisione e registrazione** – La registrazione dettagliata aiuta a tracciare i passaggi del calcolo dei costi (filamento, elettricità, essiccazione, utilizzo), facilitando la ricerca di errori nei file G-code importati.
- 🌍 **Aggiunte traduzione** – Nuove chiavi ed etichette i18n aggiunte per il selettore stampante, garantendo un'interfaccia editor coerente in tutte le lingue supportate.
- 📄 **Aggiornamento documentazione** – README espanso con descrizione delle nuove funzionalità, release v0.5.55 aggiunta alla cronologia versioni.

### v0.5.11 (2025)
- 🗂️ **Modularizzazione linguistica** – Espansione dell'app con file di traduzione organizzati in una nuova directory `languages/`, facilitando l'aggiunta di nuove lingue e la gestione di testi esistenti.
- 🌍 **Traduzioni UI unificate** – L'interfaccia di importazione dello slicer ora funziona dal sistema di traduzione centralizzato, con tutti i pulsanti, messaggi di errore e riepiloghi localizzati.
- 🔁 **Aggiornamento selettore lingua** – In Impostazioni, il selettore lingua si carica in base ai file linguistici scoperti, quindi in futuro basta aggiungere un nuovo file linguistico.
- 🌐 **Nuove basi linguistiche** – File di traduzione preparati per francese, italiano, spagnolo, polacco, ceco, slovacco, portoghese brasiliano e cinese semplificato (con fallback inglese), le traduzioni effettive possono essere facilmente completate.

### v0.5.0 (2025)
- 🔎 **Pulsante confronto prezzi filamento** – Ogni filamento personalizzato ora ha un'icona lente d'ingrandimento che apre la ricerca Google/Bing basata su marca/tipo/colore, fornendo link rapidi ai prezzi attuali.
- 💶 **Supporto prezzo decimale** – I campi prezzo filamento ora accettano decimali (14.11 € ecc.), l'input viene automaticamente validato e formattato al salvataggio.
- 🌐 **Ricerca inversa fallback** – Se il shell Tauri non può aprire il browser, l'applicazione apre automaticamente una nuova scheda, quindi la ricerca funziona su tutte le piattaforme.

### v0.4.99 (2025)
- 🧾 **Importazione G-code integrata nella calcolatrice** – Nuovo modale `SlicerImportModal` nella parte superiore della calcolatrice che carica esportazioni G-code/JSON con un clic, trasferendo tempo di stampa, quantità filamento e creando una bozza di preventivo.
- 📊 **Dati slicer dall'intestazione** – I valori dell'intestazione G-code `total filament weight/length/volume` assumono automaticamente i riepiloghi, gestendo accuratamente le perdite di cambio colore.

### v0.4.98 (2025)
- 🧵 **Supporto filamento multicolore** – La libreria filamenti e l'UI di gestione ora contrassegnano separatamente i filamenti multicolore (arcobaleno/dual/tricolor) con note e anteprima arcobaleno.
- 🌐 **Traduzione automatica all'importazione CSV** – I nomi dei colori importati da database esterno ricevono etichette ungheresi e tedesche, mantenendo il selettore colore multilingue senza modifica manuale.
- 🔄 **Unione libreria aggiornamento** – Il contenuto del file `update_filamentLibrary.json` viene automaticamente deduplicato e unito alla libreria esistente all'avvio, senza sovrascrivere le modifiche dell'utente.
- 📁 **Aggiornamento convertitore CSV** – Lo script `convert-filament-csv.mjs` non sovrascrive più il `filamentLibrary.json` persistente, invece crea un file di aggiornamento e genera etichette multilingue.
- ✨ **Ottimizzazione esperienza animazione** – Nuove opzioni di transizione pagina (flip, parallax), selettore stile microinterazione, feedback pulsante, lista skeleton libreria filamenti ed effetti hover carta ottimizzati.
- 🎨 **Estensioni laboratorio temi** – Quattro nuovi temi integrati (Forest, Pastel, Charcoal, Midnight), duplicazione istantanea del tema attivo per modifica personalizzata, gestione gradiente/contrasto migliorata e processo condivisione semplificato.

### v0.4.0 (2025)
- 🧵 **Integrazione database filamenti** – Oltre 2.000 colori di fabbrica da libreria JSON integrata (snapshot filamentcolors.xyz), organizzati per marca e materiale
- 🪟 **Pannelli selettore dimensione fissa** – Liste marca e tipo aperte con pulsante, ricercabili, scorrevoli che si escludono a vicenda, rendendo il modulo più trasparente
- 🎯 **Miglioramenti selettore colore** – Quando vengono riconosciuti elementi della libreria, la finitura e il codice esadecimale vengono impostati automaticamente, campi separati disponibili quando si passa alla modalità personalizzata
- 💾 **Editor libreria filamenti** – Nuova scheda impostazioni con modulo popup, gestione duplicati e salvataggio persistente `filamentLibrary.json` basato su Tauri FS
- 📄 **Aggiornamento documentazione** – Nuovo punto nell'elenco funzionalità principali per la libreria colori filamenti, pulizia README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Preset filtro preventivi** – Impostazioni filtro salvabili e nominabili, preset rapidi predefiniti (Oggi, Ieri, Settimanale, Mensile ecc.) e applica/elimina con un clic
- 📝 **Note cambio stato** – Nuovo modale per modifica stato preventivo con nota opzionale che viene memorizzata nella cronologia stato
- 🖼️ **Estensione esportazione PDF** – Le immagini memorizzate con filamenti appaiono nella tabella PDF con stile ottimizzato per stampa
- 🧾 **Foglio dati branding aziendale** – Nome azienda, indirizzo, ID fiscale, conto bancario, contatto e caricamento logo; incluso automaticamente nell'intestazione PDF
- 🎨 **Selettore modello PDF** – Tre stili (Moderno, Minimalista, Professionale) tra cui scegliere per l'aspetto del preventivo
- 👁️ **Anteprima PDF integrata** – Pulsante separato nei dettagli preventivo per verifica visiva istantanea prima dell'esportazione
- 📊 **Dashboard stato** – Carte stato con riepilogo, filtri stato rapidi e timeline dei cambi di stato recenti nei preventivi
- 📈 **Grafici statistici** – Grafico tendenza ricavi/costo/profitto, grafico a torta distribuzione filamenti, grafico a barre ricavi per stampante, tutto esportabile in formato SVG/PNG e può anche essere salvato come PDF

### v0.3.8 (2025)
- 🐛 **Correzione formattazione numeri report** - Formattazione a 2 decimali nei report:
  - Carte statistiche principali (Ricavi, Spese, Profitto, Preventivi): `formatNumber(formatCurrency(...), 2)`
  - Valori sopra grafici: `formatNumber(formatCurrency(...), 2)`
  - Statistiche dettagliate (Profitto medio/preventivo): `formatNumber(formatCurrency(...), 2)`
  - Ora coerente con la homepage (es. `6.45` invece di `6.45037688333333`)
- 🎨 **Correzione navigazione tab impostazioni** - Miglioramenti colore sfondo e testo:
  - Sfondo sezione navigazione tab: `rgba(255, 255, 255, 0.85)` per temi gradiente + `blur(10px)`
  - Sfondi pulsanti tab: Attivo `rgba(255, 255, 255, 0.9)`, inattivo `rgba(255, 255, 255, 0.7)` per temi gradiente
  - Colore testo pulsanti tab: `#1a202c` (scuro) per temi gradiente per leggibilità
  - Effetti hover: `rgba(255, 255, 255, 0.85)` per temi gradiente
  - Filtro sfondo: `blur(8px)` per pulsanti tab, `blur(10px)` per sezione navigazione

### v0.3.7 (2025)
- 🎨 **Modernizzazione design** - Trasformazione visiva completa con animazioni e nuovi temi:
  - Nuovi temi: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nuovi temi moderni)
  - Animazioni Framer Motion integrate (fadeIn, slideIn, stagger, effetti hover)
  - Effetto glassmorphism per temi gradiente (sfocatura + sfondo trasparente)
  - Effetto bagliore neon per temi neon/cyberpunk
  - Carte e superfici modernizzate (padding più grande, angoli arrotondati, ombre migliori)
- 🎨 **Miglioramenti colore** - Miglior contrasto e leggibilità per tutti i temi:
  - Testo scuro (#1a202c) su sfondo bianco/chiaro per temi gradiente
  - Campi input, etichette, colorizzazione h3 migliorata in tutti i componenti
  - Gestione colore coerente su tutte le pagine (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Ombra testo aggiunta per temi gradiente per migliore leggibilità
- 📊 **Miglioramenti stile tabella** - Sfondo più sfocato e migliore contrasto testo:
  - Colore sfondo: rgba(255, 255, 255, 0.85) per temi gradiente (precedentemente 0.95)
  - Filtro sfondo: blur(8px) per effetto più sfocato
  - Colore testo: #333 (grigio scuro) per temi gradiente per migliore leggibilità
  - Sfondi celle: rgba(255, 255, 255, 0.7) per effetto più sfocato
- 🎨 **Miglioramenti colore sfondo carte** - Sfondo più sfocato, migliore leggibilità:
  - Colore sfondo: rgba(255, 255, 255, 0.75) per temi gradiente (precedentemente 0.95)
  - Filtro sfondo: blur(12px) per sfocatura più forte
  - Opacità: 0.85 per effetto opaco
  - Colore testo: #1a202c (scuro) per temi gradiente
- 📈 **Modernizzazione homepage** - Statistiche settimanali/mensili/annuali e confronto periodo:
  - Carte confronto periodo (Settimanale, Mensile, Annuale) con barre accento colorate
  - Componenti StatCard modernizzati (icone con sfondi colorati, barre accento)
  - Sezione riepilogo organizzata in carte con icone
  - Sezione confronto periodo aggiunta
- 🐛 **Correzione filtro data** - Filtraggio periodo più preciso:
  - Reset tempo (00:00:00) per confronto preciso
  - Limite superiore impostato (oggi è incluso)
  - Settimanale: ultimi 7 giorni (oggi incluso)
  - Mensile: ultimi 30 giorni (oggi incluso)
  - Annuale: ultimi 365 giorni (oggi incluso)
- 🎨 **Modernizzazione sidebar** - Icone, glassmorphism, effetti bagliore neon
- 🎨 **Modernizzazione ConfirmDialog** - Prop tema aggiunta, colorazione armonizzata

### v0.3.6 (2025)
- 🎨 **Riorganizzazione UI impostazioni** - Sistema tab (Generale, Aspetto, Avanzato, Gestione dati) per migliore UX e navigazione più pulita
- 🌐 **Miglioramenti traduzione** - Tutto il testo ungherese hardcoded tradotto in tutti i componenti (HU/EN/DE):
  - Calculator: "calcolo costi stampa 3D"
  - Filaments: "Gestisci e modifica filamenti"
  - Printers: "Gestisci stampanti e sistemi AMS"
  - Offers: "Gestisci ed esporta preventivi salvati"
  - Home: Titoli statistiche, riepilogo, etichette esportazione CSV (ora/Std/hrs, pz/Stk/pcs)
  - VersionHistory: "Nessuna cronologia versioni disponibile"
- 💾 **Sistema cache cronologia versioni** - Salvataggio fisico in localStorage, controllo GitHub ogni 1 ora:
  - Rilevamento modifiche basato su checksum (scarica solo su nuovi release)
  - Cache separata per lingua (Ungherese/Inglese/Tedesco)
  - Cambio lingua veloce da cache (nessuna ri-traduzione)
  - Invalidazione cache automatica su nuovo release
- 🌐 **Traduzione intelligente** - Traduce solo nuovi release, usa traduzioni vecchie da cache:
  - Validazione cache (non cacheare se stesso testo)
  - API MyMemory fallback se traduzione fallisce
  - Auto-reset contatore errori (si resetta dopo 5 minuti)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate rimosso** - Solo utilizzo API MyMemory (errori 400 eliminati, richiesta GET, nessun CORS)
- 🔄 **Refactoring pulsante retry** - Meccanismo trigger più semplice con useEffect
- 🐛 **Correzioni errori build** - Problemi indentazione JSX corretti (sezione Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Integrazione API MyMemory** - API traduzione gratuita invece di LibreTranslate
- ✅ **Apertura pagina release GitHub** - Pulsante per aprire pagina release GitHub su limite velocità
- ✅ **Miglioramento gestione errori limite velocità** - Messaggi errore chiari e pulsante retry
- 🐛 **Correzioni errori build** - Import non utilizzati rimossi (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Miglioramento validazione input** - Utility validazione centrale creata e integrata in componenti Calculator, Filaments, Printers
- ✅ **Messaggi errore validazione** - Messaggi errore multilingue (HU/EN/DE) con notifiche toast
- ✅ **Ottimizzazione prestazioni** - Componenti lazy loading (code splitting), ottimizzazione useMemo e useCallback
- ✅ **Inizializzazione specifica piattaforma** - Fondamenti inizializzazione specifica piattaforma macOS, Windows, Linux
- 🐛 **Correzione errore build** - Funzioni menu contestuale Printers.tsx aggiunte

### v0.3.3 (2025)
- 🖱️ **Funzionalità drag & drop** - Riordina preventivi, filamenti e stampanti trascinando
- 📱 **Menu contestuali** - Menu tasto destro per azioni rapide (modifica, elimina, duplica, esporta PDF)
- 🎨 **Feedback visivo** - Cambio opacità e cursore durante drag & drop
- 🔔 **Notifiche toast** - Notifiche dopo riordino
- 🐛 **Correzione errore build** - Correzione Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Funzionalità modello** - Salva e carica calcoli come modelli nel componente Calculator
- 📜 **Cronologia/Versionamento per preventivi** - Versionamento preventivi, visualizza cronologia, traccia modifiche
- 🧹 **Correzione duplicazione** - Funzioni esportazione/importazione CSV/JSON duplicate rimosse da componenti Filaments e Printers (rimaste in Settings)

### v0.3.1 (2025)
- ✅ **Miglioramento validazione input** - Numeri negativi disabilitati, valori massimi impostati (peso filamento, tempo stampa, potenza, ecc.)
- 📊 **Esportazione/Importazione CSV/JSON** - Esportazione/importazione bulk di filamenti e stampanti in formato CSV e JSON
- 📥 **Pulsanti Importa/Esporta** - Accesso facile alle funzioni esportazione/importazione su pagine Filaments e Printers
- 🎨 **Miglioramento stati vuoti** - Stati vuoti informativi mostrati quando non ci sono dati

### v0.3.0 (2025)
- ✏️ **Modifica preventivi** - Modifica preventivi salvati (nome cliente, contatto, descrizione, percentuale profitto, filamenti)
- ✏️ **Modifica filamenti in preventivo** - Modifica, aggiungi, elimina filamenti all'interno del preventivo
- ✏️ **Pulsante modifica** - Nuovo pulsante modifica accanto al pulsante elimina nell'elenco preventivi
- 📊 **Funzione esportazione statistiche** - Esporta statistiche in formato JSON o CSV dalla homepage
- 📈 **Generazione report** - Genera report settimanali/mensili/annuali/tutti in formato JSON con filtraggio periodo
- 📋 **Visualizzazione cronologia versioni** - Visualizza cronologia versioni in impostazioni, integrazione API GitHub Releases
- 🌐 **Traduzione release GitHub** - Traduzione automatica Ungherese -> Inglese/Tedesco (API MyMemory)
- 💾 **Cache traduzione** - Cache localStorage per note release tradotte
- 🔄 **Cronologia versioni dinamica** - Versioni beta e release mostrate separatamente
- 🐛 **Correzioni bug** - Variabili non utilizzate rimosse, pulizia codice, errori linter corretti

### v0.2.55 (2025)
- 🖥️ **Funzione Console/Log** - Nuovo elemento menu Console per debug e visualizzazione log
- 🖥️ **Impostazione Console** - Può abilitare visualizzazione elemento menu Console in impostazioni
- 📊 **Raccolta log** - Registrazione automatica di tutti i messaggi console.log, console.error, console.warn
- 📊 **Registrazione errori globali** - Registrazione automatica di eventi errore finestra e promise rejection non gestiti
- 🔍 **Filtraggio log** - Filtra per livello (all, error, warn, info, log, debug)
- 🔍 **Esportazione log** - Esporta log in formato JSON
- 🧹 **Eliminazione log** - Elimina log con un pulsante
- 📜 **Auto-scroll** - Scorrimento automatico a nuovi log
- 💾 **Registrazione completa** - Tutte le operazioni critiche registrate (salva, esporta, importa, elimina, esporta PDF, scarica aggiornamento)
- 🔄 **Correzione pulsante aggiornamento** - Il pulsante download ora usa plugin shell Tauri, funziona in modo affidabile
- 🔄 **Registrazione aggiornamento** - Registrazione completa di controllo e download aggiornamento
- ⌨️ **Scorciatoie tastiera** - `Ctrl/Cmd+N` (nuovo), `Ctrl/Cmd+S` (salva), `Escape` (annulla), `Ctrl/Cmd+?` (aiuto)
- ⌨️ **Correzione scorciatoie tastiera macOS** - Gestione Cmd vs Ctrl, gestione eventi fase capture
- ⏳ **Stati caricamento** - Componente LoadingSpinner per stati caricamento
- 💾 **Backup e ripristino** - Backup e ripristino dati completo con dialogo Tauri e plugin fs
- 🛡️ **Error boundaries** - React ErrorBoundary per gestione errori livello applicazione
- 💾 **Salvataggio automatico** - Salvataggio automatico debounced con intervallo configurabile (predefinito 30 secondi)
- 🔔 **Impostazioni notifiche** - Notifiche toast on/off e impostazione durata
- ⌨️ **Menu aiuto scorciatoie** - Elenco scorciatoie tastiera in finestra modale (`Ctrl/Cmd+?`)
- 🎬 **Animazioni e transizioni** - Transizioni fluide e animazioni keyframe (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltip** - Aiuto contestuale per tutti gli elementi importanti al passaggio mouse
- 🐛 **Correzione errore render React** - Operazione asincrona logger console in modo che non blocchi il rendering
- 🔧 **Aggiornamento num-bigint-dig** - Aggiornato a v0.9.1 (correzione avviso deprecation)

### v0.2.0 (2025)
- 🎨 **Sistema temi** - 6 temi moderni (Chiaro, Scuro, Blu, Verde, Viola, Arancione)
- 🎨 **Selettore temi** - Tema selezionabile in impostazioni, ha effetto immediatamente
- 🎨 **Integrazione temi completa** - Tutti i componenti (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) usano temi
- 🎨 **Colori dinamici** - Tutti i colori hard-coded sostituiti con colori tema
- 🎨 **Tema responsive** - I preventivi e il footer Sidebar usano anche temi
- 💱 **Conversione valuta dinamica** - I preventivi ora vengono visualizzati nella valuta impostazioni corrente (conversione automatica)
- 💱 **Cambio valuta** - La valuta cambiata in impostazioni influisce immediatamente sulla visualizzazione preventivi
- 💱 **Conversione valuta PDF** - L'esportazione PDF viene anche creata nella valuta impostazioni corrente
- 💱 **Conversione prezzo filamento** - I prezzi filamento vengono anche convertiti automaticamente

### v0.1.85 (2025)
- 🎨 **Miglioramenti UI/UX**:
  - ✏️ Icone duplicate rimosse (Pulsanti Modifica, Salva, Annulla)
  - 📐 Sezioni Esporta/Importa in layout 2 colonne (affiancate)
  - 💾 Dialogo salvataggio nativo usato per salvataggio PDF (dialogo Tauri)
  - 📊 Notifiche toast per salvataggio PDF (successo/errore)
  - 🖼️ Dimensione finestra applicazione: 1280x720 (precedentemente 1000x700)
- 🐛 **Correzioni bug**:
  - Informazioni mancanti aggiunte in generazione PDF (customerContact, profitto in riga separata, ricavi)
  - Chiavi traduzione aggiunte (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Miglioramenti esportazione PDF**:
  - Contatto cliente (email/telefono) mostrato in PDF
  - Calcolo profitto in riga separata con percentuale profitto
  - Ricavi (Prezzo Totale) in riga separata, evidenziato
  - Scomposizione costi completa in PDF

### v0.1.56 (2025)
- ✨ **Miglioramenti layout calcolatrice**: Overflow carte filamento corretto, layout flexbox responsive
- ✨ **Scomposizione costi responsive**: Ora risponde dinamicamente alle modifiche dimensione finestra
- 🐛 **Correzione bug**: Il contenuto non trabocca dalla finestra quando si aggiunge filamento
- 🐛 **Correzione bug**: Tutti gli elementi Calculator rispondono correttamente alle modifiche dimensione finestra

### v0.1.55 (2025)
- ✨ **Dialoghi conferma**: Conferma richiesta prima di eliminare (Filamenti, Stampanti, Preventivi)
- ✨ **Notifiche toast**: Notifiche dopo operazioni riuscite (aggiungi, aggiorna, elimina)
- ✨ **Validazione input**: Numeri negativi disabilitati, valori massimi impostati
- ✨ **Stati caricamento**: Spinner caricamento all'avvio applicazione
- ✨ **Error boundary**: Gestione errori livello applicazione
- ✨ **Ricerca e filtro**: Cerca filamenti, stampanti e preventivi
- ✨ **Duplicazione**: Duplicazione facile preventivi
- ✨ **Moduli collassabili**: I moduli aggiungi filamento e stampante sono collassabili
- ✨ **Estensioni preventivo**: Campi nome cliente, contatto e descrizione aggiunti
- 🐛 **Pulizia Console.log**: Nessun console.log nella build produzione
- 🐛 **Correzione campo descrizione**: I testi lunghi si avvolgono correttamente.

---

**Versione**: 1.1.1

Se hai domande o trovi un bug, per favore apri un issue nel repository GitHub!

