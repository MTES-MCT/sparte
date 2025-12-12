{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['land_id'], 'type': 'btree'},
            {'columns': ['land_type'], 'type': 'btree'},
            {'columns': ['distance_rank'], 'type': 'btree'},
            {'columns': ['nearest_land_id'], 'type': 'btree'},
        ]
    )
}}

/*
    Agrégation de tous les territoires voisins les plus proches pour l'application.
    Ce modèle combine les résultats de tous les types de territoires.
    Utilisé pour la comparaison avec les territoires voisins dans l'interface.
*/

SELECT * FROM {{ ref('nearest_territories_commune') }}
UNION ALL
SELECT * FROM {{ ref('nearest_territories_epci') }}
UNION ALL
SELECT * FROM {{ ref('nearest_territories_departement') }}
UNION ALL
SELECT * FROM {{ ref('nearest_territories_region') }}
UNION ALL
SELECT * FROM {{ ref('nearest_territories_scot') }}
