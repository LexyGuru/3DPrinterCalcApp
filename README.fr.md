# 🖨️ 3D Printer Calculator App

> **🌍 Sélection de la langue**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md)

Une application desktop moderne pour calculer les coûts d'impression 3D. Construite avec Tauri v2, frontend React et backend Rust.

## ✨ Fonctionnalités

- 📊 **Calcul des coûts** - Calcul automatique des coûts de filament, électricité, séchage et usure
- 🧵 **Gestion des filaments** - Ajouter, modifier, supprimer des filaments (marque, type, couleur, prix)
- 🖨️ **Gestion des imprimantes** - Gérer les imprimantes et systèmes AMS
- 💰 **Calcul du profit** - Pourcentage de profit sélectionnable (10%, 20%, 30%, 40%, 50%)
- 📄 **Devis** - Enregistrer, gérer et exporter des devis PDF (nom du client, contact, description)
- 🧠 **Préréglages de filtres** - Enregistrer les filtres de devis, appliquer des préréglages rapides, filtres automatiques basés sur date/heure
- 🗂️ **Tableau de bord d'état** - Cartes d'état, filtres rapides et chronologie des changements d'état récents
- 📝 **Notes d'état** - Chaque changement d'état avec notes optionnelles et enregistrement de l'historique
- 👁️ **Aperçu PDF et modèles** - Aperçu PDF intégré, modèles sélectionnables et blocs de marque d'entreprise
- 🎨 **Bibliothèque de couleurs de filament** - Plus de 2000 couleurs d'usine avec panneaux sélectionnables basés sur marque et type
- 💾 **Éditeur de bibliothèque de filaments** - Ajout/modification basé sur modal, avertissements de doublons et sauvegarde persistante dans `filamentLibrary.json`
- 🖼️ **Images de filament dans PDF** - Afficher les logos de filament et échantillons de couleur dans les PDF générés
- 🧾 **Importation G-code et création de brouillon** - Charger les exportations G-code/JSON (Prusa, Cura, Orca, Qidi) depuis modal dans la calculatrice, avec résumé détaillé et génération automatique de brouillon de devis
- 📈 **Statistiques** - Tableau de bord de résumé pour consommation de filament, revenus, profit
- 🌍 **Multilingue** - Traduction complète en hongrois, anglais, allemand, français, chinois simplifié, tchèque, espagnol, italien, polonais, portugais et slovaque (12 langues, 813 clés de traduction par langue)
- 💱 **Plusieurs devises** - EUR, HUF, USD
- 🔄 **Mises à jour automatiques** - Vérifie GitHub Releases pour nouvelles versions
- 🧪 **Versions bêta** - Support de branche bêta et build bêta
- ⚙️ **Vérification bêta** - Vérification configurable des versions bêta
- 🎨 **Mise en page responsive** - Tous les éléments de l'application s'adaptent dynamiquement à la taille de la fenêtre
- ✅ **Dialogues de confirmation** - Demande de confirmation avant suppression
- 🔔 **Notifications toast** - Notifications après opérations réussies
- 🔍 **Recherche et filtrage** - Rechercher filaments, imprimantes et devis
- 🔎 **Comparaison de prix en ligne** - Un clic ouvre les résultats de recherche Google/Bing pour le filament sélectionné, prix instantanément actualisable
- 📋 **Duplication** - Duplication facile des devis
- 🖱️ **Glisser-déposer** - Réorganiser devis, filaments et imprimantes en glissant
- 📱 **Menus contextuels** - Menus clic droit pour actions rapides (modifier, supprimer, dupliquer, exporter)

## 📸 Captures d'écran

L'application comprend:
- Tableau de bord d'accueil avec statistiques
- Gestion des filaments
- Gestion des imprimantes
- Calculatrice de calcul des coûts
- Liste des devis et vue détaillée
- Tableau de bord d'état et chronologie
- Export PDF et aperçu intégré

## 🚀 Installation

### Prérequis

- **Rust**: [Installer Rust](https://rustup.rs/)
- **Node.js**: [Installer Node.js](https://nodejs.org/) (version 20+)
- **pnpm**: `npm install -g pnpm`
- **Tauri CLI**: `cargo install tauri-cli`

### Spécifique à macOS

```bash
# Xcode Command Line Tools
xcode-select --install
```

### Spécifique à Linux (Ubuntu/Debian)

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

### Spécifique à Windows

- Visual Studio Build Tools (outils de compilation C++)
- Windows SDK

## 📦 Compilation

### Exécution en mode développement

```bash
cd src-tauri
cargo tauri dev
```

### Build de production (Créer application standalone)

```bash
cd src-tauri
cargo tauri build
```

L'application standalone sera située à:
- **macOS**: `src-tauri/target/release/bundle/macos/3DPrinterCalcApp.app`
- **Linux**: `src-tauri/target/release/bundle/deb/` ou `appimage/`
- **Windows**: `src-tauri/target/release/bundle/msi/`

### Build bêta

Le projet inclut une branche `beta` configurée pour des builds séparés:

```bash
# Passer à la branche bêta
git checkout beta

# Build bêta local
./build-frontend.sh
cd src-tauri
cargo tauri build
```

Le build bêta définit automatiquement la variable `VITE_IS_BETA=true`, donc "BETA" apparaît dans le menu.

**GitHub Actions**: Lors du push vers la branche `beta`, le workflow `.github/workflows/build-beta.yml` s'exécute automatiquement, compilant la version bêta pour les trois plateformes.

Guide détaillé: [BUILD.md](BUILD.md) et [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md)

## 💻 Développement

### Structure du projet

```
3DPrinterCalcApp/
├── frontend/          # Frontend React + TypeScript
│   ├── src/
│   │   ├── components/    # Composants React
│   │   ├── utils/        # Fonctions auxiliaires
│   │   └── types.ts      # Types TypeScript
│   └── package.json
├── src-tauri/         # Backend Rust
│   ├── src/           # Code source Rust
│   ├── Cargo.toml     # Dépendances Rust
│   └── tauri.conf.json # Configuration Tauri
└── README.md
```

### Développement frontend

```bash
cd frontend
pnpm install
pnpm dev
```

### Dépendances

**Frontend:**
- React 19
- TypeScript
- Vite

**Backend:**
- Tauri v2
- tauri-plugin-store (stockage de données)
- tauri-plugin-log (journalisation)

## 📖 Utilisation

1. **Ajouter une imprimante**: Menu Imprimantes → Ajouter une nouvelle imprimante
2. **Ajouter un filament**: Menu Filaments → Ajouter un nouveau filament
3. **Calculer le coût**: Menu Calculatrice → Sélectionner imprimante et filaments
4. **Enregistrer un devis**: Cliquer sur le bouton "Enregistrer comme devis" dans la calculatrice
5. **Exporter PDF**: Menu Devis → Sélectionner un devis → Exporter PDF
6. **Vérifier les versions bêta**: Menu Paramètres → Activer l'option "Vérifier les mises à jour bêta"

## 🔄 Gestion des versions et mises à jour

L'application vérifie automatiquement GitHub Releases pour nouvelles versions:

- **Au démarrage**: Vérifie automatiquement les mises à jour
- **Toutes les 5 minutes**: Vérifie automatiquement à nouveau
- **Notification**: Si une nouvelle version est disponible, une notification apparaît dans le coin supérieur droit

### Vérification des versions bêta

Pour vérifier les versions bêta:

1. Allez dans le menu **Paramètres**
2. Activez l'option **"Vérifier les mises à jour bêta"**
3. L'application vérifie immédiatement les versions bêta
4. Si une version bêta plus récente est disponible, une notification apparaît
5. Cliquez sur le bouton "Télécharger" pour aller à la page GitHub Release

**Exemple**: Si vous utilisez une version RELEASE (ex: 0.1.0) et activez la vérification bêta, l'application trouve la dernière version bêta (ex: 0.2.0-beta) et vous notifie s'il y en a une plus récente.

Guide détaillé: [VERSIONING.md](VERSIONING.md)

## 🛠️ Stack technologique

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Rust, Tauri v2
- **Stockage de données**: Tauri Store Plugin (fichiers JSON)
- **Style**: Styles inline (commonStyles)
- **i18n**: Système de traduction personnalisé
- **CI/CD**: GitHub Actions (builds automatiques pour macOS, Linux, Windows)
- **Gestion des versions**: Intégration API GitHub Releases

## 📝 Licence

Ce projet est sous licence **MIT**, cependant **l'utilisation commerciale nécessite une autorisation**.

Copyright complet de l'application: **Lekszikov Miklós (LexyGuru)**

- ✅ **Utilisation personnelle et éducative**: Autorisée
- ❌ **Utilisation commerciale**: Uniquement avec autorisation écrite explicite

Détails: fichier [LICENSE](LICENSE)

## 👤 Auteur

Lekszikov Miklós (LexyGuru)

## 🙏 Remerciements

- [Tauri](https://tauri.app/) - Le framework d'applications desktop multiplateforme
- [React](https://react.dev/) - Le framework frontend
- [Vite](https://vitejs.dev/) - L'outil de build

## 📚 Documentation supplémentaire

- [BUILD.md](BUILD.md) - Guide détaillé de build pour toutes les plateformes
- [HOW_TO_BUILD_APP.md](HOW_TO_BUILD_APP.md) - Créer une application standalone
- [VERSIONING.md](VERSIONING.md) - Gestion des versions et mises à jour
- [CREATE_FIRST_RELEASE.md](CREATE_FIRST_RELEASE.md) - Créer le premier GitHub Release

## 🌿 Structure des branches

- **`main`**: Versions de release stables (build RELEASE)
- **`beta`**: Versions bêta et développement (build BETA)

Lors du push vers la branche `beta`, le workflow GitHub Actions s'exécute automatiquement, compilant la version bêta.

## 📋 Historique des versions

### v0.5.56 (2025)
- 🌍 **Traductions linguistiques complètes** – Terminées les traductions complètes pour 6 fichiers linguistiques restants: tchèque (cs), espagnol (es), italien (it), polonais (pl), portugais (pt) et slovaque (sk). Chaque fichier contient toutes les 813 clés de traduction, donc l'application est maintenant entièrement prise en charge dans ces langues.
- 🔒 **Correction des permissions Tauri** – Le fichier `update_filamentLibrary.json` est maintenant explicitement activé pour les opérations de lecture, écriture et création dans le fichier de capacités Tauri, garantissant que les mises à jour de la bibliothèque de filaments fonctionnent de manière fiable.

### v0.5.55 (2025)
- 🧵 **Amélioration de l'édition des devis** – Les devis enregistrés permettent maintenant la sélection ou modification directe de l'imprimante, avec coûts recalculés automatiquement avec les changements de filament.
- 🧮 **Précision et journalisation** – La journalisation détaillée aide à suivre les étapes du calcul des coûts (filament, électricité, séchage, utilisation), facilitant la recherche d'erreurs dans les fichiers G-code importés.
- 🌍 **Ajouts de traduction** – Nouvelles clés et étiquettes i18n ajoutées pour le sélecteur d'imprimante, garantissant une UI d'éditeur cohérente dans toutes les langues prises en charge.
- 📄 **Mise à jour de la documentation** – README étendu avec description des nouvelles fonctionnalités, release v0.5.55 ajoutée à l'historique des versions.

---

**Version**: 0.5.56

Si vous avez des questions ou trouvez un bug, veuillez ouvrir une issue dans le dépôt GitHub!

