# 📋 Notes de Version - 3DPrinterCalcApp

Ce document contient le journal des modifications détaillé pour toutes les versions de l'application 3D Printer Calculator.

---

## v3.0.3 (2025) - 🔧 Hotfix: Corrections du Chiffrement des Données Clients et Améliorations UI

### 🐛 Corrections de Bugs

#### Corrections du Chiffrement des Données Clients
- **Actions d'offre désactivées pour données chiffrées** - Si les données client sont chiffrées et qu'aucun mot de passe n'est fourni, l'édition, la duplication et le changement de statut des offres sont maintenant désactivés
- **Problème de clé dupliquée corrigé** - Plus d'erreurs "Encountered two children with the same key" dans la liste des offres et l'historique des statuts
- **Correction du compteur d'offres** - Le compteur d'offres client compte maintenant aussi par `customerId`, pas seulement par nom, fonctionnant correctement avec les données chiffrées
- **Actualisation des offres après saisie du mot de passe** - Lorsque le mot de passe est fourni et que les clients sont déchiffrés, les noms des clients dans les offres sont restaurés au lieu de "DONNÉES CHIFFRÉES"
- **Liste d'historique des statuts** - La liste d'historique des statuts affiche maintenant uniquement l'ID client, pas le nom du client, même après la saisie du mot de passe (conforme aux exigences de chiffrement)

#### Améliorations des Messages Toast
- **Prévention des messages toast dupliqués** - Les messages toast n'apparaissent maintenant qu'une seule fois, même s'ils sont appelés plusieurs fois
- **Toast se ferme au clic sur le bouton** - En cliquant sur le bouton "Entrer le mot de passe" dans le message toast, le toast se ferme automatiquement
- **Redesign du message toast** - Les messages toast ont maintenant une apparence plus propre et professionnelle avec une mise en page en colonnes pour les boutons d'action

#### Clés de Traduction Ajoutées
- **Nouvelles clés de traduction** - Ajoutées aux 13 langues:
  - `encryption.passwordRequired` - "Mot de passe de chiffrement requis"
  - `encryption.passwordRequiredForOfferEdit` - "Mot de passe de chiffrement requis pour modifier l'offre"
  - `encryption.passwordRequiredForOfferDuplicate` - "Mot de passe de chiffrement requis pour dupliquer l'offre"
  - `encryption.passwordRequiredForOfferStatusChange` - "Mot de passe de chiffrement requis pour modifier le statut de l'offre"
  - `encryption.passwordRequiredForCustomerCreate` - "Mot de passe de chiffrement requis pour créer un nouveau client"
  - `encryption.passwordRequiredForCustomerEdit` - "Mot de passe de chiffrement requis pour modifier"
  - `encryption.encryptedData` - "DONNÉES CHIFFRÉES"
  - `customers.id` - "ID Client"
  - `customers.encryptedDataMessage` - "🔒 Données chiffrées - mot de passe requis pour voir"

### 📝 Détails Techniques

- **Version mise à jour**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.3`
- **Chaînes hardcodées remplacées**: Toutes les chaînes hardcodées en hongrois remplacées par des clés de traduction
- **Types TypeScript mis à jour**: Nouvelles clés de traduction ajoutées au type `TranslationKey`
- **Toast Provider modifié**: Vérification des toasts dupliqués et fermeture automatique ajoutées
- **Logique d'actualisation des offres**: Actualisation automatique des offres après déchiffrement des clients lorsque le mot de passe est fourni

---

## v3.0.2 (2025) - 🔧 Hotfix: Corrections du Tutoriel, Permissions, Journalisation Factory Reset

### 🐛 Corrections de Bugs

#### Corrections du Tutoriel
- **Préservation des données du tutoriel** - Si le tutoriel a déjà été exécuté une fois, les données existantes ne sont pas supprimées à nouveau
- **Tutoriel étendu à 18 étapes** - Ajouté: Projets, Tâches, Calendrier, étapes de Sauvegarde/Restauration
- **Clés de traduction du tutoriel** - Clés de traduction manquantes ajoutées à tous les fichiers de langue

#### Corrections des Permissions
- **Permissions customers.json** - Permissions ajoutées pour la suppression du fichier `customers.json`

#### Journalisation Factory Reset
- **Écriture du fichier de journal backend** - Les étapes de Factory Reset sont maintenant enregistrées dans le fichier de journal backend
- **Journalisation détaillée** - Chaque étape de Factory Reset est enregistrée en détail
- **Suppression du journal backend restaurée** - Le fichier de journal backend est maintenant supprimé lors du Factory Reset

### 📝 Détails Techniques

- **Version mise à jour**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.2`

---

## v3.0.1 (2025) - 🔧 Hotfix: Factory Reset, Traductions, Beta Build Workflow

### 🐛 Corrections de Bugs

#### Correction du Factory Reset
- **Factory reset corrigé** - Le fichier `customers.json` est maintenant explicitement supprimé lors du factory reset
- **Suppression complète des données client** - Le fichier de données client chiffrées (`customers.json`) est également supprimé, assurant une suppression complète des données

#### Clés de Traduction Manquantes
- **Clé `encryption.noAppPassword` ajoutée** - Clé de traduction manquante ajoutée aux 14 langues
- **Traductions des messages de sauvegarde** - Traductions pour le message "Aucun fichier de sauvegarde automatique pour le moment" ajoutées
- **Traductions de gestion des journaux** - Traductions pour les textes de gestion des journaux et des journaux d'audit ajoutées:
  - `settings.logs.auditLogManagement`
  - `settings.logs.deleteOlderAuditLogs`
  - `settings.logs.folderLocation`
  - `settings.logs.openFolder`
  - `settings.logs.auditLogHistory`
  - `settings.logs.logHistory`
- **Traductions du calendrier** - Traductions pour les noms des mois et des jours ajoutées:
  - `calendar.monthNames`
  - `calendar.dayNames`
  - `calendar.dayNamesShort`
  - `settings.calendar.provider`
- **Description du menu d'aide** - Traductions pour la description "Show Help menu item in Sidebar" ajoutées

#### Correction du Workflow Beta Build
- **Checkout explicite de la branche beta** - Le workflow utilise maintenant explicitement le commit le plus récent de la branche `beta`
- **Correction du commit du tag** - Le tag `beta-v3.0.1` pointe maintenant vers le commit correct (pas l'ancien commit)
- **Correction de la date du code source** - La date "Source code" montre maintenant l'heure de compilation, pas la date de l'ancien commit
- **Étapes de vérification ajoutées** - Vérification Git pull et commit SHA ajoutée au workflow

### 📝 Détails Techniques

- **Version mise à jour**: `Cargo.toml`, `tauri.conf.json`, `frontend/src/utils/version.ts` → `3.0.1`
- **Clés dupliquées supprimées**: Duplications de `settings.logs.openFolder` supprimées de tous les fichiers de langue
- **Types TypeScript mis à jour**: `encryption.noAppPassword` ajouté au type `TranslationKey`

---

## v3.0.0 (2025) - 🔒 Chiffrement des Données Clients & Conformité RGPD + ⚡ Optimisation des Performances

### ⚡ Optimisation des Performances et Code Splitting

#### Documentation et Optimisation de React.lazy()
- **Documentation de l'implémentation React.lazy()** - Documentation complète créée (`docs/PERFORMANCE.md`)
- **Optimisation de la phase de chargement** - Seules les données se chargent pendant la phase de chargement, composants à la demande
- **Optimisation du fallback Suspense** - Composants fallback optimisés dans AppRouter.tsx
- **Error boundary ajouté** - Composant LazyErrorBoundary.tsx pour les composants lazy chargés

#### Code Splitting Basé sur les Routes
- **Intégration React Router** - React Router v7.10.0 installé et configuré
- **Navigation basée sur l'URL** - Structure de routes implémentée (`/settings`, `/offers`, `/customers`, etc.)
- **Lazy loading pour les routes** - Chaque route automatiquement divisée en fichiers séparés
- **Conversion State-based → Routing** - État `activePage` converti en routing basé sur l'URL
- **Pages pouvant être mises en favoris** - Toutes les pages accessibles via URL directe
- **Support de la navigation du navigateur** - Boutons retour/avancer fonctionnent, meilleure UX

#### Ajustement Fin du Code Splitting
- **Optimisation de la configuration de build Vite** - `rollupOptions.output.manualChunks` configuré
- **Optimisation des chunks vendor**:
  - React/React-DOM/React-Router chunk séparé (`vendor-react`)
  - APIs Tauri chunk séparé (`vendor-tauri`)
  - Bibliothèques UI chunks séparés (`vendor-ui-framer`, `vendor-ui-charts`)
  - Autres node_modules (`vendor`)
- **Chunking basé sur les routes** - Lazy loading automatique crée des chunks séparés par route
- **Regroupement des fichiers router** - Organisés en chunks `router`, `routes`
- **Regroupement des composants partagés** - Chunk `components-shared`
- **Limite d'avertissement de taille de chunk** - Fixée à 1000 KB

#### Architecture Modulaire
- **Documentation d'architecture modulaire** - Documentation complète (`docs/MODULAR_ARCHITECTURE.md`)
- **Aliases de chemin** - Aliases `@features`, `@shared`, `@core` configurés
- **Configuration Vite et TypeScript** - Mise à jour avec support des alias de chemin
- **Implémentation des modules partagés**:
  - Composants partagés (ConfirmDialog, FormField, InputField, SelectField, NumberField)
  - Hooks partagés (useModal, useForm)
  - Utilitaires partagés (debounce, format, validation)
- **Refactorisation des modules de fonctionnalités** - Refactorisation complète de 6 modules:
  - Calculator: 582 lignes → 309 lignes (-46.9%)
  - Settings: 5947 lignes → 897 lignes (-85%!)
  - Offers: 3985 lignes → 3729 lignes (-6.4%)
  - Home: 3454 lignes → 3308 lignes (-4.2%)
  - Modules Filaments et Printers également refactorisés

### 🔒 Chiffrement des Données Clients
- **Chiffrement AES-256-GCM** - Stockage chiffré des données clients utilisant l'algorithme standard de l'industrie AES-256-GCM
- **Hachage de mot de passe PBKDF2** - Stockage sécurisé des mots de passe utilisant l'algorithme PBKDF2 (100 000 itérations, SHA-256)
- **Stockage en fichier séparé** - Les données clients chiffrées sont stockées dans un fichier séparé `customers.json`
- **Gestion de mot de passe en mémoire** - Les mots de passe ne sont stockés qu'en mémoire et supprimés à la fermeture de l'application
- **Intégration du mot de passe de l'application** - Optionnel : le mot de passe de protection de l'application peut également être utilisé pour le chiffrement
- **Système de demande de mot de passe** - Demande intelligente de mot de passe (n'apparaît pas sur l'écran de chargement, après le message de bienvenue)
- **Protection de l'intégrité des données** - Données chiffrées protégées contre la suppression accidentelle

### ✅ Protection des Données Conforme au RGPD/UE
- **Conformité** : L'application gère les données clients en conformité avec le RGPD (Règlement Général sur la Protection des Données) et les réglementations de protection des données de l'UE
- **Chiffrement standard de l'industrie** : Utilisation de l'algorithme AES-256-GCM (répond aux recommandations de l'UE)
- **Gestion sécurisée des mots de passe** : Algorithme de hachage PBKDF2 (recommandé par le NIST)
- **Collecte minimale de données** : Stocke uniquement les données clients nécessaires à l'application
- **Rétention des données** : L'utilisateur a un contrôle total sur le stockage et la suppression des données
- **Contrôle d'accès** : Accès protégé par mot de passe aux données clients

### 🎨 Améliorations UI/UX
- **Modal d'activation du chiffrement** - Nouvelle boîte de dialogue modale pour activer le chiffrement avec option de mot de passe d'application
- **Amélioration de ConfirmDialog** - Support de contenu personnalisé pour les composants modaux
- **Temporisation de la demande de mot de passe** - Affichage intelligent (pas sur l'écran de chargement)
- **Intégration des paramètres** - Paramètres de chiffrement dans l'onglet Sécurité

### 🔧 Améliorations Techniques
- **Module de chiffrement backend** - Chiffrement implémenté en Rust (`src-tauri/src/encryption.rs`)
- **Utilitaires de chiffrement frontend** - Fonctions utilitaires TypeScript pour la gestion du chiffrement
- **Gestionnaire de mots de passe** - Système de gestion de mots de passe en mémoire
- **Intégration du stockage** - Fonctions saveCustomers/loadCustomers avec intégration de chiffrement

### 📚 Support Linguistique
- **13 langues mises à jour** - Nouvelles clés de traduction de chiffrement dans tous les fichiers linguistiques
- **Nouvelles clés** : `encryption.enableEncryption`, `encryption.useSamePasswordAsApp`, `encryption.encryptionPassword`, `encryption.passwordMinLength`

---

## v2.0.0 (2025) - 🚀 Surveillance des Performances & Système d'Enregistrement d'Audit

### 🌐 Localisation des Messages de la Console
- **Localisation complète de la console** - Tous les messages de la console sont affichés dans la langue sélectionnée
- **Traduction des opérations de stockage** - Messages de chargement et de sauvegarde (imprimantes, filaments, paramètres, offres, clients, projets, tâches)
- **Traduction des messages de sauvegarde** - Vérification quotidienne de la sauvegarde, création de sauvegarde, messages de rotation
- **Traduction des messages de rotation des journaux** - Messages de rotation des journaux et des journaux d'audit avec parties dynamiques
- **Traduction des métriques de performance** - Métriques CPU et mémoire, messages de journalisation réguliers
- **Traduction des messages système** - Initialisation de l'application, initialisation du journal frontend, message de bienvenue
- **Traduction des messages multi-parties** - Traduction des parties de données des messages de la console (date, horodatage, fichier, informations de statut)
- **Support de 13 langues** - Tous les messages de la console traduits en anglais, hongrois, allemand, espagnol, italien, polonais, portugais, russe, ukrainien, tchèque, slovaque et chinois

### ⚡ Enregistrement des Métriques de Performance
- **Classe Performance Timer** - Chronométrage manuel pour les opérations
- **Mesure du temps de chargement** - Tous les temps de chargement des modules enregistrés (Settings, Printers, Filaments, Offers, Customers)
- **Mesure du temps d'opération** - Chronométrage automatique pour les opérations asynchrones et synchrones
- **Surveillance de l'utilisation de la mémoire** - Suivi et enregistrement de la mémoire heap JavaScript
- **Surveillance de l'utilisation du CPU** - Mesure régulière de l'utilisation du CPU toutes les 5 minutes
- **Résumé des performances** - Statistiques agrégées pour les temps de chargement et d'opération
- **Messages de journal structurés** - Affichage détaillé du pourcentage CPU et des valeurs de mémoire
- **Commandes de performance backend** - Commande backend `get_performance_metrics` pour les données CPU et mémoire

### 🔐 Implémentation du Journal d'Audit
- **Infrastructure de journal d'audit** - Fichier de journal d'audit séparé (`audit-YYYY-MM-DD.json`)
- **Enregistrement des opérations critiques**:
  - Opérations CRUD (Créer/Mettre à jour/Supprimer pour Filaments, Printers, Offers, Customers)
  - Modifications des paramètres (thème, langue, paramètres de journal, sauvegarde automatique, etc.)
  - Opérations de sauvegarde (créer, restaurer)
  - Opérations de Réinitialisation d'Usine
  - Enregistrement des erreurs
- **Visualiseur de Journal d'Audit** - Défilement virtuel pour les fichiers volumineux, avec filtrage, recherche et capacités d'exportation
- **Nettoyage automatique** - Anciens fichiers de journal d'audit supprimés automatiquement selon les jours de rétention configurables
- **Commandes backend** - `write_audit_log`, `list_audit_logs`, `read_audit_log_file`, `delete_old_audit_logs`
- **Localisation complète** - Les 13 langues supportées

### 🎯 Améliorations UI/UX
- **Historique du Journal d'Audit** - Mise en page à deux colonnes dans la section Paramètres → Gestion des Journaux
- **Affichage des métriques de performance** - Dans le modal de Diagnostic Système
- **Mises à jour en temps réel du Visualiseur de Journaux** - Bascule d'auto-actualisation, détection des modifications basée sur le hash
- **Raffinement du défilement automatique** - Conscience de la position de défilement de l'utilisateur

### 🔧 Améliorations Techniques
- **Optimisation de la vérification des mises à jour GitHub** - Au démarrage et toutes les 5 heures (basé sur localStorage)
- **Format de tag bêta** - Tag séparé `beta-v2.0.0` pour les versions bêta (ne remplace pas la version principale)
- **Logique du vérificateur de version** - Recherche de version bêta basée sur le préfixe `beta-v`

---

## v1.9.0 (2025) - 🔍 Diagnostic Système & Améliorations des Performances

### 🔍 Diagnostic Système
- **Outil complet de vérification de l'état du système**:
  - Affichage des informations système (CPU, mémoire, OS, GPU, disque)
  - Validation du système de fichiers (data.json, filamentLibrary.json, update_filament.json)
  - Vérifications de disponibilité des modules (Settings, Offers, Printers, Customers, Calculator, Home)
  - Vérifications de disponibilité du stockage de données
  - Barre de progression avec messages d'état détaillés
  - Résumé avec états erreurs/avertissements/succès
  - Bouton de réexécution
- **Déplacé vers la section Gestion des Journaux** (emplacement plus logique)
- **Localisation complète** dans les 13 langues supportées

### ⚡ Performance du Visualiseur de Journaux
- **Défilement virtuel pour les fichiers de journal volumineux**:
  - Implémentation personnalisée de défilement virtuel pour le composant LogViewer
  - Seules les entrées de journal visibles sont rendues, améliorant considérablement les performances
  - Défilement et recherche fluides même avec des fichiers de journal énormes (100k+ lignes)
  - Maintient la position et la hauteur précises de la barre de défilement
  - Opérations de recherche et filtrage considérablement plus rapides

### 🔔 Système de Notifications Unifié
- **Service de notifications centralisé**:
  - Un seul `notificationService` pour les notifications Toast et de plateforme
  - Routage des notifications basé sur la priorité (haute priorité → notification de plateforme)
  - Prise de décision automatique basée sur l'état de l'application (premier plan/arrière-plan)
  - Rétrocompatible avec les fonctions de notification existantes
  - Paramètres de notification configurables (Toast activé/désactivé, notification de plateforme activée/désactivée, niveaux de priorité)

### 🎯 Améliorations UI/UX
- Diagnostic Système déplacé de la section Sauvegarde vers la section Gestion des Journaux (emplacement plus logique)
- Erreurs du linter TypeScript corrigées (variables non utilisées, écarts de type)
- Qualité du code et maintenabilité améliorées

---

## v1.8.0 (2025) - 📊 Système de Journalisation Avancé & Améliorations de Réinitialisation d'Usine

### 🔄 Modal de Progression de Réinitialisation d'Usine
- **Indicateur de progression visuel pour réinitialisation d'usine**:
  - Progression animée en 4 étapes (suppression de sauvegarde, suppression de journal, suppression de configuration, achèvement)
  - Mises à jour d'état en temps réel avec messages de succès/erreur
  - Compte à rebours de 10 secondes avant l'affichage du sélecteur de langue
  - Le modal ne peut pas être fermé pendant le processus de réinitialisation
  - Localisation complète dans les 13 langues supportées

### 📋 Révision Complète du Système de Journalisation
- **Infrastructure de journalisation professionnelle**:
  - Chemins de fichiers de journal multiplateformes (répertoires de données spécifiques à la plateforme)
  - Journalisation des informations système (CPU, mémoire, OS, GPU, disque, version de l'application)
  - Journalisation des informations de répertoires (dossiers de journaux et sauvegardes, nombre de fichiers, tailles)
  - Journalisation détaillée de l'état de chargement (succès/avertissement/erreur/critique)
  - Niveaux de journal (DEBUG, INFO, WARN, ERROR) avec filtrage
  - Support de format de journal structuré (texte et JSON)
  - Rotation de journal avec nettoyage automatique (jours de rétention configurables)
  - Modal du Visualiseur de Journaux avec filtrage, recherche, surlignage et exportation
  - Configuration du journal dans Paramètres (format, niveau, jours de rétention)
  - Contenu du fichier de journal préservé lors du redémarrage de l'application (mode append)

### 🔍 Diagnostic Système
- **Modal de vérification de l'état du système**:
  - Affichage et validation des informations système
  - Surveillance de l'utilisation de la mémoire avec avertissements
  - Vérifications d'existence de fichiers
  - Vérifications de disponibilité des modules
  - Tests de disponibilité du stockage de données
  - Affichage de la barre de progression et du résumé
  - Localisation complète dans les 13 langues supportées

### 🛠️ Améliorations Techniques
- Journalisation désactivée pendant la Réinitialisation d'Usine pour éviter la pollution du journal
- Création de data.json retardée jusqu'à la sélection de langue (processus de Réinitialisation d'Usine plus propre)
- Initialisation du fichier de journal retardée jusqu'à la sélection de langue
- Redémarrage automatique de l'application après sélection de langue
- Commandes backend pour la gestion des fichiers de sauvegarde et de journal
- Gestion des chemins multiplateformes pour les sauvegardes et journaux
- Calcul de la mémoire corrigé (compatibilité sysinfo 0.31)
- Avertissements de style React corrigés (conflits d'abréviation CSS)

---

## v1.7.0 (2025) - 💾 Système de sauvegarde, écran de chargement et améliorations de la bibliothèque de filaments

### 💾 Implémentation Complète du Système de Sauvegarde
- **Système automatique de sauvegarde** - Un fichier de sauvegarde par jour (créé uniquement un nouveau jour)
- **Hook de rappel de sauvegarde et composant UI** - Notification s'il n'y a pas de sauvegarde
- **UI d'Historique de Sauvegarde dans Paramètres** - Liste codée par couleurs (vert/jaune/rouge/gris) pour l'ancienneté du fichier de sauvegarde et compte à rebours de suppression
- **Fenêtre modale de sauvegarde automatique** - Explication lorsque la sauvegarde automatique est activée
- **Synchronisation de sauvegarde automatique et sauvegarde automatique** - Sauvegarde automatique lors de l'enregistrement avec sauvegarde automatique
- **Réinitialisation d'Usine avec suppression automatique des fichiers de sauvegarde**
- **L'historique de sauvegarde se met à jour automatiquement** lorsque la sauvegarde automatique est activée

### 🔧 Optimisation du Backend du Système de Sauvegarde
- **Commandes backend ajoutées** pour supprimer les anciennes sauvegardes (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Fonctions de nettoyage du frontend mises à jour pour utiliser les commandes backend**, éliminant les erreurs "forbidden path"
- **Toutes les opérations sur fichiers (créer, supprimer, lister) se produisent maintenant depuis le backend**, évitant les problèmes d'autorisations Tauri

### ⚡ Optimisation des Performances du Système de Sauvegarde
- `hasTodayBackup()` optimisé : utilise la commande backend `list_backup_files`, pas besoin de lire tous les fichiers
- **Mécanisme de verrouillage ajouté** pour prévenir les sauvegardes parallèles
- **Opération plus rapide** même avec un grand nombre de fichiers de sauvegarde

### 📁 Ouverture du Répertoire de Sauvegarde et Historique des Journaux
- **Bouton ajouté** dans la section Paramètres → Historique de Sauvegarde pour ouvrir le dossier de sauvegarde
- **Nouvelle section d'historique des journaux** dans Paramètres - lister et ouvrir les fichiers de journal
- **Suppression automatique des fichiers de journal** configurable par jours
- **Support multiplateforme** (macOS, Windows, Linux)

### 🎨 Révision Complète de l'Écran de Chargement
- **Logo de l'application intégré** comme arrière-plan avec effet glassmorphism
- **Mise en page fixe pour les coches** - Défilement automatique, seulement 3 modules visibles à la fois
- **Effet shimmer, animations de points pulsants**
- **Conteneur de défilement** avec barre de défilement cachée

### ⚙️ Améliorations du Processus de Chargement
- **Chargement ralenti** (délais de 800ms) - les messages de chargement sont lisibles
- **Gestion des erreurs pour tous les modules** (blocs try-catch)
- **Fichier de journal physique** pour tous les états et erreurs
- **Résumé de chargement** à la fin

### 🎨 Support Multilingue de la Bibliothèque de Filaments
- **Couleurs de filaments affichées** dans toutes les langues supportées (pas seulement Hongrois/Allemand/Anglais)
- **Logique de repli** : Anglais → Hongrois → Allemand → couleur/nom brut
- Composants Settings, GlobalSearch et Filaments mis à jour

### 🔄 Améliorations de Réinitialisation d'Usine
- **Suppression physique des fichiers** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Réinitialisation de l'instance Store** sans rechargement
- **Affichage du sélecteur de langue** après Réinitialisation d'Usine

### 🎓 Mise à Jour du Tutoriel avec les Nouvelles Fonctionnalités v1.7.0
- Nouvelles étapes : widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Données de démonstration étendues : 6 filaments → 11 filaments, 3 offres → 5 offres
- Clés de traduction ajoutées pour toutes les langues

---

## v1.6.0 (2025) - 📊 Widgets interactifs & optimisation des performances des grandes tableaux

### 🧠 Graphiques Interactifs et Vues Modales Détaillées
- **Les graphiques principaux du tableau de bord utilisent le composant unifié `InteractiveChart`** avec des points de données cliquables et une vue modale détaillée animée
- **Le tooltip et la vue détaillée sont localisés**, affichant des étiquettes lisibles par l'homme (revenus, coût, bénéfice net, nombre d'offres)
- **La période de temps peut être définie directement depuis le graphique de tendances** (hebdomadaire / mensuel / annuel) en utilisant le pinceau, les données tranchées s'écoulent vers Home → Dashboard

### 🧵 Défilement Virtuel pour les Grandes Listes
- **Défilement virtuel personnalisé** pour la liste des Offres et le tableau des Filaments – seules les lignes visibles sont rendues, assurant un défilement fluide même avec 10k+ enregistrements
- **Paramètres → Bibliothèque de Filaments** utilise le même modèle, maintenant la palette complète de 12,000+ couleurs réactive
- **La position/hauteur de la barre de défilement reste correcte** grâce aux éléments d'espacement au-dessus et en-dessous de la plage visible

### 📋 Tri et Filtrage Avancés des Tableaux
- **Tri multi-colonnes** sur les pages Filaments et Offres (clic : croissant/décroissant, Maj+clic : construire chaîne de tri – ex. "Marque ↑, puis Prix/kg ↓")
- **Paramètres de tri enregistrés dans `settings`**, donc l'ordre préféré persiste après redémarrage
- **Filaments** : filtres au niveau des colonnes pour marque, matériau/type et valeur couleur/HEX
- **Offres** : filtre de montant avec valeurs min/max et filtres de plage de dates (de / à)

---

**Dernière mise à jour** : 1er décembre 2025



- **Système automatique de sauvegarde** - Un fichier de sauvegarde par jour (créé uniquement un nouveau jour)
- **Hook de rappel de sauvegarde et composant UI** - Notification s'il n'y a pas de sauvegarde
- **UI d'Historique de Sauvegarde dans Paramètres** - Liste codée par couleurs (vert/jaune/rouge/gris) pour l'ancienneté du fichier de sauvegarde et compte à rebours de suppression
- **Fenêtre modale de sauvegarde automatique** - Explication lorsque la sauvegarde automatique est activée
- **Synchronisation de sauvegarde automatique et sauvegarde automatique** - Sauvegarde automatique lors de l'enregistrement avec sauvegarde automatique
- **Réinitialisation d'Usine avec suppression automatique des fichiers de sauvegarde**
- **L'historique de sauvegarde se met à jour automatiquement** lorsque la sauvegarde automatique est activée

### 🔧 Optimisation du Backend du Système de Sauvegarde
- **Commandes backend ajoutées** pour supprimer les anciennes sauvegardes (`cleanup_old_backups_by_days`, `cleanup_old_backups_by_count`)
- **Fonctions de nettoyage du frontend mises à jour pour utiliser les commandes backend**, éliminant les erreurs "forbidden path"
- **Toutes les opérations sur fichiers (créer, supprimer, lister) se produisent maintenant depuis le backend**, évitant les problèmes d'autorisations Tauri

### ⚡ Optimisation des Performances du Système de Sauvegarde
- `hasTodayBackup()` optimisé : utilise la commande backend `list_backup_files`, pas besoin de lire tous les fichiers
- **Mécanisme de verrouillage ajouté** pour prévenir les sauvegardes parallèles
- **Opération plus rapide** même avec un grand nombre de fichiers de sauvegarde

### 📁 Ouverture du Répertoire de Sauvegarde et Historique des Journaux
- **Bouton ajouté** dans la section Paramètres → Historique de Sauvegarde pour ouvrir le dossier de sauvegarde
- **Nouvelle section d'historique des journaux** dans Paramètres - lister et ouvrir les fichiers de journal
- **Suppression automatique des fichiers de journal** configurable par jours
- **Support multiplateforme** (macOS, Windows, Linux)

### 🎨 Révision Complète de l'Écran de Chargement
- **Logo de l'application intégré** comme arrière-plan avec effet glassmorphism
- **Mise en page fixe pour les coches** - Défilement automatique, seulement 3 modules visibles à la fois
- **Effet shimmer, animations de points pulsants**
- **Conteneur de défilement** avec barre de défilement cachée

### ⚙️ Améliorations du Processus de Chargement
- **Chargement ralenti** (délais de 800ms) - les messages de chargement sont lisibles
- **Gestion des erreurs pour tous les modules** (blocs try-catch)
- **Fichier de journal physique** pour tous les états et erreurs
- **Résumé de chargement** à la fin

### 🎨 Support Multilingue de la Bibliothèque de Filaments
- **Couleurs de filaments affichées** dans toutes les langues supportées (pas seulement Hongrois/Allemand/Anglais)
- **Logique de repli** : Anglais → Hongrois → Allemand → couleur/nom brut
- Composants Settings, GlobalSearch et Filaments mis à jour

### 🔄 Améliorations de Réinitialisation d'Usine
- **Suppression physique des fichiers** (`data.json`, `filamentLibrary.json`, `update_filamentLibrary.json`)
- **Réinitialisation de l'instance Store** sans rechargement
- **Affichage du sélecteur de langue** après Réinitialisation d'Usine

### 🎓 Mise à Jour du Tutoriel avec les Nouvelles Fonctionnalités v1.7.0
- Nouvelles étapes : widget-interactivity, table-sorting, autosave-backup, filament-library-multilang
- Données de démonstration étendues : 6 filaments → 11 filaments, 3 offres → 5 offres
- Clés de traduction ajoutées pour toutes les langues

---

## v1.6.0 (2025) - 📊 Widgets interactifs & optimisation des performances des grandes tableaux

### 🧠 Graphiques Interactifs et Vues Modales Détaillées
- **Les graphiques principaux du tableau de bord utilisent le composant unifié `InteractiveChart`** avec des points de données cliquables et une vue modale détaillée animée
- **Le tooltip et la vue détaillée sont localisés**, affichant des étiquettes lisibles par l'homme (revenus, coût, bénéfice net, nombre d'offres)
- **La période de temps peut être définie directement depuis le graphique de tendances** (hebdomadaire / mensuel / annuel) en utilisant le pinceau, les données tranchées s'écoulent vers Home → Dashboard

### 🧵 Défilement Virtuel pour les Grandes Listes
- **Défilement virtuel personnalisé** pour la liste des Offres et le tableau des Filaments – seules les lignes visibles sont rendues, assurant un défilement fluide même avec 10k+ enregistrements
- **Paramètres → Bibliothèque de Filaments** utilise le même modèle, maintenant la palette complète de 12,000+ couleurs réactive
- **La position/hauteur de la barre de défilement reste correcte** grâce aux éléments d'espacement au-dessus et en-dessous de la plage visible

### 📋 Tri et Filtrage Avancés des Tableaux
- **Tri multi-colonnes** sur les pages Filaments et Offres (clic : croissant/décroissant, Maj+clic : construire chaîne de tri – ex. "Marque ↑, puis Prix/kg ↓")
- **Paramètres de tri enregistrés dans `settings`**, donc l'ordre préféré persiste après redémarrage
- **Filaments** : filtres au niveau des colonnes pour marque, matériau/type et valeur couleur/HEX
- **Offres** : filtre de montant avec valeurs min/max et filtres de plage de dates (de / à)

---

**Dernière mise à jour** : 1er décembre 2025


