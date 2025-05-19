{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['region'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['srid_source'], 'type': 'btree'},
        ])
}}

SELECT *, 32620 as srid_source FROM {{ ref('departement_guadeloupe') }}
UNION ALL
SELECT *, 32620 as srid_source FROM {{ ref('departement_martinique') }}
UNION ALL
SELECT *, 2972 as srid_source FROM {{ ref('departement_guyane') }}
UNION ALL
SELECT *, 2975 as srid_source FROM {{ ref('departement_reunion') }}
UNION ALL
SELECT *, 2154 as srid_source FROM {{ ref('departement_metropole') }}
