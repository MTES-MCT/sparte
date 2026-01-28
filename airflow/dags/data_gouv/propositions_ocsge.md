# Propositions de données OCS GE à publier sur data.gouv

## Données déjà publiées

- Imperméabilisation des communes de France (gpkg + csv)
- Artificialisation des communes de France (gpkg)
- Part du territoire français couvert par l'OCS GE (csv)
- Trajectoires ZAN des communes de France (csv)

---

## Modèles créés pour l'export

Les modèles fusionnent les données de stock et de flux pour faciliter l'utilisation. Chaque modèle contient :
- **Stock** : `pourcent_*`, `surface_*` (état à la fin de la période)
- **Flux** : `flux_*`, `flux_des*`, `flux_*_net`, `millesime_debut`, `millesime_fin`

### Artificialisation par niveau administratif

| Dataset | Format | Description | Modèle dbt |
|---------|--------|-------------|------------|
| Artificialisation des communes | gpkg, csv | Stock et flux d'artificialisation par commune | `for_export/ocsge/for_export_artif_commune.sql` |
| Artificialisation des EPCI | gpkg, csv | Stock et flux d'artificialisation par EPCI | `for_export/ocsge/for_export_artif_epci.sql` |
| Artificialisation des SCOT | gpkg, csv | Stock et flux d'artificialisation par SCOT | `for_export/ocsge/for_export_artif_scot.sql` |
| Artificialisation des départements | gpkg, csv | Stock et flux d'artificialisation par département | `for_export/ocsge/for_export_artif_departement.sql` |
| Artificialisation des régions | gpkg, csv | Stock et flux d'artificialisation par région | `for_export/ocsge/for_export_artif_region.sql` |

### Imperméabilisation par niveau administratif

| Dataset | Format | Description | Modèle dbt |
|---------|--------|-------------|------------|
| Imperméabilisation des communes | gpkg, csv | Stock et flux d'imperméabilisation par commune | `for_export/ocsge/for_export_imper_commune.sql` |
| Imperméabilisation des EPCI | gpkg, csv | Stock et flux d'imperméabilisation par EPCI | `for_export/ocsge/for_export_imper_epci.sql` |
| Imperméabilisation des SCOT | gpkg, csv | Stock et flux d'imperméabilisation par SCOT | `for_export/ocsge/for_export_imper_scot.sql` |
| Imperméabilisation des départements | gpkg, csv | Stock et flux d'imperméabilisation par département | `for_export/ocsge/for_export_imper_departement.sql` |
| Imperméabilisation des régions | gpkg, csv | Stock et flux d'imperméabilisation par région | `for_export/ocsge/for_export_imper_region.sql` |

---

## Structure des données

### Colonnes communes

| Colonne | Description |
|---------|-------------|
| `*_code` | Code du territoire (commune_code, epci_code, etc.) |
| `nom` | Nom du territoire |
| `millesime_debut` | Année de début de la période |
| `millesime_fin` | Année de fin de la période |
| `geom` | Géométrie (SRID 4326) |

### Colonnes spécifiques artificialisation

| Colonne | Description |
|---------|-------------|
| `pourcent_artif` | Pourcentage de surface artificialisée (stock) |
| `surface_artif` | Surface artificialisée en hectares (stock) |
| `flux_artif` | Surface nouvellement artificialisée sur la période |
| `flux_desartif` | Surface désartificialisée sur la période |
| `flux_artif_net` | Artificialisation nette (flux_artif - flux_desartif) |

### Colonnes spécifiques imperméabilisation

| Colonne | Description |
|---------|-------------|
| `pourcent_imper` | Pourcentage de surface imperméabilisée (stock) |
| `surface_imper` | Surface imperméabilisée en hectares (stock) |
| `flux_imper` | Surface nouvellement imperméabilisée sur la période |
| `flux_desimper` | Surface désimperméabilisée sur la période |
| `flux_imper_net` | Imperméabilisation nette (flux_imper - flux_desimper) |

---

## Notes techniques

- **Millésimes disponibles** : 2016-2023 selon les départements
- **Couverture** : ~96% de la France métropolitaine
- **SRID** : 4326 (WGS84)
- **Formats recommandés** : CSV pour les données tabulaires, GeoPackage pour les données géographiques
- **Fréquence de mise à jour** : Annuelle (nouveaux millésimes IGN)
- **Jointure stock/flux** : Les données de stock correspondent à l'état au `millesime_fin`
