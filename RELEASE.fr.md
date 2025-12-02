# 📋 Notes de Version - 3DPrinterCalcApp

Ce document contient le journal des modifications détaillé pour toutes les versions de l'application 3D Printer Calculator.

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


