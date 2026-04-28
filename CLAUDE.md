# CLAUDE.md — Projet Escale

Ce fichier fournit le contexte et les directives pour Claude Code sur le projet **Escale**.

---

## Contexte du projet

**Escale** est une application web de suivi personnel d'investissements. Elle se présente comme un *carnet de route* qui transforme des données financières en vision claire via un dashboard intuitif.

**Tagline :** *Prêt à piloter vos investissements comme un pro ?*

**Problème résolu :** Les investisseurs manquent de visibilité globale et d'outils de suivi personnalisé pour structurer et piloter leurs investissements simplement.

---

## Cible utilisateur

**Primo-investisseurs** — personnes débutant dans l'investissement, cherchant simplicité et clarté sans jargon financier complexe.

---

## Fonctionnalités principales

### 1. Journal de bord & Planner
- Suivi chronologique des actions et décisions d'investissement
- Planification des prochaines étapes et objectifs

### 2. Map
- Cartographie visuelle du portefeuille
- Vue d'ensemble géographique ou catégorielle des projets

### 3. Coffre-fort à projets
- Centralisation sécurisée des projets d'investissement
- Stockage et organisation des données par projet

---

## Modèle économique

- **Freemium** : accès gratuit aux fonctionnalités de base, premium pour les fonctionnalités avancées
- Objectif : faciliter l'adoption puis monétiser par la valeur ajoutée

---

## Principes de développement

- Approche **agile** : livraisons itératives, MVP centré sur les 3 fonctionnalités clés
- **Sécurité des données** : priorité absolue (données financières sensibles)
- **Conformité réglementaire** : respecter les standards en vigueur (RGPD minimum)
- **Communauté** : prévoir des fonctionnalités sociales et collaboratives à terme

---

## Conventions & directives pour Claude Code

### Style de code
- Commenter en **français** pour les commentaires métier, anglais acceptable pour les commentaires techniques
- Nommer les variables et fonctions en **anglais** (camelCase pour JS/TS, snake_case pour Python)
- Préférer la lisibilité à la concision
- **Tout texte visible par l'utilisateur doit passer par `t()` (i18n)** : ajouter la clé dans `src/lib/i18n.ts` en français ET en anglais. Ne jamais écrire de texte UI en dur dans les composants.

### Architecture
- Séparer clairement la logique métier (investissements, calculs) des composants UI
- Prévoir la scalabilité : les utilisateurs auront potentiellement de nombreux projets et transactions
- Données financières → toujours valider et sanitiser les inputs

### Priorités de développement
1. Fonctionnalités core (Journal, Map, Coffre-fort) avant tout ajout
2. UX simple et intuitive — la cible est non-technique
3. Sécurité et fiabilité des données
4. Performance du dashboard

### Tests
- Tester les calculs financiers en priorité (erreurs critiques)
- Valider les cas limites : portefeuille vide, valeurs négatives, dates invalides

---

## Optimisation des tokens — Choix de modèle

Pour réduire le coût en tokens, utiliser le modèle le plus léger adapté à la tâche.

### Haiku 4.5 — tâches légères, rapides, répétitives
Lancer les agents `subagent_type: Explore` ou `general-purpose` avec `"model": "haiku"` pour :
- Exploration de fichiers et recherche de symboles (`grep`, `find`, lecture de fichiers)
- Vérification de l'existence d'un fichier, d'une clé i18n, d'un import
- Listing de routes, composants, ou migrations existantes
- Extraction d'une valeur précise dans un fichier connu
- Tâches de type "est-ce que X existe ?" ou "où est défini Y ?"

### Sonnet 4.6 — tâches de raisonnement et génération
Garder Sonnet (modèle par défaut de la conversation) pour :
- Écriture et modification de code métier (calculs financiers, logique)
- Refactoring ou architecture de composants
- Décisions de design (structure de données, API, schéma BDD)
- Génération de nouveaux composants UI complets
- Résolution de bugs complexes nécessitant du contexte global
- Revues de code, sécurité, conformité

### Règle pratique
> Si la tâche se résume à **lire et rapporter**, utiliser Haiku.  
> Si la tâche nécessite de **comprendre, créer ou décider**, garder Sonnet.

---

## Ce que Claude Code doit éviter

- Ne pas sur-complexifier l'architecture pour un MVP
- Ne pas utiliser de jargon financier avancé dans l'UI (la cible est débutante)
- Ne pas stocker de données sensibles en clair
- Ne pas créer de dépendances inutiles

---

## Ressources & références

- Brief complet du projet : `brief_escale.md`
- Citation de référence produit : *« La stratégie consiste à faire des choix clairs basés sur une compréhension globale. »* — Michael Porter

---

*Ce fichier doit être maintenu à jour à chaque évolution majeure du projet.*
