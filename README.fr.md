# 🖨️ 3D Printer Calculator App

> **🌍 Sélection de la langue**
> 
> [🇬🇧 English](README.en.md) | [🇭🇺 Magyar](README.hu.md) | [🇩🇪 Deutsch](README.de.md) | [🇪🇸 Español](README.es.md) | [🇮🇹 Italiano](README.it.md) | [🇵🇱 Polski](README.pl.md) | [🇨🇿 Čeština](README.cs.md) | [🇸🇰 Slovenčina](README.sk.md) | [🇵🇹 Português](README.pt.md) | [🇫🇷 Français](README.fr.md) | [🇨🇳 中文](README.zh.md) | [🇺🇦 Українська](README.uk.md) | [🇷🇺 Русский](README.ru.md)

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
- 👥 **Base de données clients** - Gestion des clients avec informations de contact, détails d'entreprise et statistiques d'offres
- 📊 **Historique et tendances des prix** - Suivi des changements de prix de filament avec graphiques et statistiques
- 🌍 **Multilingue** - Traduction complète en hongrois, anglais, allemand, français, chinois simplifié, tchèque, espagnol, italien, polonais, portugais, slovaque, ukrainien et russe (14 langues, 850+ clés de traduction par langue)
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
- 🍎 **Fonctionnalités spécifiques à la plateforme** - Badge Dock macOS, notifications natives, intégration de la barre d'état système

## 📋 Journal des modifications (Changelog)

### v1.0.0 (2025) - 🎉 Première version stable

- 🎨 **Composants UI modernes** - Refonte complète de l'UI avec des composants modernes:
  - Composant Empty State pour une meilleure expérience utilisateur
  - Composant Card avec effets de survol
  - Composant Progress Bar pour les opérations d'export/import PDF
  - Composant Tooltip avec intégration de thème
  - Navigation Breadcrumb pour une hiérarchie de pages claire
- ⚡ **Actions rapides** - Boutons d'action rapide dans l'en-tête pour un workflow plus rapide:
  - Boutons d'ajout rapide pour Filaments, Imprimantes et Clients
  - Boutons dynamiques basés sur la page active
  - Intégration des raccourcis clavier
- 🔍 **Recherche globale (Command Palette)** - Fonctionnalité de recherche puissante:
  - `Ctrl/Cmd+K` pour ouvrir la recherche globale
  - Recherche de pages et d'actions rapides
  - Navigation au clavier (↑↓, Enter, Esc)
  - Style adapté au thème
- ⏪ **Fonctionnalité Annuler/Rétablir** - Gestion de l'historique pour Filaments:
  - `Ctrl/Cmd+Z` pour annuler
  - `Ctrl/Cmd+Shift+Z` pour rétablir
  - Boutons visuels annuler/rétablir dans l'UI
  - Support d'historique de 50 étapes
- ⭐ **Filaments favoris** - Marquer et filtrer les filaments favoris:
  - Icône étoile pour basculer le statut favori
  - Filtre pour afficher uniquement les favoris
  - État favori persistant
- 📦 **Opérations en masse** - Gestion efficace en masse:
  - Sélection par case à cocher pour plusieurs filaments
  - Fonctionnalité Tout sélectionner / Tout désélectionner
  - Suppression en masse avec dialogue de confirmation
  - Indicateurs de sélection visuels
- 🎨 **Dialogues modaux** - Expérience modale moderne:
  - Modals avec arrière-plan flou pour les formulaires d'ajout/édition
  - Champs de saisie de taille fixe
  - Touche Échap pour fermer
  - Animations fluides avec framer-motion
- ⌨️ **Raccourcis clavier** - Système de raccourcis amélioré:
  - Raccourcis clavier personnalisables
  - Dialogue d'aide des raccourcis (`Ctrl/Cmd+?`)
  - Édition des raccourcis avec capture de touches
  - Stockage persistant des raccourcis
- 📝 **Système de journalisation** - Journalisation complète:
  - Fichiers de journal séparés pour le frontend et le backend
  - Résolution de répertoire de journal indépendante de la plateforme
  - Rotation automatique des journaux
  - Intégration console
- 🔔 **Améliorations des notifications** - Meilleur système de notifications:
  - Nom du client dans les notifications de suppression d'offre
  - Support de notifications multiplateforme
  - Gestion d'erreurs améliorée
- 🎯 **Améliorations UI/UX**:
  - Tailles de champs de saisie fixes
  - Meilleures mises en page de formulaires
  - Intégration de thème améliorée
  - Accessibilité améliorée

### v0.6.0 (2025)

#### 🐛 Corrections de bugs
- **Optimisation de la journalisation**: Réduction de la journalisation excessive et dupliquée
  - Les journaux informatifs n'apparaissent qu'en mode développement (DEV)
  - Les erreurs sont toujours journalisées dans les builds de production
  - L'initialisation de FilamentLibrary se fait silencieusement
- **Correction des avertissements faux**: La résolution de couleur de filament n'avertit que lorsque la bibliothèque est déjà chargée et que la couleur n'est toujours pas trouvée
  - Empêche les avertissements faux pendant le chargement asynchrone de la bibliothèque
  - Les avertissements n'apparaissent que pour les vrais problèmes
- **Correction de la duplication du vérificateur de mises à jour**: Suppression des appels de vérification de mises à jour dupliqués
- **Correction de la journalisation des raccourcis clavier**: Journalise uniquement lorsqu'un raccourci existe, ignore les combinaisons invalides

#### ⚡ Améliorations des performances
- Journalisation des opérations de stockage optimisée (mode DEV uniquement)
- Moins d'opérations de console dans les builds de production
- Sortie de console plus propre pendant le développement

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

### v0.6.0 (2025)

- 👥 **Base de données clients** - Système complet de gestion des clients avec:
  - Ajouter, modifier, supprimer des clients
  - Informations de contact (e-mail, téléphone)
  - Détails d'entreprise (optionnel)
  - Adresse et notes
  - Statistiques des clients (total des offres, date de la dernière offre)
  - Fonctionnalité de recherche
  - Intégration avec la Calculatrice pour la sélection rapide de clients
- 📊 **Historique et tendances des prix** - Suivi des changements de prix de filament:
  - Suivi automatique de l'historique des prix lors de la mise à jour des prix de filament
  - Visualisation des tendances de prix avec des graphiques SVG
  - Statistiques de prix (prix actuel, moyen, min, max)
  - Analyse des tendances (croissant, décroissant, stable)
  - Tableau de l'historique des prix avec des informations détaillées sur les changements
  - Avertissements pour les changements de prix significatifs (changements de 10%+)
  - Affichage de l'historique des prix dans le composant Filaments pendant l'édition
- 🔧 **Améliorations**:
  - Calculatrice améliorée avec menu déroulant de sélection de clients
  - Intégration de l'historique des prix dans le formulaire d'édition de filament
  - Persistance des données améliorée pour les clients et l'historique des prix

### v0.5.58 (2025)
- 🌍 **Support des langues ukrainienne et russe** – Ajout du support complet de traduction pour l'ukrainien (uk) et le russe (ru):
  - Fichiers de traduction complets avec toutes les 813 clés de traduction pour les deux langues
  - Support de locale ukrainienne (uk-UA) pour le formatage date/heure
  - Support de locale russe (ru-RU) pour le formatage date/heure
  - Tous les fichiers README mis à jour avec les nouvelles langues dans le menu des langues
  - Nombre de langues mis à jour de 12 à 14 langues
  - Fichiers de documentation README.uk.md et README.ru.md créés

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
- 🌍 **Traductions linguistiques complètes** – Terminées les traductions complètes pour 6 fichiers linguistiques restants: tchèque (cs), espagnol (es), italien (it), polonais (pl), portugais (pt) et slovaque (sk). Chaque fichier contient toutes les 813 clés de traduction, donc l'application est maintenant entièrement prise en charge dans ces langues.
- 🔒 **Correction des permissions Tauri** – Le fichier `update_filamentLibrary.json` est maintenant explicitement activé pour les opérations de lecture, écriture et création dans le fichier de capacités Tauri, garantissant que les mises à jour de la bibliothèque de filaments fonctionnent de manière fiable.

### v0.5.55 (2025)
- 🧵 **Amélioration de l'édition des devis** – Les devis enregistrés permettent maintenant la sélection ou modification directe de l'imprimante, avec coûts recalculés automatiquement avec les changements de filament.
- 🧮 **Précision et journalisation** – La journalisation détaillée aide à suivre les étapes du calcul des coûts (filament, électricité, séchage, utilisation), facilitant la recherche d'erreurs dans les fichiers G-code importés.
- 🌍 **Ajouts de traduction** – Nouvelles clés et étiquettes i18n ajoutées pour le sélecteur d'imprimante, garantissant une UI d'éditeur cohérente dans toutes les langues prises en charge.
- 📄 **Mise à jour de la documentation** – README étendu avec description des nouvelles fonctionnalités, release v0.5.55 ajoutée à l'historique des versions.

### v0.5.11 (2025)
- 🗂️ **Modularisation linguistique** – Expansion de l'application avec des fichiers de traduction organisés dans un nouveau répertoire `languages/`, facilitant l'ajout de nouvelles langues et la gestion des textes existants.
- 🌍 **Traductions UI unifiées** – L'interface d'importation du slicer fonctionne maintenant depuis le système de traduction central, tous les boutons, messages d'erreur et résumés sont localisés.
- 🔁 **Mise à jour du sélecteur de langue** – Dans Paramètres, le sélecteur de langue se charge en fonction des fichiers linguistiques découverts, donc à l'avenir il suffit d'ajouter un nouveau fichier linguistique.
- 🌐 **Nouvelles bases linguistiques** – Fichiers de traduction préparés pour le français, l'italien, l'espagnol, le polonais, le tchèque, le slovaque, le portugais brésilien et le chinois simplifié (avec fallback anglais), les traductions réelles peuvent être facilement remplies.

### v0.5.0 (2025)
- 🔎 **Bouton de comparaison de prix de filament** – Chaque filament personnalisé a maintenant une icône de loupe qui ouvre la recherche Google/Bing basée sur marque/type/couleur, fournissant des liens rapides vers les prix actuels.
- 💶 **Support de prix décimal** – Les champs de prix de filament acceptent maintenant les décimales (14.11 € etc.), la saisie est automatiquement validée et formatée lors de la sauvegarde.
- 🌐 **Recherche inversée fallback** – Si le shell Tauri ne peut pas ouvrir le navigateur, l'application ouvre automatiquement un nouvel onglet, donc la recherche fonctionne sur toutes les plateformes.

### v0.4.99 (2025)
- 🧾 **Importation G-code intégrée dans la calculatrice** – Nouveau modal `SlicerImportModal` en haut de la calculatrice qui charge les exportations G-code/JSON en un clic, transférant le temps d'impression, la quantité de filament et créant un brouillon de devis.
- 📊 **Données du slicer depuis l'en-tête** – Les valeurs de l'en-tête G-code `total filament weight/length/volume` prennent automatiquement les résumés, gérant précisément les pertes de changement de couleur.

### v0.4.98 (2025)
- 🧵 **Support de filament multicolore** – La bibliothèque de filaments et l'UI de gestion marquent maintenant séparément les filaments multicolores (arc-en-ciel/dual/tricolor) avec des notes et un aperçu arc-en-ciel.
- 🌐 **Traduction automatique lors de l'importation CSV** – Les noms de couleurs importés d'une base de données externe reçoivent des étiquettes hongroises et allemandes, gardant le sélecteur de couleurs multilingue sans modification manuelle.
- 🔄 **Fusion de la bibliothèque de mise à jour** – Le contenu du fichier `update_filamentLibrary.json` est automatiquement dédupliqué et fusionné avec la bibliothèque existante au démarrage, sans écraser les modifications de l'utilisateur.
- 📁 **Mise à jour du convertisseur CSV** – Le script `convert-filament-csv.mjs` ne remplace plus le `filamentLibrary.json` persistant, crée plutôt un fichier de mise à jour et génère des étiquettes multilingues.
- ✨ **Réglage de l'expérience d'animation** – Nouvelles options de transition de page (flip, parallax), sélecteur de style de microinteraction, retour pulsant, liste squelette de la bibliothèque de filaments et effets hover de carte affinés.
- 🎨 **Extensions de l'atelier de thèmes** – Quatre nouveaux thèmes intégrés (Forest, Pastel, Charcoal, Midnight), duplication instantanée du thème actif pour édition personnalisée, gestion améliorée du gradient/contraste et processus de partage simplifié.

### v0.4.0 (2025)
- 🧵 **Intégration de base de données de filaments** – Plus de 2 000 couleurs d'usine de la bibliothèque JSON intégrée (instantané filamentcolors.xyz), organisées par marque et matériau
- 🪟 **Panneaux de sélection de taille fixe** – Listes de marque et type ouvertes par bouton, recherchables, défilables qui s'excluent mutuellement, rendant le formulaire plus transparent
- 🎯 **Améliorations du sélecteur de couleurs** – Lorsque les éléments de la bibliothèque sont reconnus, la finition et le code hex sont définis automatiquement, champs séparés disponibles lors du passage en mode personnalisé
- 💾 **Éditeur de bibliothèque de filaments** – Nouvel onglet de paramètres avec formulaire popup, gestion des doublons et sauvegarde persistante `filamentLibrary.json` basée sur Tauri FS
- 📄 **Mise à jour de la documentation** – Nouvelle puce dans la liste principale des fonctionnalités pour la bibliothèque de couleurs de filaments, nettoyage README/FEATURE_SUGGESTIONS

### v0.3.9 (2025)
- 🔍 **Préréglages de filtre de devis** – Paramètres de filtre sauvegardables et nommables, préréglages rapides par défaut (Aujourd'hui, Hier, Hebdomadaire, Mensuel etc.) et application/suppression en un clic
- 📝 **Notes de changement de statut** – Nouveau modal pour modification du statut du devis avec note optionnelle stockée dans l'historique du statut
- 🖼️ **Extension d'exportation PDF** – Les images stockées avec les filaments apparaissent dans le tableau PDF avec style optimisé pour l'impression
- 🧾 **Feuille de données de marque d'entreprise** – Nom de l'entreprise, adresse, ID fiscal, compte bancaire, contact et téléchargement de logo; inclus automatiquement dans l'en-tête PDF
- 🎨 **Sélecteur de modèle PDF** – Trois styles (Moderne, Minimaliste, Professionnel) à choisir pour l'apparence du devis
- 👁️ **Aperçu PDF intégré** – Bouton séparé aux détails du devis pour vérification visuelle instantanée avant l'exportation
- 📊 **Tableau de bord du statut** – Cartes de statut avec résumé, filtres de statut rapides et chronologie des changements de statut récents dans les devis
- 📈 **Graphiques statistiques** – Graphique de tendance revenus/coût/profit, graphique en camembert de distribution de filaments, graphique en barres de revenus par imprimante, tout exportable au format SVG/PNG et peut également être sauvegardé en PDF

### v0.3.8 (2025)
- 🐛 **Correction du formatage des nombres du rapport** - Formatage à 2 décimales dans les rapports:
  - Cartes de statistiques principales (Revenus, Dépenses, Profit, Devis): `formatNumber(formatCurrency(...), 2)`
  - Valeurs au-dessus des graphiques: `formatNumber(formatCurrency(...), 2)`
  - Statistiques détaillées (Profit moyen/devis): `formatNumber(formatCurrency(...), 2)`
  - Maintenant cohérent avec la page d'accueil (ex. `6.45` au lieu de `6.45037688333333`)
- 🎨 **Correction de la navigation des onglets des paramètres** - Améliorations de couleur de fond et de texte:
  - Fond de la section de navigation des onglets: `rgba(255, 255, 255, 0.85)` pour les thèmes dégradés + `blur(10px)`
  - Fonds des boutons d'onglet: Actif `rgba(255, 255, 255, 0.9)`, inactif `rgba(255, 255, 255, 0.7)` pour les thèmes dégradés
  - Couleur du texte des boutons d'onglet: `#1a202c` (sombre) pour les thèmes dégradés pour la lisibilité
  - Effets hover: `rgba(255, 255, 255, 0.85)` pour les thèmes dégradés
  - Filtre de fond: `blur(8px)` pour les boutons d'onglet, `blur(10px)` pour la section de navigation

### v0.3.7 (2025)
- 🎨 **Modernisation du design** - Transformation visuelle complète avec animations et nouveaux thèmes:
  - Nouveaux thèmes: Gradient, Neon, Cyberpunk, Sunset, Ocean (5 nouveaux thèmes modernes)
  - Animations Framer Motion intégrées (fadeIn, slideIn, stagger, effets hover)
  - Effet glassmorphism pour les thèmes dégradés (flou + fond transparent)
  - Effet de lueur néon pour les thèmes néon/cyberpunk
  - Cartes et surfaces modernisées (padding plus grand, coins arrondis, meilleures ombres)
- 🎨 **Améliorations de couleur** - Meilleur contraste et lisibilité pour tous les thèmes:
  - Texte sombre (#1a202c) sur fond blanc/clair pour les thèmes dégradés
  - Champs de saisie, étiquettes, coloration h3 améliorée dans tous les composants
  - Gestion de couleur cohérente sur toutes les pages (Filaments, Printers, Calculator, Offers, Settings, Console)
  - Ombre de texte ajoutée pour les thèmes dégradés pour une meilleure lisibilité
- 📊 **Améliorations de style de tableau** - Fond plus flou et meilleur contraste de texte:
  - Couleur de fond: rgba(255, 255, 255, 0.85) pour les thèmes dégradés (précédemment 0.95)
  - Filtre de fond: blur(8px) pour un effet plus flou
  - Couleur du texte: #333 (gris foncé) pour les thèmes dégradés pour une meilleure lisibilité
  - Fonds de cellules: rgba(255, 255, 255, 0.7) pour un effet plus flou
- 🎨 **Améliorations de couleur de fond des cartes** - Fond plus flou, meilleure lisibilité:
  - Couleur de fond: rgba(255, 255, 255, 0.75) pour les thèmes dégradés (précédemment 0.95)
  - Filtre de fond: blur(12px) pour un flou plus fort
  - Opacité: 0.85 pour un effet mat
  - Couleur du texte: #1a202c (sombre) pour les thèmes dégradés
- 📈 **Modernisation de la page d'accueil** - Statistiques hebdomadaires/mensuelles/annuelles et comparaison de périodes:
  - Cartes de comparaison de périodes (Hebdomadaire, Mensuel, Annuel) avec barres d'accent colorées
  - Composants StatCard modernisés (icônes avec fonds colorés, barres d'accent)
  - Section résumé organisée en cartes avec icônes
  - Section de comparaison de périodes ajoutée
- 🐛 **Correction du filtre de date** - Filtrage de période plus précis:
  - Réinitialisation du temps (00:00:00) pour une comparaison précise
  - Limite supérieure définie (aujourd'hui est inclus)
  - Hebdomadaire: 7 derniers jours (aujourd'hui inclus)
  - Mensuel: 30 derniers jours (aujourd'hui inclus)
  - Annuel: 365 derniers jours (aujourd'hui inclus)
- 🎨 **Modernisation de la barre latérale** - Icônes, glassmorphism, effets de lueur néon
- 🎨 **Modernisation de ConfirmDialog** - Prop de thème ajoutée, coloration harmonisée

### v0.3.6 (2025)
- 🎨 **Réorganisation de l'UI des paramètres** - Système d'onglets (Général, Apparence, Avancé, Gestion des données) pour une meilleure UX et une navigation plus propre
- 🌐 **Améliorations de traduction** - Tout le texte hongrois codé en dur traduit dans tous les composants (HU/EN/DE):
  - Calculator: "calcul des coûts d'impression 3D"
  - Filaments: "Gérer et modifier les filaments"
  - Printers: "Gérer les imprimantes et systèmes AMS"
  - Offers: "Gérer et exporter les devis sauvegardés"
  - Home: Titres de statistiques, résumé, étiquettes d'exportation CSV (heure/Std/hrs, pcs/Stk/pcs)
  - VersionHistory: "Aucun historique de versions disponible"
- 💾 **Système de cache d'historique des versions** - Sauvegarde physique dans localStorage, vérification GitHub toutes les 1 heure:
  - Détection de changements basée sur checksum (télécharge uniquement sur nouveaux releases)
  - Cache séparé par langue (Hongrois/Anglais/Allemand)
  - Changement de langue rapide depuis le cache (pas de retraduction)
  - Invalidation automatique du cache sur nouveau release
- 🌐 **Traduction intelligente** - Traduit uniquement les nouveaux releases, utilise les anciennes traductions du cache:
  - Validation du cache (ne pas mettre en cache si même texte)
  - API MyMemory fallback si la traduction échoue
  - Auto-reset du compteur d'erreurs (se réinitialise après 5 minutes)
  - MAX_CONSECUTIVE_ERRORS: 10, MAX_RETRIES: 2
- 🔧 **LibreTranslate supprimé** - Utilisation uniquement de l'API MyMemory (erreurs 400 éliminées, requête GET, pas de CORS)
- 🔄 **Refactorisation du bouton de réessai** - Mécanisme de déclenchement plus simple avec useEffect
- 🐛 **Corrections d'erreurs de compilation** - Problèmes d'indentation JSX corrigés (section Export/Import Settings.tsx)

### v0.3.5 (2025)
- ✅ **Intégration de l'API MyMemory** - API de traduction gratuite au lieu de LibreTranslate
- ✅ **Ouverture de la page des releases GitHub** - Bouton pour ouvrir la page des releases GitHub en cas de limite de débit
- ✅ **Amélioration de la gestion des erreurs de limite de débit** - Messages d'erreur clairs et bouton de réessai
- 🐛 **Corrections d'erreurs de compilation** - Imports non utilisés supprimés (offerCalc.ts)

### v0.3.4 (2025)
- ✅ **Amélioration de la validation des entrées** - Utilitaire de validation central créé et intégré dans les composants Calculator, Filaments, Printers
- ✅ **Messages d'erreur de validation** - Messages d'erreur multilingues (HU/EN/DE) avec notifications toast
- ✅ **Optimisation des performances** - Composants lazy loading (division du code), optimisation useMemo et useCallback
- ✅ **Initialisation spécifique à la plateforme** - Fondamentaux d'initialisation spécifique à la plateforme macOS, Windows, Linux
- 🐛 **Correction d'erreur de compilation** - Fonctions de menu contextuel Printers.tsx ajoutées

### v0.3.3 (2025)
- 🖱️ **Fonctionnalités de glisser-déposer** - Réorganiser les devis, filaments et imprimantes en glissant
- 📱 **Menus contextuels** - Menus de clic droit pour actions rapides (modifier, supprimer, dupliquer, exporter PDF)
- 🎨 **Retour visuel** - Changement d'opacité et de curseur pendant le glisser-déposer
- 🔔 **Notifications toast** - Notifications après réorganisation
- 🐛 **Correction d'erreur de compilation** - Correction Calculator.tsx theme.colors.error -> theme.colors.danger

### v0.3.2 (2025)
- 📋 **Fonctionnalités de modèle** - Sauvegarder et charger les calculs comme modèles dans le composant Calculator
- 📜 **Historique/Versioning pour les devis** - Versioning des devis, voir l'historique, suivre les changements
- 🧹 **Correction de duplication** - Fonctions d'exportation/importation CSV/JSON dupliquées supprimées des composants Filaments et Printers (restées dans Settings)

### v0.3.1 (2025)
- ✅ **Amélioration de la validation des entrées** - Nombres négatifs désactivés, valeurs maximales définies (poids du filament, temps d'impression, puissance, etc.)
- 📊 **Exportation/Importation CSV/JSON** - Exportation/importation en masse de filaments et imprimantes au format CSV et JSON
- 📥 **Boutons Importer/Exporter** - Accès facile aux fonctions d'exportation/importation sur les pages Filaments et Printers
- 🎨 **Amélioration des états vides** - États vides informatifs affichés lorsqu'il n'y a pas de données

### v0.3.0 (2025)
- ✏️ **Édition de devis** - Modifier les devis sauvegardés (nom du client, contact, description, pourcentage de profit, filaments)
- ✏️ **Modifier les filaments dans le devis** - Modifier, ajouter, supprimer les filaments dans le devis
- ✏️ **Bouton d'édition** - Nouveau bouton d'édition à côté du bouton supprimer dans la liste des devis
- 📊 **Fonction d'exportation de statistiques** - Exporter les statistiques au format JSON ou CSV depuis la page d'accueil
- 📈 **Génération de rapports** - Générer des rapports hebdomadaires/mensuels/annuels/tous au format JSON avec filtrage par période
- 📋 **Affichage de l'historique des versions** - Voir l'historique des versions dans les paramètres, intégration de l'API GitHub Releases
- 🌐 **Traduction des releases GitHub** - Traduction automatique Hongrois -> Anglais/Allemand (API MyMemory)
- 💾 **Cache de traduction** - Cache localStorage pour les notes de release traduites
- 🔄 **Historique des versions dynamique** - Versions beta et release affichées séparément
- 🐛 **Corrections de bugs** - Variables non utilisées supprimées, nettoyage du code, erreurs de linter corrigées

### v0.2.55 (2025)
- 🖥️ **Fonction Console/Log** - Nouvel élément de menu Console pour déboguer et voir les logs
- 🖥️ **Paramètre Console** - Peut activer l'affichage de l'élément de menu Console dans les paramètres
- 📊 **Collecte de logs** - Enregistrement automatique de tous les messages console.log, console.error, console.warn
- 📊 **Enregistrement d'erreurs globales** - Enregistrement automatique des événements d'erreur de fenêtre et des rejets de promesse non gérés
- 🔍 **Filtrage des logs** - Filtrer par niveau (all, error, warn, info, log, debug)
- 🔍 **Exportation de logs** - Exporter les logs au format JSON
- 🧹 **Suppression de logs** - Supprimer les logs avec un bouton
- 📜 **Défilement automatique** - Défilement automatique vers les nouveaux logs
- 💾 **Journalisation complète** - Toutes les opérations critiques journalisées (sauvegarder, exporter, importer, supprimer, exporter PDF, télécharger mise à jour)
- 🔄 **Correction du bouton de mise à jour** - Le bouton de téléchargement utilise maintenant le plugin shell Tauri, fonctionne de manière fiable
- 🔄 **Journalisation de la mise à jour** - Journalisation complète de la vérification et du téléchargement de la mise à jour
- ⌨️ **Raccourcis clavier** - `Ctrl/Cmd+N` (nouveau), `Ctrl/Cmd+S` (sauvegarder), `Escape` (annuler), `Ctrl/Cmd+?` (aide)
- ⌨️ **Correction des raccourcis clavier macOS** - Gestion Cmd vs Ctrl, gestion des événements de phase de capture
- ⏳ **États de chargement** - Composant LoadingSpinner pour les états de chargement
- 💾 **Sauvegarde et restauration** - Sauvegarde et restauration complète des données avec dialogue Tauri et plugins fs
- 🛡️ **Limites d'erreur** - React ErrorBoundary pour la gestion des erreurs au niveau de l'application
- 💾 **Sauvegarde automatique** - Sauvegarde automatique avec limitation de temps avec intervalle configurable (par défaut 30 secondes)
- 🔔 **Paramètres de notification** - Notifications toast activées/désactivées et réglage de la durée
- ⌨️ **Menu d'aide des raccourcis** - Liste des raccourcis clavier dans la fenêtre modale (`Ctrl/Cmd+?`)
- 🎬 **Animations et transitions** - Transitions fluides et animations d'images clés (fadeIn, slideIn, scaleIn, pulse)
- 💬 **Tooltips** - Aide contextuelle pour tous les éléments importants au survol
- 🐛 **Correction d'erreur de rendu React** - Opération asynchrone du logger de console pour qu'il ne bloque pas le rendu
- 🔧 **Mise à jour num-bigint-dig** - Mis à jour vers v0.9.1 (correction de l'avertissement de dépréciation)

### v0.2.0 (2025)
- 🎨 **Système de thèmes** - 6 thèmes modernes (Clair, Sombre, Bleu, Vert, Violet, Orange)
- 🎨 **Sélecteur de thème** - Thème sélectionnable dans les paramètres, prend effet immédiatement
- 🎨 **Intégration complète des thèmes** - Tous les composants (Filaments, Printers, Calculator, Offers, Home, Settings, Sidebar) utilisent les thèmes
- 🎨 **Couleurs dynamiques** - Toutes les couleurs codées en dur remplacées par les couleurs du thème
- 🎨 **Thème responsive** - Les devis et le pied de page de la Sidebar utilisent également les thèmes
- 💱 **Conversion de devise dynamique** - Les devis sont maintenant affichés dans la devise des paramètres actuels (conversion automatique)
- 💱 **Changement de devise** - La devise modifiée dans les paramètres affecte immédiatement l'affichage des devis
- 💱 **Conversion de devise PDF** - L'exportation PDF est également créée dans la devise des paramètres actuels
- 💱 **Conversion de prix de filament** - Les prix des filaments sont également convertis automatiquement

### v0.1.85 (2025)
- 🎨 **Améliorations UI/UX**:
  - ✏️ Icônes dupliquées supprimées (Boutons Modifier, Sauvegarder, Annuler)
  - 📐 Sections Exporter/Importer en mise en page 2 colonnes (côte à côte)
  - 💾 Dialogue de sauvegarde natif utilisé pour sauvegarder PDF (dialogue Tauri)
  - 📊 Notifications toast pour sauvegarder PDF (succès/erreur)
  - 🖼️ Taille de la fenêtre de l'application: 1280x720 (précédemment 1000x700)
- 🐛 **Corrections de bugs**:
  - Informations manquantes ajoutées dans la génération PDF (customerContact, profit sur ligne séparée, revenus)
  - Clés de traduction ajoutées (calculator.profit, calculator.revenue, calculator.totalPrice, offers.customerContact, common.close)
- 📄 **Améliorations de l'exportation PDF**:
  - Contact client (email/téléphone) affiché dans le PDF
  - Calcul du profit sur ligne séparée avec pourcentage de profit
  - Revenus (Prix Total) sur ligne séparée, mis en évidence
  - Répartition complète des coûts dans le PDF

### v0.1.56 (2025)
- ✨ **Améliorations de la mise en page de la calculatrice**: Débordement des cartes de filament corrigé, mise en page flexbox responsive
- ✨ **Répartition des coûts responsive**: Répond maintenant dynamiquement aux changements de taille de fenêtre
- 🐛 **Correction de bug**: Le contenu ne déborde pas de la fenêtre lors de l'ajout de filament
- 🐛 **Correction de bug**: Tous les éléments Calculator répondent correctement aux changements de taille de fenêtre

### v0.1.55 (2025)
- ✨ **Dialogues de confirmation**: Confirmation demandée avant suppression (Filaments, Imprimantes, Devis)
- ✨ **Notifications toast**: Notifications après opérations réussies (ajouter, mettre à jour, supprimer)
- ✨ **Validation des entrées**: Nombres négatifs désactivés, valeurs maximales définies
- ✨ **États de chargement**: Spinner de chargement au démarrage de l'application
- ✨ **Limite d'erreur**: Gestion des erreurs au niveau de l'application
- ✨ **Recherche et filtre**: Rechercher filaments, imprimantes et devis
- ✨ **Duplication**: Duplication facile des devis
- ✨ **Formulaires repliables**: Les formulaires d'ajout de filament et d'imprimante sont repliables
- ✨ **Extensions de devis**: Champs de nom du client, contact et description ajoutés
- 🐛 **Nettoyage Console.log**: Aucun console.logs dans la compilation de production
- 🐛 **Correction du champ de description**: Les textes longs s'enroulent correctement.

---

**Version**: 1.0.0

Si vous avez des questions ou trouvez un bug, veuillez ouvrir une issue dans le dépôt GitHub!

