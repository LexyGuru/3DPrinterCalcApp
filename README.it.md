# 🖨️ 3D Printer Calculator App

> **🌍 Selezione lingua**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

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
- 🌍 **Multilingue** - Traduzione completa in ungherese, inglese, tedesco, francese, cinese semplificato, ceco, spagnolo, italiano, polacco, portoghese e slovacco (12 lingue, 813 chiavi di traduzione per lingua)
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

### v0.5.56 (2025)
- 🌍 **Traduzioni linguistiche complete** – Completate le traduzioni complete per 6 file linguistici rimanenti: ceco (cs), spagnolo (es), italiano (it), polacco (pl), portoghese (pt) e slovacco (sk). Ogni file contiene tutte le 813 chiavi di traduzione, quindi l'applicazione è ora completamente supportata in queste lingue.
- 🔒 **Correzione permessi Tauri** – Il file `update_filamentLibrary.json` è ora esplicitamente abilitato per operazioni di lettura, scrittura e creazione nel file delle capacità Tauri, garantendo che gli aggiornamenti della libreria filamenti funzionino in modo affidabile.

### v0.5.55 (2025)
- 🧵 **Miglioramento modifica preventivi** – I preventivi salvati ora consentono la selezione o modifica diretta della stampante, con costi ricalcolati automaticamente insieme alle modifiche del filamento.
- 🧮 **Precisione e registrazione** – La registrazione dettagliata aiuta a tracciare i passaggi del calcolo dei costi (filamento, elettricità, essiccazione, utilizzo), facilitando la ricerca di errori nei file G-code importati.
- 🌍 **Aggiunte traduzione** – Nuove chiavi ed etichette i18n aggiunte per il selettore stampante, garantendo un'interfaccia editor coerente in tutte le lingue supportate.
- 📄 **Aggiornamento documentazione** – README espanso con descrizione delle nuove funzionalità, release v0.5.55 aggiunta alla cronologia versioni.

---

**Versione**: 0.5.56

Se hai domande o trovi un bug, per favore apri un issue nel repository GitHub!

