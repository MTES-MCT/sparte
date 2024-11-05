{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['id'], 'type': 'btree'},
            {'columns': ['code'], 'type': 'btree'},
            {'columns': ['name'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'}
        ])
}}

SELECT
    *,
    32620 AS srid_source
FROM {{ ref('region_guadeloupe') }}
UNION ALL
SELECT
    *,
    32620 AS srid_source
FROM {{ ref('region_martinique') }}
UNION ALL
SELECT
    *,
    2972 AS srid_source
FROM {{ ref('region_guyane') }}
UNION ALL
SELECT
    *,
    2975 AS srid_source
FROM {{ ref('region_reunion') }}
UNION ALL
SELECT
    *,
    2154 AS srid_source
FROM {{ ref('region_metropole') }}
