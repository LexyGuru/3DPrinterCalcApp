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
- 🎨 **Libreria colori filamento** - Oltre 12,000 colori di fabbrica con pannelli selezionabili basati su marca e tipo
- 💾 **Editor libreria filamenti** - Aggiungi/modifica basato su modale, avvisi duplicati e salvataggio persistente in `filamentLibrary.json`
- 🖼️ **Immagini filamento in PDF** - Mostra loghi filamento e campioni di colore nei PDF generati
- 🧾 **Importazione G-code e creazione bozza** - Carica esportazioni G-code/JSON (Prusa, Cura, Orca, Qidi) da modale nella calcolatrice, con riepilogo dettagliato e generazione automatica bozza preventivo
- 📈 **Statistiche** - Dashboard di riepilogo per consumo filamento, ricavi, profitto
- 👥 **Database clienti** - Gestione clienti con informazioni di contatto, dettagli aziendali e statistiche delle offerte
- 🔒 **Crittografia dati clienti** - Crittografia AES-256-GCM per dati clienti, protezione dati conforme GDPR/UE, protezione password opzionale
- 📊 **Storico e tendenze dei prezzi** - Tracciamento delle variazioni di prezzo del filamento con grafici e statistiche
- 🌍 **Multilingue** - Traduzione completa in ungherese, inglese, tedesco, francese, cinese semplificato, ceco, spagnolo, italiano, polacco, portoghese, slovacco, ucraino e russo (14 lingue, 850+ chiavi di traduzione per lingua)
- 💱 **Valute multiple** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 valute)
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

## 🌿 Struttura branch

- **`main`**: Versioni di release stabili (build RELEASE)
- **`beta`**: Versioni beta e sviluppo (build BETA)

Quando si fa push al branch `beta`, il workflow GitHub Actions viene eseguito automaticamente, compilando la versione beta.

## 📋 Cronologia delle versioni

For detailed version history and changelog, please see [RELEASE.it.md](RELEASE.it.md).

---

**Versione**: 1.6.0

Se hai domande o trovi un bug, per favore apri un issue nel repository GitHub!

