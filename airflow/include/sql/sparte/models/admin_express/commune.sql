{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['departement'], 'type': 'btree'},
            {'columns': ['region'], 'type': 'btree'},
            {'columns': ['epci'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'},
        ]
    )
}}

SELECT *, 32620 as srid_source FROM {{ ref('commune_guadeloupe') }}
UNION ALL
SELECT *, 32620 as srid_source FROM {{ ref('commune_martinique') }}
UNION ALL
SELECT *, 2972 as srid_source FROM {{ ref('commune_guyane') }}
UNION ALL
SELECT *, 2975 as srid_source FROM {{ ref('commune_reunion') }}
UNION ALL
SELECT *, 2154 as srid_source FROM {{ ref('commune_metropole') }}
