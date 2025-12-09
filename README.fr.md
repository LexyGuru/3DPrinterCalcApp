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
- 🎨 **Bibliothèque de couleurs de filament** - Plus de 12 000 couleurs d'usine avec panneaux sélectionnables basés sur marque et type
- 💾 **Éditeur de bibliothèque de filaments** - Ajout/modification basé sur modal, avertissements de doublons et sauvegarde persistante dans `filamentLibrary.json`
- 🖼️ **Images de filament dans PDF** - Afficher les logos de filament et échantillons de couleur dans les PDF générés
- 🧾 **Importation G-code et création de brouillon** - Charger les exportations G-code/JSON (Prusa, Cura, Orca, Qidi) depuis modal dans la calculatrice, avec résumé détaillé et génération automatique de brouillon de devis
- 📈 **Statistiques** - Tableau de bord de résumé pour consommation de filament, revenus, profit
- 👥 **Base de données clients** - Gestion des clients avec informations de contact, détails d'entreprise et statistiques d'offres
- 🔒 **Chiffrement des données clients** - Chiffrement AES-256-GCM pour les données clients, protection des données conforme au RGPD/UE, protection par mot de passe optionnelle
- 📊 **Historique et tendances des prix** - Suivi des changements de prix de filament avec graphiques et statistiques
- 🌍 **Multilingue** - Traduction complète en hongrois, anglais, allemand, français, chinois simplifié, tchèque, espagnol, italien, polonais, portugais, slovaque, ukrainien et russe (14 langues, 850+ clés de traduction par langue)
- 💱 **Plusieurs devises** - EUR, HUF, USD, GBP, PLN, CZK, CNY, UAH, RUB (9 devises)
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

## 🌿 Structure des branches

- **`main`**: Versions de release stables (build RELEASE)
- **`beta`**: Versions bêta et développement (build BETA)

Lors du push vers la branche `beta`, le workflow GitHub Actions s'exécute automatiquement, compilant la version bêta.

## 📋 Historique des versions

For detailed version history and changelog, please see [RELEASE.fr.md](RELEASE.fr.md).

---

**Version**: 3.0.4

Si vous avez des questions ou trouvez un bug, veuillez ouvrir une issue dans le dépôt GitHub!

