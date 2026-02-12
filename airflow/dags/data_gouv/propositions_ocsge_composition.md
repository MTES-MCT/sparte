# Propositions d'exports sur la composition de l'artificialisation et de l'imperméabilisation

## Objectif

Publier des données détaillant la **composition** de l'artificialisation et de l'imperméabilisation, c'est-à-dire la répartition par :
- **Couverture du sol (CS)** : nature physique du terrain (bâti, routes, végétation, etc.)
- **Usage du sol (US)** : fonction socio-économique (habitat, activité, transport, etc.)

---

## Modèles sources existants

### Par couverture du sol (CS)

| Niveau | Artif | Imper |
|--------|-------|-------|
| Commune | `artif_commune_by_couverture.sql` | `imper_commune_by_couverture.sql` |
| EPCI | `artif_epci_by_couverture.sql` | `imper_epci_by_couverture.sql` |
| SCOT | `artif_scot_by_couverture.sql` | `imper_scot_by_couverture.sql` |
| Département | `artif_departement_by_couverture.sql` | `imper_departement_by_couverture.sql` |
| Région | `artif_region_by_couverture.sql` | `imper_region_by_couverture.sql` |

### Par usage du sol (US)

| Niveau | Artif | Imper |
|--------|-------|-------|
| Commune | `artif_commune_by_usage.sql` | `imper_commune_by_usage.sql` |
| EPCI | `artif_epci_by_usage.sql` | `imper_epci_by_usage.sql` |
| SCOT | `artif_scot_by_usage.sql` | `imper_scot_by_usage.sql` |
| Département | `artif_departement_by_usage.sql` | `imper_departement_by_usage.sql` |
| Région | `artif_region_by_usage.sql` | `imper_region_by_usage.sql` |

---

## Propositions d'exports

### Option 1 : Un fichier par type de décomposition (recommandé)

Fusionner stock et flux comme pour les modèles principaux, avec une ligne par territoire × période × code CS/US.

| Dataset | Format | Description |
|---------|--------|-------------|
| Composition artif par couverture - Communes | csv | Détail par code CS pour chaque commune |
| Composition artif par couverture - EPCI | csv | Détail par code CS pour chaque EPCI |
| Composition artif par couverture - SCOT | csv | Détail par code CS pour chaque SCOT |
| Composition artif par couverture - Départements | csv | Détail par code CS pour chaque département |
| Composition artif par couverture - Régions | csv | Détail par code CS pour chaque région |
| Composition imper par couverture - Communes | csv | Détail par code CS pour chaque commune |
| Composition imper par couverture - EPCI | csv | Détail par code CS pour chaque EPCI |
| Composition imper par couverture - SCOT | csv | Détail par code CS pour chaque SCOT |
| Composition imper par couverture - Départements | csv | Détail par code CS pour chaque département |
| Composition imper par couverture - Régions | csv | Détail par code CS pour chaque région |
| Composition artif par usage - Communes | csv | Détail par code US pour chaque commune |
| Composition artif par usage - EPCI | csv | Détail par code US pour chaque EPCI |
| Composition artif par usage - SCOT | csv | Détail par code US pour chaque SCOT |
| Composition artif par usage - Départements | csv | Détail par code US pour chaque département |
| Composition artif par usage - Régions | csv | Détail par code US pour chaque région |
| Composition imper par usage - Communes | csv | Détail par code US pour chaque commune |
| Composition imper par usage - EPCI | csv | Détail par code US pour chaque EPCI |
| Composition imper par usage - SCOT | csv | Détail par code US pour chaque SCOT |
| Composition imper par usage - Départements | csv | Détail par code US pour chaque département |
| Composition imper par usage - Régions | csv | Détail par code US pour chaque région |

**Total : 20 fichiers**

### Option 2 : Agrégation par niveau administratif

Un seul fichier par niveau administratif contenant artif + imper + couverture + usage.

| Dataset | Format | Description |
|---------|--------|-------------|
| Composition OCS GE - Communes | csv | Artif et imper par CS et US |
| Composition OCS GE - EPCI | csv | Artif et imper par CS et US |
| Composition OCS GE - SCOT | csv | Artif et imper par CS et US |
| Composition OCS GE - Départements | csv | Artif et imper par CS et US |
| Composition OCS GE - Régions | csv | Artif et imper par CS et US |

**Total : 5 fichiers**

---

## Structure des données proposée

### Colonnes communes

| Colonne | Description |
|---------|-------------|
| `*_code` | Code du territoire |
| `nom` | Nom du territoire |
| `millesime_debut` | Année de début |
| `millesime_fin` | Année de fin |

### Colonnes spécifiques couverture (CS)

| Colonne | Description |
|---------|-------------|
| `code_cs` | Code couverture du sol (ex: CS1.1.1.1) |
| `label_cs` | Libellé de la couverture |
| `surface_stock` | Surface en ha (stock à millesime_fin) |
| `surface_flux` | Surface de flux sur la période |

### Colonnes spécifiques usage (US)

| Colonne | Description |
|---------|-------------|
| `code_us` | Code usage du sol (ex: US1.1) |
| `label_us` | Libellé de l'usage |
| `surface_stock` | Surface en ha (stock à millesime_fin) |
| `surface_flux` | Surface de flux sur la période |

---

## Nomenclature OCS GE

### Couverture du sol (CS) - 14 catégories principales

| Code | Libellé |
|------|---------|
| CS1.1.1.1 | Zones bâties |
| CS1.1.1.2 | Zones non bâties (routes, parkings, etc.) |
| CS1.1.2.1 | Zones à matériaux minéraux |
| CS1.1.2.2 | Zones à autres matériaux composites |
| CS1.2.1 | Sols nus (sable, rochers) |
| CS1.2.2 | Surfaces d'eau |
| CS1.2.3 | Névés et glaciers |
| CS2.1.1 | Peuplements de feuillus |
| CS2.1.2 | Peuplements de conifères |
| CS2.1.3 | Peuplements mixtes |
| CS2.2.1 | Formations arbustives et sous-arbrisseaux |
| CS2.2.2 | Autres formations ligneuses |
| CS2.3 | Formations herbacées |
| Sans objet | Sans objet |

### Usage du sol (US) - 43 catégories

Catégories principales :
- **US1** : Production primaire (agriculture, sylviculture, pêche)
- **US2** : Production secondaire (industrie, artisanat)
- **US3** : Production tertiaire (commerce, services)
- **US4** : Réseaux de transport
- **US5** : Autres usages (habitat, loisirs, etc.)
- **US6** : Usage inconnu

---

## Priorités suggérées

### Haute priorité
1. **Composition artif par couverture - Communes** : Permet de comprendre la nature de l'artificialisation
2. **Composition artif par usage - Communes** : Permet de comprendre les causes de l'artificialisation

### Moyenne priorité
3. Composition par couverture/usage aux niveaux EPCI et département
4. Composition imperméabilisation

### Basse priorité
5. Niveaux SCOT et région (agrégation haute, moins de détail pertinent)

---

## Notes techniques

- **Volume de données** : ~35 000 communes × ~14 codes CS × n périodes = plusieurs millions de lignes
- **Format recommandé** : CSV uniquement (pas de géométrie dans ces exports)
- **Fréquence de mise à jour** : Annuelle
